import { Video, Lock, Clock, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

interface RoomCardProps {
  room: {
    id: string
    name: string
    group: { name: string }
    participant_count: number
    password: string | null
    host: { username: string }
    status: 'waiting' | 'active' | 'ended'
    video_chat_url: string
    created_at: string
    last_active?: string
    host_id: string
  }
  currentUserId: string | null
  onJoin: (roomId: string, password?: string) => Promise<void>
  onBusy: (roomId: string) => Promise<void>
}

// Define error interface to replace 'any' types
interface SupabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

export default function RoomCard({ room, currentUserId, onJoin, onBusy }: RoomCardProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinWithAvailability = async () => {
    // First mark user as available
    await handleStatusChange('available');
    // Then join the room
    await handleJoin();
  }

  const handleJoin = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to join the room')
      return
    }

    if (room.status === 'ended') {
      toast.error('This room has ended')
      return
    }

    setIsJoining(true)
    try {
      if (room.password) {
        setShowPasswordModal(true)
        return
      }

      await onJoin(room.id)
    } catch (error: unknown) {
      const errorObj = error as SupabaseError;
      console.error('Error joining room:', errorObj)
      toast.error(errorObj.message || 'Failed to join room')
    } finally {
      setIsJoining(false)
    }
  }

  const handleJoinWithPassword = async () => {
    if (!password.trim()) {
      toast.error('Please enter the room password')
      return
    }
    
    setIsJoining(true)
    try {
      await onJoin(room.id, password)
      setShowPasswordModal(false)
    } catch (error: unknown) {
      const errorObj = error as SupabaseError;
      console.error('Error joining room with password:', errorObj)
      toast.error(errorObj.message || 'Failed to join room')
    } finally {
      setIsJoining(false)
    }
  }

  const getExpirationStatus = () => {
    const now = new Date()
    const createdAt = new Date(room.created_at)
    const lastActive = room.last_active ? new Date(room.last_active) : createdAt
    const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / 60000
    const minutesSinceLastActive = (now.getTime() - lastActive.getTime()) / 60000

    if (minutesSinceCreation >= 10) {
      return 'Expired (>10min)'
    }
    
    if (room.participant_count <= 1 && minutesSinceLastActive >= 5) {
      return 'Expired (inactive)'
    }

    if (minutesSinceCreation >= 8) {
      return 'Expires soon'
    }

    return null
  }

  const expirationStatus = getExpirationStatus()

  // Update the handleStatusChange function
  const handleStatusChange = async (status: 'busy' | 'available') => {
    try {
      // First check if user is a participant - removed unused variable
      const { error: participantError } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', currentUserId)
        .single()

      if (participantError) {
        // If not a participant, add them
        const { error: insertError } = await supabase
          .from('room_participants')
          .insert([{
            room_id: room.id,
            user_id: currentUserId,
            status: status
          }])

        if (insertError) throw insertError
      } else {
        // Update existing participant status
        const { error: updateError } = await supabase
          .from('room_participants')
          .update({ status: status })
          .eq('room_id', room.id)
          .eq('user_id', currentUserId)

        if (updateError) throw updateError
      }

      toast.success(`Marked as ${status}`)
    } catch (error: unknown) {
      const errorObj = error as SupabaseError;
      // Properly handle and log the error with detailed information
      const errorMessage = errorObj.message || (errorObj.details ? JSON.stringify(errorObj.details) : 'Unknown error')
      console.error('Error updating status:', { message: errorMessage, code: errorObj.code, details: errorObj.details })
      toast.error(`Failed to update status: ${errorMessage}`)
    }
  }

  // Commented out unused function
  /*
  const updateStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status })
        .eq('id', room.id)

      if (error) throw error
      
      toast.success(`Marked as ${status}`)
    } catch (error: any) {
      // Properly handle and log the error with detailed information
      const errorMessage = error.message || (error.details ? JSON.stringify(error.details) : 'Unknown error')
      console.error('Error updating status:', { message: errorMessage, code: error.code, details: error.details })
      toast.error(`Failed to update status: ${errorMessage}`)
    }
  }
  */

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg ${
      room.status === 'ended' || expirationStatus ? 'bg-gray-800/20' : 'bg-gray-800/50'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          room.status === 'active' ? 'bg-green-500/20' : 
          room.status === 'ended' ? 'bg-gray-500/20' : 
          'bg-blue-500/20'
        }`}>
          <Video size={20} className={
            room.status === 'active' ? 'text-green-500' :
            room.status === 'ended' ? 'text-gray-500' :
            'text-blue-500'
          } />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{room.name}</h3>
            {room.password && <Lock size={14} className="text-gray-400" />}
            {room.status === 'active' && <CheckCircle size={14} className="text-green-500" />}
            {room.status === 'ended' && <Clock size={14} className="text-gray-400" />}
          </div>
          <p className="text-sm text-gray-400">
            {room.group.name} • {room.participant_count} participants
          </p>
          <p className="text-xs text-gray-500">Host: {room.host.username}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {room.status !== 'ended' && (
          <>
            <button
              onClick={() => onBusy(room.id)}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
            >
              Busy
            </button>
            <button
              onClick={handleJoinWithAvailability}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center gap-2"
            >
              Join
            </button>
          </>
        )}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Enter Room Password</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 mb-4"
              placeholder="Enter password"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWithPassword}
                className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600"
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {expirationStatus && (
        <span className="text-xs text-red-400 ml-2">
          {expirationStatus}
        </span>
      )}
    </div>
  )
}