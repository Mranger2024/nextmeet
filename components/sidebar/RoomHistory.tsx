'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface RoomHistoryEntry {
  id: string
  room_id: string
  group_id: string
  host_id: string
  started_at: string
  ended_at: string
  participant_count: number
  duration: number
  room_name: string
  group_name: string
  host_username: string
  host_display_name: string
}

export default function RoomHistory() {
  const [history, setHistory] = useState<RoomHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchRoomHistory()
  }, [])

  const fetchRoomHistory = async () => {
    try {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's groups first
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

      if (!memberships?.length) {
        setHistory([])
        return
      }

      const groupIds = memberships.map(m => m.group_id)

      // Get room history with details
      const { data, error } = await supabase
        .from('room_history_with_details')
        .select(`
          id,
          room_id,
          group_id,
          host_id,
          started_at,
          ended_at,
          participant_count,
          duration,
          room_name,
          group_name,
          host_username,
          host_display_name
        `)
        .in('group_id', groupIds)
        .order('started_at', { ascending: false })
        .limit(20)

      // Remove duplicate entries by keeping only the latest entry for each room_id
      const uniqueData = data?.reduce((acc: RoomHistoryEntry[], current) => {
        const exists = acc.find(item => item.room_id === current.room_id)
        if (!exists) {
          acc.push(current)
        }
        return acc
      }, []) || []

      if (error) {
        console.error('Supabase error:', error.message, error.details)
        toast.error(`Failed to load room history: ${error.message}`)
        return
      }

      setHistory(uniqueData)
    } catch (error: unknown) {
      console.error('Error fetching room history:', error)
      toast.error('Failed to load room history')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (!mounted) {
    return null // Return null on server-side to prevent hydration mismatch
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Room History</h3>
      
      {isLoading ? (
        <div className="text-center text-gray-400">Loading history...</div>
      ) : history.length > 0 ? (
        history.map(entry => (
          <div
            key={entry.id}
            className="p-4 rounded-lg bg-gray-800/30 border border-white/10"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{entry.room_name}</h4>
                <p className="text-sm text-gray-400">{entry.group_name}</p>
              </div>
              <div className="text-sm text-gray-400">
                {new Date(entry.ended_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {formatDuration(entry.duration)}
              </div>
              <div className="flex items-center gap-1">
                <Users size={14} />
                {entry.participant_count} participants
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400">No room history</div>
      )}
    </div>
  )
}