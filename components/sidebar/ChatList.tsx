'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageSquare, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface ChatParticipant {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  last_seen_at?: string;
}

interface ChatData {
  id: string;
  chat_participants: {
    user: ChatParticipant;
  }[];
}

interface Chat {
  id: string;
  name?: string;
  is_group: boolean;
  avatar_url?: string;
  unread_count: number;
  last_message?: string;
  last_message_time?: string;
  has_typing_users: boolean;
  participants: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    online?: boolean;
  }[];
}

interface ChatListProps {
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  currentUserId: string;
}

export default function ChatList({ selectedChat, setSelectedChat, currentUserId }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typingDots, setTypingDots] = useState(0)

  // Animate typing dots
  useEffect(() => {
    if (chats.some(chat => chat.has_typing_users)) {
      const interval = setInterval(() => {
        setTypingDots(prev => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [chats]);

  const getTypingIndicator = () => {
    return 'typing' + '.'.repeat(typingDots);
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Get user's chats
        const { data: participations, error: participationsError } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('user_id', currentUserId);

        if (participationsError) throw participationsError;

        if (!participations?.length) {
          setChats([]);
          setLoading(false);
          return;
        }

        const chatIds = participations.map(p => p.chat_id);

        // Get chat details with participants
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select(`
            id,
            chat_participants (
              user:profiles (
                id,
                username,
                display_name,
                avatar_url,
                last_seen_at
              )
            )
          `) as { data: ChatData[] | null, error: Error | null };

        if (chatError) throw chatError;

        if (!chatData) {
          setChats([]);
          setLoading(false);
          return;
        }

        // Get last messages and unread counts
        const { data: messageData, error: messageError } = await supabase
          .from('chat_messages')
          .select('*')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false });

        if (messageError) throw messageError;

        // Get typing status
        const { data: typingData, error: typingError } = await supabase
          .from('chat_typing_status')
          .select('chat_id, user_id')
          .in('chat_id', chatIds)
          .eq('typing', true);

        if (typingError) throw typingError;

        // Get last seen messages
        const { data: lastSeenData, error: lastSeenError } = await supabase
          .from('chat_message_status')
          .select('chat_id, last_seen_at')
          .eq('user_id', currentUserId);

        if (lastSeenError) throw lastSeenError;

        // Process chat data
        const processedChats = chatData.map(chat => {
          const participants = chat.chat_participants
            .map(p => ({
              id: p.user.id,
              username: p.user.username,
              display_name: p.user.display_name,
              avatar_url: p.user.avatar_url,
              online: p.user.last_seen_at ? new Date(p.user.last_seen_at) > new Date(Date.now() - 2 * 60 * 1000) : false
            }))
            .filter(p => p.id !== currentUserId);

          const chatMessages = messageData.filter(m => m.chat_id === chat.id);
          const lastMessage = chatMessages[0];
          const lastSeen = lastSeenData?.find(ls => ls.chat_id === chat.id)?.last_seen_at;
          const unreadCount = chatMessages.filter(m => 
            m.sender_id !== currentUserId && 
            (!lastSeen || new Date(m.created_at) > new Date(lastSeen))
          ).length;

          const typingUsers = typingData
            ?.filter(t => t.chat_id === chat.id && t.user_id !== currentUserId)
            ?.length > 0;

          const otherParticipant = participants[0];
          
          return {
            id: chat.id,
            name: otherParticipant?.display_name || otherParticipant?.username || '',
            avatar_url: otherParticipant?.avatar_url || '',
            is_group: participants.length > 1,
            unread_count: unreadCount,
            last_message: lastMessage?.content || '',
            last_message_time: lastMessage?.created_at || '',
            has_typing_users: typingUsers,
            participants: participants
          } satisfies Chat;
        });

        // Sort chats by typing status, unread count, and last message time
        const sortedChats = processedChats.sort((a, b) => {
          if (a.has_typing_users && !b.has_typing_users) return -1;
          if (!a.has_typing_users && b.has_typing_users) return 1;
          if (a.unread_count !== b.unread_count) return b.unread_count - a.unread_count;
          return new Date(b.last_message_time || 0).getTime() - new Date(a.last_message_time || 0).getTime();
        });

        setChats(sortedChats);
        setError(null);
      } catch (error: unknown) {
        console.error('Error fetching chats:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        toast.error('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Subscribe to chat updates
    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        () => fetchChats()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_status'
        },
        () => fetchChats()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return days === 1 ? 'Yesterday' : `${days}d ago`;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) {
      return `${hours}h ago`;
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    
    return 'Just now';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-900/50 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-full text-red-400"
          >
            <XCircle className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">Failed to load chats</p>
            <p className="text-sm">Please try again later</p>
          </motion.div>
        ) : chats.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-full text-gray-400"
          >
            <MessageSquare className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No chats yet</p>
            <p className="text-sm">Start a chat from your friends list</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </motion.div>
        ) : (
          chats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                p-4 cursor-pointer transition-all border-b border-gray-800/10
                ${selectedChat?.id === chat.id 
                  ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 shadow-lg shadow-blue-500/5' 
                  : 'hover:bg-gray-800/50'}
                ${chat.unread_count > 0 
                  ? 'bg-gradient-to-r from-blue-500/10 to-transparent' 
                  : ''}
                ${chat.has_typing_users 
                  ? 'border-l-2 border-l-blue-500' 
                  : ''}
              `}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {chat.avatar_url ? (
                    <Image
                      src={chat.avatar_url}
                      alt={chat.name || "Chat avatar"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {chat.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {chat.participants.some(p => p.online) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium truncate">{chat.name}</h3>
                    {chat.last_message_time && (
                      <span className="text-xs text-gray-400">
                        {formatTime(chat.last_message_time)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <p className={`text-sm truncate flex-1 ${chat.unread_count > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {chat.has_typing_users ? (
                          <span className="text-blue-400 animate-pulse">{getTypingIndicator()}</span>
                        ) : chat.last_message ? (
                          chat.last_message
                        ) : (
                          'No messages yet'
                        )}
                      </p>
                      {chat.participants.some(p => p.online) && (
                        <span className="flex-none text-xs text-green-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          online
                        </span>
                      )}
                    </div>
                    {chat.unread_count > 0 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/20"
                      >
                        <span className="text-xs text-white font-medium">
                          {chat.unread_count}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
