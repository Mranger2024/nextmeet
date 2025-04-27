'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserX, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface Friend {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  status: 'online' | 'offline'
  last_seen: string | null
  chatId?: string
}

interface Chat {
  id: string;
  name: string;
  participants: { id: string; username: string; avatar_url?: string | null }[];
  is_group: boolean;
  created_at: string;
}

interface FriendsPanelProps {
  setActivePanel: (panel: 'messages' | 'friends' | 'groups' | 'rooms') => void;
  setSelectedChat: (chat: Chat) => void;
}

export default function FriendsPanel({ setActivePanel, setSelectedChat }: FriendsPanelProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        fetchFriends(user.id)
        // Update user's presence
        await supabase
          .from('presence')
          .upsert({ id: user.id, status: 'online', last_seen: new Date().toISOString() })
      }
    }
    getCurrentUser()

    // Set up presence channel
    const channel = supabase.channel('online-users')
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        console.log('Presence state:', newState)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setFriends(prev => prev.map(friend => 
          newPresences.some(p => p.user_id === friend.id)
            ? { ...friend, status: 'online' }
            : friend
        ))
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setFriends(prev => prev.map(friend => 
          leftPresences.some(p => p.user_id === friend.id)
            ? { ...friend, status: 'offline' }
            : friend
        ))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && currentUserId) {
          await channel.track({ user_id: currentUserId })
        }
      })

    return () => {
      // Update status to offline when component unmounts
      if (currentUserId) {
        supabase
          .from('presence')
          .update({ status: 'offline', last_seen: new Date().toISOString() })
          .eq('id', currentUserId)
      }
      channel.unsubscribe()
    }
  }, [currentUserId])

  const fetchFriends = async (userId: string) => {
    try {
      const { data: friendConnections, error: friendError } = await supabase
        .from('friends')
        .select(`
          friend_id,
          user_id
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted')

      if (friendError) throw friendError

      if (!friendConnections?.length) {
        setFriends([])
        return
      }

      const friendIds = friendConnections.map(conn => 
        conn.user_id === userId ? conn.friend_id : conn.user_id
      )

      // First get profiles
      const { data: friendProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', friendIds)

      if (profileError) throw profileError

      // Then get presence data
      const { data: presenceData, error: presenceError } = await supabase
        .from('presence')
        .select('id, status, last_seen')
        .in('id', friendIds)

      if (presenceError) throw presenceError

      // Combine the data
      const transformedFriends = friendProfiles.map(profile => {
        const presence = presenceData?.find(p => p.id === profile.id)
        return {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          status: presence?.status || 'offline',
          last_seen: presence?.last_seen || null
        }
      })

      setFriends(transformedFriends)
    } catch (error) {
      console.error('Error fetching friends:', error instanceof Error ? error.message : 'Unknown error')
      toast.error('Failed to load friends')
    } finally {
      setIsLoading(false)
    }
  }

  const removeFriend = async (friendId: string) => {
    try {
      if (!currentUserId) return;

      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`);

      if (error) throw error;

      setFriends(prev => prev.filter(friend => friend.id !== friendId));
      toast.success('Friend removed');
    } catch (error) {
      console.error('Error removing friend:', error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to remove friend');
    }
  };

  const startChat = async (friendId: string) => {
    try {
      if (!currentUserId) return;

      // First get all chats where current user is a participant
      const { data: userChats, error: userChatsError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', currentUserId);

      if (userChatsError) throw userChatsError;

      // Then get all chats where friend is a participant
      const { data: friendChats, error: friendChatsError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', friendId);

      if (friendChatsError) throw friendChatsError;

      // Find common chats
      const userChatIds = userChats.map(chat => chat.chat_id);
      const friendChatIds = friendChats.map(chat => chat.chat_id);
      const commonChatIds = userChatIds.filter(id => friendChatIds.includes(id));

      // Check if there's an existing non-group chat
      let chatId;
      if (commonChatIds.length > 0) {
        const { data: existingChat, error: chatError } = await supabase
          .from('chats')
          .select('id')
          .eq('is_group', false)
          .in('id', commonChatIds)
          .single();
      
        if (chatError && chatError.code !== 'PGRST116') throw chatError;
        if (existingChat) chatId = existingChat.id;
      }
  
      if (!chatId) {
        // Create new chat
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            is_group: false,
            created_by: currentUserId
          })
          .select()
          .single();
  
        if (createError) throw createError;
        chatId = newChat.id;
  
        // Add participants in a single transaction to avoid policy recursion
        const { error: participantsError } = await supabase
          .rpc('add_chat_participants', {
            p_chat_id: chatId,
            p_user_ids: [currentUserId, friendId]
          });

        if (participantsError) throw participantsError;
      }
  
      // Update selected chat
      const selectedFriend = friends.find(f => f.id === friendId);
      if (!selectedFriend) throw new Error('Friend not found');
      
      setSelectedChat({
        id: chatId,
        name: selectedFriend.display_name || selectedFriend.username,
        is_group: false,
        created_at: new Date().toISOString(),
        participants: [{
          id: friendId,
          username: selectedFriend.username,
          avatar_url: selectedFriend.avatar_url
        }]
      });
  
      // Switch to chat panel
      setActivePanel('messages');
    } catch (error) {
      console.error('Error starting chat:', error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to start chat');
    }
  };

    return (
    <div className="h-full p-2 flex flex-col backdrop-blur-xl shadow-lg shadow-black/50 rounded-2xl">
      <div className="p-4 bg-gray-950/80 backdrop-blur-2xl rounded-2xl ">
        <h2 className="text-xl font-semibold">Friends</h2>
      </div>

      <div className="flex-1 overflow-y-auto mt-2 p-3 bg-black/10 backdrop-blur-2xl rounded-2xl">
        {isLoading ? (
          <div className="text-center text-gray-400">Loading friends...</div>
        ) : friends.length > 0 ? (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-4 rounded-lg bg-blue-900/20 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="relative w-10 h-10">
                      <Image
                        src={friend.avatar_url || '/default-avatar.png'}
                        alt={friend.display_name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span 
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 
                        ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{friend.display_name || friend.username}</p>
                    <p className="text-sm text-gray-400">@{friend.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startChat(friend.id)}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-all"
                    title="Start chat"
                  >
                    <MessageCircle size={20} />
                  </button>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all"
                    title="Remove friend"
                  >
                    <UserX size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-10">
            <p>No friends yet</p>
            <p className="text-sm mt-2">
              Use the Find Friends tab to connect with others
            </p>
          </div>
        )}
      </div>

    </div>
  )
}