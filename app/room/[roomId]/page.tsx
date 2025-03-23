'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import VideoRoom from '@/components/video-room/VideoRoom'
import toast from 'react-hot-toast'

interface RoomData {
  id: string
  name: string
  host_id: string
  status: string
  password: string | null
  group_id: string
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [room, setRoom] = useState<RoomData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const fetchRoomAndAuthorize = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) {
          toast('Please login to join the room')
          router.push('/login')
          return
        }

        // Get room data
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select(`
            id,
            name,
            host_id,
            status,
            password,
            group_id
          `)
          .eq('id', roomId)
          .single()

        if (roomError) throw roomError
        if (!roomData) {
          console.error('Room not found')
          toast('Room not found')
          router.push('/')
          return
        }

        // Check if room is ended
        if (roomData.status === 'ended') {
          toast('This room has ended')
          router.push('/')
          return
        }

        // Check if user is member of the group
        const { data: membership, error: membershipError } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', roomData.group_id)
          .eq('user_id', user.id)
          .single()

        if (membershipError || !membership) {
          toast('You are not authorized to join this room')
          router.push('/')
          return
        }

        setRoom(roomData)
        setIsAuthorized(true)

        // Update room status to active if waiting
        if (roomData.status === 'waiting') {
          const { error: updateError } = await supabase
            .from('rooms')
            .update({ status: 'active' })
            .eq('id', roomId)

          if (updateError) throw updateError
        }

        // Subscribe to room status changes
        const roomChannel = supabase.channel('room_status')
          .on('system', { event: 'db_changes' }, 
            (payload: { new: { status: string } }) => {
              if (payload.new.status === 'ended') {
                toast('The room has ended')
                router.push('/')
              }
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(roomChannel)
        }

      } catch (error: unknown) {
        console.error('Error fetching room:', error)
        toast('Failed to join room')
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoomAndAuthorize()
  }, [roomId, router])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!room || !isAuthorized) {
    return <div className="flex items-center justify-center h-screen">Not authorized</div>
  }

  return (
    <div className="h-screen bg-gray-900">
      <VideoRoom roomId={roomId} />
    </div>
  )
}