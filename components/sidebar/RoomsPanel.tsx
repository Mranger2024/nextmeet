'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, X, History, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import RoomCard from './RoomCard'
import { useRouter } from 'next/navigation'
import { generateUUID } from '@/utils/uuid'
import { useInterval } from '@/hooks/useInterval'
import RoomHistory from './RoomHistory'

interface Room {
  id: string
  name: string
  group_id: string
  host_id: string
  password: string | null
  status: 'waiting' | 'active' | 'ended'
  created_at: string
  group: {
    name: string
  }
  host: {
    username: string
  }
  participant_count: number
  video_chat_url: string
  last_active?: string
}

interface Group {
  id: string
  name: string
}

// Room history entry interface is used in RoomHistory component

export default function RoomsPanel() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [roomName, setRoomName] = useState('')
  const [roomPassword, setRoomPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const router = useRouter()

  // Wrap fetchRooms in useCallback to prevent it from changing on every render
  const fetchRooms = useCallback(async () => {
    if (!currentUserId) return

    try {
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', currentUserId)

      if (!memberships?.length) {
        setRooms([])
        return
      }

      const groupIds = memberships.map(m => m.group_id)

      const { data: roomsData, error: roomError } = await supabase
        .from('rooms_with_host')
        .select('*')
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })

      if (roomError) throw roomError

      const formattedRooms = roomsData.map(room => ({
        id: room.id,
        name: room.name,
        group_id: room.group_id,
        host_id: room.host_id,
        password: room.password,
        status: room.status,
        video_chat_url: room.video_chat_url,
        created_at: room.created_at,
        group: {
          name: room.group_name
        },
        host: {
          username: room.host_username
        },
        participant_count: room.participant_count
      }))

      setRooms(formattedRooms)
    } catch (error: unknown) {
      console.error('Error fetching rooms:', error)
      toast.error('Failed to load rooms')
    }
  }, [currentUserId])

  // Add isRoomExpired in useCallback to prevent it from changing on every render
  const isRoomExpired = useCallback((room: Room) => {
    const now = new Date()
    const createdAt = new Date(room.created_at)
    const lastActive = room.last_active ? new Date(room.last_active) : createdAt
    const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / 60000
    const minutesSinceLastActive = (now.getTime() - lastActive.getTime()) / 60000

    return (
      minutesSinceCreation >= 10 || // Room is older than 10 minutes
      (room.participant_count <= 1 && minutesSinceLastActive >= 5) // Inactive room with 1 or fewer participants
    )
  }, [])

  // Wrap handleRoomExpiry in useCallback to prevent it from changing on every render
  const handleRoomExpiry = useCallback(async (room: Room) => {
    try {
      // First check if room is already ended to prevent duplicate processing
      const { data: currentRoom } = await supabase
        .from('rooms')
        .select('status, created_at')
        .eq('id', room.id)
        .single()

      if (currentRoom?.status === 'ended') {
        return
      }

      // Calculate duration in milliseconds
      const now = new Date()
      const startTime = new Date(room.created_at)
      const duration = now.getTime() - startTime.getTime()

      // Add to room history with duration
      const { error: historyError } = await supabase
        .from('room_history')
        .insert([{
          room_id: room.id,
          name: room.name,
          group_id: room.group_id,
          host_id: room.host_id,
          participant_count: room.participant_count,
          started_at: room.created_at,
          ended_at: now.toISOString(),
          duration: duration
        }])

      if (historyError) {
        console.error('Error creating room history:', historyError.message)
        return
      }

      // Update room status to ended (without ended_at field)
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ status: 'ended' })
        .eq('id', room.id)

      if (updateError) {
        console.error('Error updating room status:', updateError.message)
        return
      }

      // Check for existing notification
      const { data: existingNotif, error: notifCheckError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', room.host_id)
        .eq('type', 'room_expired')
        .eq('room_id', room.id)
        .single()

      if (!existingNotif && !notifCheckError) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: room.host_id,
            type: 'room_expired',
            title: 'Room Expired',
            message: `Your room "${room.name}" has expired and been archived.`,
            room_id: room.id,
            read: false
          }])

        if (!notificationError) {
          toast.success('Room archived', { id: `room-archived-${room.id}` })
        }
      }

      // Update local state
      setRooms(prev => prev.map(r => 
        r.id === room.id ? { ...r, status: 'ended' } : r
      ))

    } catch (error: unknown) {
      console.error('Error handling room expiry:', error instanceof Error ? error.message : 'Unknown error')
    }
  }, [])

  useEffect(() => {
    const initializePanel = async () => {
      setIsLoading(true)
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        
        if (!user) {
          console.log('No authenticated user')
          return
        }

        setCurrentUserId(user.id)
        
        // Fetch groups first
        await fetchGroups(user.id)

        // Then fetch rooms
        const { data: memberships } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id)

        if (memberships?.length) {
          const groupIds = memberships.map(m => m.group_id)
          
          // Get rooms for these groups
          const { data: roomsData, error: roomError } = await supabase
            .from('rooms_with_host')
            .select('*')
            .in('group_id', groupIds)
            .order('created_at', { ascending: false })

          if (roomError) throw roomError

          const formattedRooms = roomsData.map(room => ({
            id: room.id,
            name: room.name,
            group_id: room.group_id,
            host_id: room.host_id,
            password: room.password,
            status: room.status,
            video_chat_url: room.video_chat_url,
            created_at: room.created_at,
            group: {
              name: room.group_name
            },
            host: {
              username: room.host_username
            },
            participant_count: room.participant_count
          }))

          setRooms(formattedRooms)
        }

        // Subscribe to room changes
        const roomsChannel = supabase
          .channel('rooms_channel')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'rooms'
          }, async () => {
            // Re-fetch rooms when any change occurs
            await fetchRooms()
          })
          .subscribe()

        return () => {
          supabase.removeChannel(roomsChannel)
        }
      } catch (error: unknown) {
        console.error('Initialization error:', error)
        toast.error('Failed to load rooms')
      } finally {
        setIsLoading(false)
      }
    }

    initializePanel()
  }, [fetchRooms]) // Add fetchRooms to the dependency array

  const fetchGroups = async (userId: string) => {
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

      const { data: groupsData, error: groupError } = await supabase
        .from('groups')
        .select('id, name')
        .in('id', groupIds)

      if (groupError) throw groupError

      setGroups(groupsData)
    } catch (error: unknown) {
      console.error('Error fetching groups:', error)
      toast.error('Failed to load groups')
    }
  }

  // Add this effect to refresh rooms when showHistory changes
  useEffect(() => {
    if (currentUserId) {
      fetchRooms()
    }
  }, [showHistory, currentUserId, fetchRooms])

  // Update the activeRooms computation
  const activeRooms = rooms.filter(room => 
    room.status !== 'ended' && !isRoomExpired(room)
  )

  // We don't need to filter ended rooms here as they're handled in the RoomHistory component

  // Add room cleanup check
  useInterval(() => {
    if (currentUserId) {
      cleanupInactiveRooms()
    }
  }, 60000) // Check every minute

  const handleCreateRoom = async () => {
    if (!currentUserId || !selectedGroup || !roomName.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const roomId = generateUUID()
      const videoChatUrl = `/room/${roomId}`

      // First check if user is a member of the group
      const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', selectedGroup)
        .eq('user_id', currentUserId)
        .single()

      if (membershipError || !membership) {
        throw new Error('You are not a member of this group')
      }

      // Create the room
      const { error: roomError } = await supabase
        .from('rooms')
        .insert({
          id: roomId,
          name: roomName.trim(),
          group_id: selectedGroup,
          host_id: currentUserId,
          password: roomPassword || null,
          video_chat_url: videoChatUrl,
          status: 'waiting'
        })
        .select()
        .single()

      if (roomError) {
        throw new Error(roomError.message)
      }

      // Get all group members to notify
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', selectedGroup)
        .neq('user_id', currentUserId) // Don't notify the host

      if (membersError) throw membersError

      if (groupMembers?.length) {
        // Create notifications for all group members
        const notifications = groupMembers.map(member => ({
          user_id: member.user_id,
          from_user_id: currentUserId,
          type: 'room_invite',
          content: `${roomName} room has been created. Click to join!`,
          metadata: {
            room_id: roomId,
            room_name: roomName,
            group_id: selectedGroup
          }
        }))

        const { error: notifyError } = await supabase
          .from('notifications')
          .insert(notifications)

        if (notifyError) throw notifyError
      }

      // Reset form and close modal
      setShowCreateModal(false)
      setRoomName('')
      setRoomPassword('')
      setSelectedGroup('')

      // Navigate to the room
      router.push(videoChatUrl)
      toast.success('Room created successfully')
    } catch (error: unknown) {
      console.error('Error creating room:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create room')
    }
  }

  const cleanupInactiveRooms = async () => {
    if (!currentUserId) return

    try {
      const oneHourAgo = new Date()
      oneHourAgo.setHours(oneHourAgo.getHours() - 1)

      // Get rooms where current user is host and status is not ended
      const { data: oldRooms, error: fetchError } = await supabase
        .from('rooms')
        .select('id')
        .eq('host_id', currentUserId)
        .neq('status', 'ended')
        .lt('created_at', oneHourAgo.toISOString())

      if (fetchError) throw fetchError

      if (oldRooms?.length) {
        const { error: updateError } = await supabase
          .from('rooms')
          .update({ status: 'ended' })
          .in('id', oldRooms.map(r => r.id))

        if (updateError) throw updateError
      }
    } catch (error: unknown) {
      console.error('Error cleaning up rooms:', error)
    }
  }

  // Update the joinRoom function
  const joinRoom = async (roomId: string, password?: string) => {
    try {
      // Check if room requires password
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (roomError) throw roomError

      if (room.password && room.password !== password) {
        throw new Error('Incorrect password')
      }

      // Update participant status
      const { error: updateError } = await supabase
        .from('room_participants')
        .update({ status: 'joined' })
        .eq('room_id', roomId)
        .eq('user_id', currentUserId)

      if (updateError) throw updateError

      // Redirect to video chat room
      router.push(room.video_chat_url)
      
    } catch (error: unknown) {
      console.error('Error joining room:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to join room')
    }
  }

  // Add function to mark as busy
  const markAsBusy = async (roomId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('room_participants')
        .update({ status: 'busy' })
        .eq('room_id', roomId)
        .eq('user_id', currentUserId)

      if (updateError) throw updateError

      toast.success('Marked as busy')
    } catch (error: unknown) {
      console.error('Error marking as busy:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  // Update the useEffect for checking expired rooms
  useEffect(() => {
    let mounted = true
    
    const checkExpiredRooms = async () => {
      if (!mounted) return

      try {
        const expiredRooms = rooms.filter(room => 
          room.status !== 'ended' && isRoomExpired(room)
        )

        for (const room of expiredRooms) {
          if (!mounted) break
          if (room.status === 'ended') continue

          await handleRoomExpiry(room)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error: unknown) {
        console.error('Error in checkExpiredRooms:', error)
      }
    }

    // Initial check with delay
    const initialCheck = setTimeout(checkExpiredRooms, 2000)
    
    // Periodic check
    const intervalId = setInterval(checkExpiredRooms, 30000)

    return () => {
      mounted = false
      clearTimeout(initialCheck)
      clearInterval(intervalId)
    }
  }, [rooms, handleRoomExpiry, isRoomExpired])

  return (
    <div className="h-full p-2 flex flex-col bg-black/10 backdrop-blur-xl shadow-lg shadow-black/50 rounded-2xl">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showHistory && (
            <button
              onClick={() => setShowHistory(false)}
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-semibold">
            {showHistory ? 'Room History' : 'Active Rooms'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800/80 transition-all"
            title={showHistory ? 'Show active rooms' : 'Show room history'}
          >
            <History size={20} />
          </button>
          {!showHistory && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-all"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : showHistory ? (
          <RoomHistory />
        ) : activeRooms.length > 0 ? (
          <div className="space-y-4">
            {activeRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                currentUserId={currentUserId}
                onJoin={joinRoom}
                onBusy={markAsBusy}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>No active rooms</p>
            <p className="text-sm mt-2">
              Create a room to start video chatting
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Room</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700"
                >
                  <option value="">Select a group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700"
                  placeholder="Enter room name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password (Optional)</label>
                <input
                  type="password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700"
                  placeholder="Enter room password"
                />
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
                onClick={handleCreateRoom}
                disabled={!selectedGroup || !roomName.trim()}
                className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}