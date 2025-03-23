'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, UserPlus, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

export default function FindFriendsPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        setCurrentUserName(user.user_metadata.username)
        // Fetch pending requests
        fetchPendingRequests(user.id)
      }
    }
    getCurrentUser()
  }, [])

  const fetchPendingRequests = async (userId: string) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'pending')

      if (error) {
        console.error('Error fetching pending requests:', error.message)
        return
      }

      if (data) {
        setPendingRequests(new Set(data.map(req => req.friend_id)))
      }
    } catch (error: any) {
      console.error('Error fetching pending requests:', error.message || error)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query || query.length < 3 || !currentUserId) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      // First get user profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', currentUserId)
        .limit(10)

      if (profileError) {
        console.error('Error searching profiles:', profileError.message)
        toast.error('Failed to search users')
        return
      }

      if (!profiles || profiles.length === 0) {
        setSearchResults([])
        return
      }

      // Then get friend relationships
      const { data: friendRelations, error: friendError } = await supabase
        .from('friends')
        .select('user_id, friend_id, status')
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
        .neq('status', 'deleted')

      if (friendError) {
        console.error('Error fetching friend relations:', friendError.message)
        return
      }

      // Create a map of existing relationships
      const relationshipMap = new Map()
      friendRelations?.forEach(relation => {
        const otherId = relation.user_id === currentUserId ? relation.friend_id : relation.user_id
        relationshipMap.set(otherId, relation.status)
      })

      // Filter out users who are already friends or have pending requests
      const filteredResults = profiles.filter(user => !relationshipMap.has(user.id))
      setSearchResults(filteredResults)
    } catch (error: any) {
      console.error('Error searching users:', error.message || error)
      toast.error('Failed to search users')
    } finally {
      setIsLoading(false)
    }
  }

  const sendFriendRequest = async (friendId: string) => {
    if (!currentUserId || !currentUserName) {
      toast.error('You must be logged in to send friend requests')
      return
    }

    try {
      // Check for existing relationship
      const { data: existingRelation, error: checkError } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`)
        .neq('status', 'deleted')
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message)
      }

      if (existingRelation) {
        if (existingRelation.status === 'accepted') {
          toast.error('You are already friends with this user')
          return
        }
        if (existingRelation.status === 'pending') {
          toast.error('A friend request is already pending')
          return
        }
      }

      // Create friend request
      const { error: insertError } = await supabase
        .from('friends')
        .insert({
          user_id: currentUserId,
          friend_id: friendId,
          status: 'pending'
        })

      if (insertError) throw new Error(insertError.message)

      // Create notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: friendId,
          from_user_id: currentUserId,
          type: 'friend_request',
          content: `${currentUserName} sent you a friend request`
        })

      if (notifError) throw new Error(notifError.message)

      // Update local state
      setPendingRequests(prev => new Set(Array.from(prev).concat([friendId])))
      toast.success('Friend request sent')

    } catch (error: any) {
      console.error('Error sending friend request:', error.message || error)
      toast.error('Failed to send friend request')
    }
  }

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(debounceTimeout)
  }, [searchQuery, currentUserId])

  return (
    <div className="h-full flex flex-col bg-gray-900/95 backdrop-blur-md">
      <div className="p-6 border-b border-white/10 bg-gray-900/95 backdrop-blur-md">
        <h2 className="text-xl font-semibold mb-6">Find Friends</h2>
        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username (min. 3 characters)..."
            className="w-full p-3 pl-10 rounded-lg bg-gray-800/50 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-400">Searching...</div>
        ) : searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">{user.display_name[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{user.display_name}</h3>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => sendFriendRequest(user.id)}
                disabled={pendingRequests.has(user.id)}
                className={`p-2 rounded-lg transition-all ${
                  pendingRequests.has(user.id)
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
                }`}
                title={pendingRequests.has(user.id) ? 'Friend request pending' : 'Send friend request'}
              >
                {pendingRequests.has(user.id) ? (
                  <Check size={20} />
                ) : (
                  <UserPlus size={20} />
                )}
              </button>
            </div>
          ))
        ) : searchQuery.length >= 3 ? (
          <div className="text-center text-gray-400">No users found</div>
        ) : null}
      </div>
    </div>
  )
}