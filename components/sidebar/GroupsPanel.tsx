'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Plus, X, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

interface Group {
  id: string
  name: string
  description: string | null
  created_at: string
  member_count: number
}

interface Friend {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

interface GroupsPanelProps {
  setActivePanel: (panel: 'messages' | 'friends' | 'groups' | 'rooms') => void;
  setSelectedChat: (chat: { id: string; name: string; participants: any[]; is_group: boolean; created_at: string }) => void;
}

export default function GroupsPanel({ setActivePanel, setSelectedChat }: GroupsPanelProps) {
  const [groups, setGroups] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [friends, setFriends] = useState<Friend[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setCurrentUser({ ...user, ...profile })
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [])

  const fetchGroups = async (userId: string = currentUserId!) => {
    try {
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId)
  
      if (memberError) throw memberError
  
      if (!memberships?.length) {
        setGroups([])
        return
      }
  
      const groupIds = memberships.map(m => m.group_id)
  
      // Modified query to properly count members
      const { data: groupsData, error: groupError } = await supabase
        .from('groups')
        .select('id, name, description, created_at, created_by')
        .in('id', groupIds)
  
      if (groupError) throw groupError
  
      // Get member counts in a separate query
      const formattedGroups = await Promise.all(groupsData.map(async (group) => {
        const { count, error: countError } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id)
        
        if (countError) throw countError
        
        return {
          ...group,
          member_count: count || 0
        }
      }))
  
      setGroups(formattedGroups)
    } catch (error: any) {
      console.error('Error fetching groups:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      toast.error('Failed to load groups')
    }
  }

  useEffect(() => {
    if (!currentUser) return

    const fetchFriends = async () => {
      try {
        const { data: friendConnections, error: friendError } = await supabase
          .from('friends')
          .select('friend_id, user_id')
          .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
          .eq('status', 'accepted')

        if (friendError) throw friendError

        if (!friendConnections?.length) {
          setFriends([])
          return
        }

        const friendIds = friendConnections.map(conn => 
          conn.user_id === currentUserId ? conn.friend_id : conn.user_id
        )

        const { data: friendProfiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', friendIds)

        if (profileError) throw profileError

        setFriends(friendProfiles || [])
      } catch (error: any) {
        console.error('Error fetching friends:', error)
        toast.error('Failed to load friends')
      }
    }

    Promise.all([fetchGroups(currentUserId!), fetchFriends()])
    setIsLoading(false)
  }, [currentUser, currentUserId])

  const handleChatClick = (group: any) => {
    setActivePanel('messages')
    setSelectedChat({
      id: group.id,
      name: group.name,
      participants: group.members,
      is_group: true,
      created_at: group.created_at
    })
  }

  const createGroup = async () => {
    if (!currentUserId || !groupName.trim() || selectedFriends.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }
  
    try {
      // Create group with explicit field mapping
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupName.trim(),
          created_by: currentUserId,
          description: null, // Add explicit null for optional fields
          avatar_url: null   // Add explicit null for optional fields
        })
        .select()
        .single()
  
      if (groupError) {
        console.error('Group insertion error:', groupError)
        throw groupError
      }
  
      if (!group || !group.id) {
        throw new Error('No group ID returned after creation')
      }
  
      // Add members with explicit field mapping
      const members = [
        { 
          group_id: group.id, 
          user_id: currentUserId, 
          role: 'admin' 
        },
        ...selectedFriends.map(friendId => ({
          group_id: group.id,
          user_id: friendId,
          role: 'member'
        }))
      ]
  
      const { error: memberError } = await supabase
        .from('group_members')
        .insert(members)
  
      if (memberError) {
        console.error('Member insertion error:', memberError)
        throw memberError
      }
  
      toast.success('Group created successfully!')
      setShowCreateModal(false)
      setGroupName('')
      setSelectedFriends([])
      fetchGroups(currentUserId)
    } catch (error: any) {
      console.error('Error creating group:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      toast.error('Failed to create group: ' + (error.message || 'Unknown error'))
    }
  }

  return (
    <div className="h-full p-2 flex flex-col bg-gradient-to-r from-[#4F4FFF]/10 via-[#845EFF]/8 to-[#4F4FFF]/10 backdrop-blur-xl shadow-lg shadow-black/50 rounded-2xl">
      <div className="p-3 bg-gray-950/80 backdrop-blur-2xl rounded-2xl flex justify-between items-center">
        <h2 className="text-xl font-semibold">Groups</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mt-2 p-3 bg-gray-950/80 backdrop-blur-2xl rounded-2xl">
        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Users size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-400">{group.member_count} members</p>
                  </div>
                </div>
                <button
                  onClick={() => handleChatClick(group)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <MessageSquare size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>No groups yet</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed p-2 inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-[#4F4FFF]/15 via-[#845EFF]/12 to-[#4F4FFF]/15 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Group</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black/70 "
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Members</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {friends.map((friend) => (
                    <label
                      key={friend.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFriends(prev => [...prev, friend.id])
                          } else {
                            setSelectedFriends(prev => 
                              prev.filter(id => id !== friend.id)
                            )
                          }
                        }}
                        className="rounded border-gray-700"
                      />
                      <span>{friend.display_name || friend.username}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                disabled={!groupName.trim() || selectedFriends.length === 0}
                className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}