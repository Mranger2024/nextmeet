'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import ChatPanel from './ChatPanel'
import VideoControls from './VideoControls'
import ParticipantCard from './ParticipantCard'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Grid, MessageSquare, Users } from 'lucide-react'

interface VideoRoomProps {
  roomId: string
}

interface Room {
  id: string
  name: string
  host_id: string
  status: string
  created_at: string
}

interface Participant {
  id: string
  username: string
  displayName?: string
  stream?: MediaStream
  audioEnabled: boolean
  videoEnabled: boolean
  isSpeaking: boolean
  joinedAt: string
}

const VideoRoom: React.FC<VideoRoomProps> = ({ roomId }) => {
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map())
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isGridLayout, setIsGridLayout] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false) // Default closed on mobile
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)
  const [mainSpeakerId, setMainSpeakerId] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user')
  const [isMobile, setIsMobile] = useState(false)
  
  const router = useRouter()
  const participantArray = Array.from(participants.values())

  const audioAnalyserRef = useRef<{
    [key: string]: {
      context: AudioContext
      analyser: AnalyserNode
      dataArray: Uint8Array
    }
  }>({})

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const updateParticipants = useCallback((presenceState: Record<string, unknown>) => {
    setParticipants(prev => {
      const next = new Map(prev)
      
      Object.entries(presenceState).forEach(([, value]) => {
        const presenceData = Array.isArray(value) ? value[0] : value
        if (presenceData && typeof presenceData === 'object' && 'user_id' in presenceData) {
          if (!next.has(presenceData.user_id as string)) {
            next.set(presenceData.user_id as string, {
              id: presenceData.user_id as string,
              username: presenceData.username as string,
              displayName: presenceData.display_name as string | undefined,
              audioEnabled: true,
              videoEnabled: true,
              isSpeaking: false,
              joinedAt: presenceData.online_at as string
            })
          }
        }
      })

      return next
    })
  }, [])

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        // Get room data
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single()

        if (roomError) throw roomError
        setRoom(roomData)

        // Initialize media devices with preferred camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing },
          audio: true
        })
        setLocalStream(stream)

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('Not authenticated')

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        // Add self to participants
        setParticipants(new Map([[user.id, {
          id: user.id,
          username: profile.username,
          displayName: profile.display_name,
          stream,
          audioEnabled: true,
          videoEnabled: true,
          isSpeaking: false,
          joinedAt: new Date().toISOString()
        }]]))

        // Set initial main speaker as self
        setMainSpeakerId(user.id)

        // Subscribe to participant changes
        const roomChannel = supabase.channel(`room:${roomId}`)
          .on('presence', { event: 'sync' }, () => {
            const presenceState = roomChannel.presenceState()
            updateParticipants(presenceState)
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_participants' }, ({ new: { user_id, username } }) => {
            console.log('Participant joined:', user_id)
            toast.success(`${username} joined the room`)
          })
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'room_participants' }, ({ old: { user_id } }) => {
            setParticipants(prev => {
              const next = new Map(prev)
              const participant = next.get(user_id)
              if (participant) {
                console.log('Participant left:', user_id, participant.username)
                toast(`${participant.username} left the room`)
                next.delete(user_id)
              }
              return next
            })
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await roomChannel.track({
                user_id: user.id,
                username: profile.username,
                display_name: profile.display_name,
                online_at: new Date().toISOString()
              })
            }
          })

        return () => {
          stream.getTracks().forEach(track => track.stop())
          if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop())
          }
          Object.values(audioAnalyserRef.current).forEach(({ context }) => {
            context.close()
          })
          supabase.removeChannel(roomChannel)
        }
      } catch (error) {
        console.error('Error initializing room:', error instanceof Error ? error.message : String(error))
        toast.error('Failed to join video chat')
        router.push('/')
      }
    }

    initializeRoom()
  }, [roomId, router, cameraFacing, screenStream, updateParticipants])

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setIsAudioEnabled(audioTrack.enabled)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoEnabled(videoTrack.enabled)
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (isSharingScreen) {
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop())
        }
        setScreenStream(null)
        setIsSharingScreen(false)
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        setScreenStream(stream)
        setIsSharingScreen(true)

        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null)
          setIsSharingScreen(false)
        }
      }
    } catch (error) {
      console.error('Error sharing screen:', error instanceof Error ? error.message : String(error))
      toast.error('Failed to share screen')
    }
  }

  const switchCamera = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }

      const newFacing = cameraFacing === 'user' ? 'environment' : 'user'
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: true
      })
      
      setLocalStream(stream)
      setCameraFacing(newFacing)
    } catch (error) {
      console.error('Error switching camera:', error instanceof Error ? error.message : String(error))
      toast.error('Failed to switch camera')
    }
  }

  const leaveRoom = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
      }

      // Update room status if host
      const { data: { user } } = await supabase.auth.getUser()
      if (user && room?.host_id === user.id) {
        await supabase
          .from('rooms')
          .update({ status: 'ended' })
          .eq('id', roomId)
      }

      router.push('/')
    } catch (error) {
      console.error('Error leaving room:', error instanceof Error ? error.message : String(error))
      router.push('/')
    }
  }

  const handleParticipantClick = (participantId: string) => {
    setMainSpeakerId(participantId)
    setIsGridLayout(false)
  }

  if (!room) return null

  const mainSpeaker = mainSpeakerId ? participants.get(mainSpeakerId) : participantArray[0]

  return (
    <div className="h-full flex flex-col md:flex-row bg-gray-950">
      <div className={`flex-1 flex flex-col ${!isMobile && (isChatOpen || isParticipantsOpen) ? 'md:mr-[320px]' : ''}`}>
        <div className="flex-none px-2 md:px-4 py-2 md:py-3 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-white truncate max-w-[150px] md:max-w-full">{room?.name}</h1>
              {!isMobile && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex -space-x-2">
                    {participantArray.slice(0, 3).map(participant => (
                      <div
                        key={participant.id}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-gray-900 flex items-center justify-center"
                      >
                        <span className="text-sm font-medium text-white">
                          {(participant.displayName || participant.username)[0].toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {participantArray.length} participant{participantArray.length !== 1 ? 's' : ''}
                    </span>
                    {participantArray.some(p => p.isSpeaking) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        Speaking
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 md:gap-3">
              <button
                onClick={() => setIsGridLayout(!isGridLayout)}
                className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                  isGridLayout 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                <Grid size={isMobile ? 16 : 19} />
              </button>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                  isChatOpen 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare size={isMobile ? 16 : 19} />
              </button>
              <button
                onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
                className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                  isParticipantsOpen 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                <Users size={isMobile ? 16 : 19} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative bg-gray-950">
          {isGridLayout ? (
            <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 p-2 md:p-4">
              {participantArray.map(participant => (
                <ParticipantCard
                  key={`${participant.id}-${participant.joinedAt}`}
                  {...participant}
                  isMainSpeaker={participant.id === mainSpeakerId}
                  isAudioEnabled={participant.audioEnabled}
                  isVideoEnabled={participant.videoEnabled}
                  onClick={() => handleParticipantClick(participant.id)}
                />
              ))}
            </div>
          ) : (
            <>
              {mainSpeaker && (
                <div className="absolute inset-0 p-2 md:p-4">
                  <ParticipantCard
                    {...mainSpeaker}
                    isMainSpeaker={true}
                    isAudioEnabled={mainSpeaker.audioEnabled}
                    isVideoEnabled={mainSpeaker.videoEnabled}
                    onClick={() => {}}
                  />
                </div>
              )}
              <div className="absolute bottom-20 md:bottom-28 left-0 right-0">
                <div className="flex justify-center">
                  <div className="flex gap-2 md:gap-3 px-2 md:px-4 pb-2 md:pb-4 overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {participantArray
                      .filter(p => p.id !== mainSpeakerId)
                      .map(participant => (
                        <div key={`${participant.id}-${participant.joinedAt}`} className="w-24 md:w-40 flex-none">
                          <ParticipantCard
                            {...participant}
                            isMainSpeaker={false}
                            isAudioEnabled={participant.audioEnabled}
                            isVideoEnabled={participant.videoEnabled}
                            onClick={() => handleParticipantClick(participant.id)}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-10">
          <VideoControls
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isSharingScreen={isSharingScreen}
            isGridLayout={isGridLayout}
            isChatOpen={isChatOpen}
            isParticipantsOpen={isParticipantsOpen}
            cameraFacing={cameraFacing}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
            onToggleLayout={() => setIsGridLayout(!isGridLayout)}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
            onToggleParticipants={() => setIsParticipantsOpen(!isParticipantsOpen)}
            onSwitchCamera={switchCamera}
            onLeaveRoom={leaveRoom}
          />
        </div>
        </div>

      {/* Mobile bottom sheet for chat and participants */}
      {isMobile && (isChatOpen || isParticipantsOpen) && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-gray-900 border-t border-gray-800/50 rounded-t-2xl max-h-[70vh] overflow-hidden">
          <div className="flex h-full max-h-[70vh] flex-col">
            <div className="flex-none flex border-b border-gray-800/50 relative">
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-12 h-1 bg-gray-700 rounded-full"></div>
              <button
                onClick={() => setIsChatOpen(true)}
                className={`flex-1 px-4 py-4 text-sm font-medium ${
                  isChatOpen 
                    ? 'text-white border-b-2 border-blue-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setIsParticipantsOpen(true)}
                className={`flex-1 px-4 py-4 text-sm font-medium ${
                  isParticipantsOpen 
                    ? 'text-white border-b-2 border-blue-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Participants ({participantArray.length})
              </button>
              <button 
                onClick={() => {
                  setIsChatOpen(false);
                  setIsParticipantsOpen(false);
                }}
                className="absolute right-2 top-3 p-2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[calc(70vh-56px)]">
              {isChatOpen && (
                <ChatPanel 
                  roomId={roomId} 
                  roomName={room?.name || ''} 
                  participants={participants}
                />
              )}

              {isParticipantsOpen && (
                <div className="p-4 space-y-2">
                  {participantArray.map(participant => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex-none w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-lg font-semibold text-white">
                          {(participant.displayName || participant.username)[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {participant.displayName || participant.username}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          {participant.isSpeaking && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              Speaking
                            </span>
                          )}
                          {!participant.audioEnabled && (
                            <span className="text-red-400">Muted</span>
                          )}
                          {!participant.videoEnabled && (
                            <span className="text-red-400">No video</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar for chat and participants */}
      {!isMobile && (isChatOpen || isParticipantsOpen) && (
        <div className="fixed right-0 top-0 bottom-0 w-[320px] bg-gray-900 border-l border-gray-800/50">
          <div className="flex h-full">
            <div className="flex-1 flex flex-col">
              <div className="flex-none flex border-b border-gray-800/50">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    isChatOpen 
                      ? 'text-white border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setIsParticipantsOpen(true)}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    isParticipantsOpen 
                      ? 'text-white border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Participants ({participantArray.length})
                </button>
              </div>

              {isChatOpen && (
                <ChatPanel 
                  roomId={roomId} 
                  roomName={room?.name || ''} 
                  participants={participants}
                />
              )}

              {isParticipantsOpen && (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-2">
                    {participantArray.map(participant => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex-none w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-lg font-semibold text-white">
                            {(participant.displayName || participant.username)[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {participant.displayName || participant.username}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            {participant.isSpeaking && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Speaking
                              </span>
                            )}
                            {!participant.audioEnabled && (
                              <span className="text-red-400">Muted</span>
                            )}
                            {!participant.videoEnabled && (
                              <span className="text-red-400">No video</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  )
}

export default VideoRoom