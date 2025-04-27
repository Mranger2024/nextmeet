'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Camera, Grid, Layout, Users, Users2, Mic, MicOff, MessageSquare } from 'lucide-react'
import ChatPanel from '@/components/video-room/ChatPanel'
import VideoPortal from '@/components/video-room/VideoPortal'
import ParticipantsList from '@/components/video-room/ParticipantsList'
import { toast } from 'react-hot-toast'

interface Participant {
  id: string
  username: string
  stream: MediaStream
  isSpeaking: boolean
  audioLevel: number
  isAudioOn: boolean
  isVideoOn: boolean
  display_name: string | null
  avatar_url: string | null
}

export default function VideoRoomPage() {
  const params = useParams()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [showChat, setShowChat] = useState(false)
  const [isGridLayout, setIsGridLayout] = useState(true)
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null)
  const [isFrontCamera, setIsFrontCamera] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioAnalysersRef = useRef<Map<string, AnalyserNode>>(new Map())
  const [showParticipants, setShowParticipants] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)

  const initializeMediaDevices = useCallback(async () => {
    try {
      const constraints = {
        video: { facingMode: isFrontCamera ? 'user' : 'environment' },
        audio: true
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      localStreamRef.current = stream

      setParticipants([{
        id: currentUserId || 'local',
        username: 'You',
        display_name: 'You',
        avatar_url: null,
        stream: stream,
        isSpeaking: false,
        audioLevel: 0,
        isAudioOn: true,
        isVideoOn: true
      }])
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error('Failed to access camera and microphone: ' + error.message)
      }
      throw new Error('Failed to access camera and microphone')
    }
  }, [isFrontCamera, currentUserId])

  const joinRoom = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Please sign in to join the room')
      }

      const { data: participant, error: participantError } = await supabase
        .from('room_participants')
        .select('status')
        .eq('room_id', params.roomId)
        .eq('user_id', user.id)
        .single()

      if (participantError || !participant) {
        throw new Error('You do not have access to this room')
      }

      await supabase
        .from('rooms')
        .update({ status: 'active' })
        .eq('id', params.roomId)

      await supabase
        .from('room_participants')
        .update({ 
          status: 'joined',
          joined_at: new Date().toISOString()
        })
        .eq('room_id', params.roomId)
        .eq('user_id', user.id)

      const channel = supabase.channel(`room:${params.roomId}`)
      channel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState()
          console.log('Presence state updated:', presenceState)
        })
        .subscribe()

    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error('Failed to join room')
    }
  }, [params.roomId])

  const setupAudioAnalysis = useCallback(() => {
    audioContextRef.current = new AudioContext()
    
    participants.forEach(participant => {
      if (!audioContextRef.current) return
      
      const analyser = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(participant.stream)
      source.connect(analyser)
      audioAnalysersRef.current.set(participant.id, analyser)
      
      monitorAudioLevel(participant.id, analyser)
    })
  }, [participants])

  const checkHostStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        
        const { data: room } = await supabase
          .from('rooms')
          .select('host_id')
          .eq('id', params.roomId)
          .single()
        
        if (room) {
          setIsHost(room.host_id === user.id)
        }
      }
    } catch (err) {
      console.error('Error checking host status:', err)
      toast.error('Failed to verify host status')
    }
  }, [params.roomId])

  useEffect(() => {
    const setupRoom = async () => {
      try {
        await initializeMediaDevices()
        await joinRoom()
        setupAudioAnalysis()
        await checkHostStatus()
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        }
      }
    }

    setupRoom()
    return () => cleanup()
  }, [initializeMediaDevices, joinRoom, setupAudioAnalysis, checkHostStatus])

  const monitorAudioLevel = (participantId: string, analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      const isSpeaking = average > 30 // Adjust threshold as needed

      setParticipants(prev => prev.map(p => 
        p.id === participantId 
          ? { ...p, isSpeaking, audioLevel: average }
          : p
      ))

      requestAnimationFrame(checkLevel)
    }

    checkLevel()
  }

  const toggleCamera = async () => {
    setIsFrontCamera(prev => !prev)
    await initializeMediaDevices()
    // Reinitialize WebRTC connections with new stream
  }

  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(prev => !prev)
    }
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    audioAnalysersRef.current.clear()
  }

  const handleKickParticipant = async (userId: string) => {
    if (!isHost) return

    try {
      // Remove participant from room
      await supabase
        .from('room_participants')
        .update({ status: 'kicked' })
        .eq('room_id', params.roomId)
        .eq('user_id', userId)

      // Update participants list
      setParticipants(prev => prev.filter(p => p.id !== userId))

      // Notify the kicked participant (you might want to implement this through WebSocket)
      toast.success('Participant removed from room')
    } catch (error) {
      console.error('Error kicking participant:', error)
      toast.error('Failed to remove participant')
    }
  }

  const handleMuteParticipant = async (userId: string) => {
    if (!isHost) return

    try {
      const participant = participants.find(p => p.id === userId)
      if (!participant) return

      // Toggle audio state
      const newAudioState = !participant.isAudioOn

      // Update participant in the list
      setParticipants(prev => prev.map(p => 
        p.id === userId 
          ? { ...p, isAudioOn: newAudioState }
          : p
      ))

      // You might want to implement the actual muting through WebRTC
      toast.success(`Participant ${newAudioState ? 'unmuted' : 'muted'}`)
    } catch (error) {
      console.error('Error toggling participant mute:', error)
      toast.error('Failed to update participant audio state')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Main Content */}
      <div className={`flex-1 p-4 ${showChat ? 'mr-96' : ''}`}>
        {/* Controls */}
        <div className="fixed top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(prev => !prev)}
              className="p-3 rounded-lg bg-gray-800/90 hover:bg-gray-700/90 transition-colors"
              title={showChat ? "Hide chat" : "Show chat"}
            >
              <MessageSquare size={20} />
            </button>
            <button
              onClick={() => setIsGridLayout(prev => !prev)}
              className="p-3 rounded-lg bg-gray-800/90 hover:bg-gray-700/90 transition-colors"
            >
              {isGridLayout ? <Layout size={20} /> : <Grid size={20} />}
            </button>
            <button
              onClick={toggleCamera}
              className="p-3 rounded-lg bg-gray-800/90 hover:bg-gray-700/90 transition-colors"
            >
              <Camera size={20} />
            </button>
            <button
              onClick={toggleMicrophone}
              className="p-3 rounded-lg bg-gray-800/90 hover:bg-gray-700/90 transition-colors"
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-lg bg-gray-800/90">
              <Users size={20} className="inline mr-2" />
              {participants.length} participants
            </div>
            <button
              onClick={() => setShowParticipants(prev => !prev)}
              className="p-3 rounded-lg bg-gray-800/90 hover:bg-gray-700/90 transition-colors"
            >
              <Users2 size={20} />
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className={`mt-16 grid gap-4 ${getGridColumns(participants.length)}`}>
          {isGridLayout ? (
            participants.map(participant => (
              <VideoPortal
                key={participant.id}
                participant={participant}
                isLocal={false}
                highlighted={participant.isSpeaking}
              />
            ))
          ) : (
            <>
              <VideoPortal
                participant={selectedParticipant 
                  ? participants.find(p => p.id === selectedParticipant)!
                  : participants[0]
                }
                isLocal={false}
                highlighted={false}
                isLarge
              />
              <div className="grid grid-cols-6 gap-2">
                {participants.map(participant => 
                  participant.id !== selectedParticipant && (
                    <div
                      key={participant.id}
                      onClick={() => setSelectedParticipant(participant.id)}
                      className="cursor-pointer"
                    >
                      <VideoPortal
                        participant={participant}
                        isLocal={false}
                        highlighted={participant.isSpeaking}
                        isSmall
                      />
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-gray-800/95 backdrop-blur-md border-l border-white/10">
          <ChatPanel 
            roomId={params.roomId as string}
            roomName={`Video Room ${params.roomId}`}
            participants={new Map(participants.map(p => [
              p.id,
              {
                id: p.id,
                username: p.username,
                displayName: p.display_name || undefined,
                avatarUrl: p.avatar_url || undefined
              }
            ]))}
          />
        </div>
      )}

      {/* Add Participants Panel */}
      {showParticipants && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-gray-800/95 backdrop-blur-md border-l border-white/10">
          <ParticipantsList
            participants={participants}
            currentUserId={currentUserId}
            isHost={isHost}
            onKick={handleKickParticipant}
            onMute={handleMuteParticipant}
          />
        </div>
      )}
    </div>
  )
}

function getGridColumns(count: number): string {
  if (count <= 2) return 'grid-cols-2'
  if (count <= 4) return 'grid-cols-2'
  if (count <= 6) return 'grid-cols-3'
  if (count <= 9) return 'grid-cols-3'
  return 'grid-cols-4'
}