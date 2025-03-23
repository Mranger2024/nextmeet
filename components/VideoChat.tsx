'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import WebRTCService from '@/lib/webrtc'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Sidebar from './Sidebar'
import { useSettings } from '@/contexts/SettingsContext'
import { UserPlus,X } from 'lucide-react'
import ChatPopup from './ChatPopup'
import { useMediaQuery } from 'react-responsive'
import LogoWatermark from './ui/LogoWatermark'

interface ServerToClientEvents {
  matched: (data: { partnerId: string, interests: string[], userProfile: UserProfile }) => void
  'match-found': (data: { partnerId: string }) => void
  offer: (data: { offer: RTCSessionDescriptionInit, from: string }) => void
  answer: (data: { answer: RTCSessionDescriptionInit, from: string }) => void
  'ice-candidate': (data: { candidate: RTCIceCandidateInit, from: string }) => void
  message: (message: Message) => void
  notification: (notification: Notification) => void
  activeUsers: (count: number) => void
  friendRequest: (data: { from: string, username: string }) => void
  reconnect: (attemptNumber: number) => void
}

interface ClientToServerEvents {
  waiting: (data: { 
    interests: string[], 
    deviceId: string,
    filters: FilterSettings,
    userProfile: UserProfile 
  }) => void
  offer: (data: { offer: RTCSessionDescriptionInit, to: string }) => void
  answer: (data: { answer: RTCSessionDescriptionInit, to: string }) => void
  'ice-candidate': (data: { candidate: RTCIceCandidateInit, to: string }) => void
  message: (data: { text: string, to: string }) => void
  report: (data: { reportedUser: string, reason: string }) => void
  friendRequest: (data: { from: string, username: string }) => void
}

interface Message {
  text: string
  from: string
  timestamp: number
}

interface Notification {
  id: string
  type: 'info' | 'error' | 'success' | 'friend_request' | 'room_invite' | 'message'
  message?: string
  content?: string
  from_user_id: string
  read: boolean
  created_at: string
}

interface UserProfile {
  gender: string
  country: string
  avatar_url: string | null
  username: string
}

interface FilterSettings {
  gender: string[]
  countries: string[]
  gender_preference: string
  country_preference: string[]
  preferenceTimeout?: number
}

const ICE_SERVERS = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302'
      ]
    }
  ]
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

const VideoChat = () => {
  const { t } = useSettings()
  const isMobile = useMediaQuery({ maxWidth: 640 })
  const [isInVideoChat, setIsInVideoChat] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isMatching, setIsMatching] = useState<boolean>(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const webrtcRef = useRef<WebRTCService | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [activeUsers, setActiveUsers] = useState<number>(0)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [isChatting, setIsChatting] = useState(false)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [currentCameraId, setCurrentCameraId] = useState<string>('')
  const [isLocalBig, setIsLocalBig] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user')
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserProfile({
            gender: profile.gender,
            country: profile.country,
            avatar_url: profile.avatar_url,
            username: profile.username
          })
        }
      }
    }

    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  useEffect(() => {
    try {
      if (socketRef.current) {
        console.log('Socket already exists, cleaning up...')
        socketRef.current.disconnect()
      }

      console.log('Connecting to socket server:', SOCKET_URL)
      socketRef.current = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling']
      })

      // Debug listeners
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        toast.error('Connection error. Retrying...')
      })

      socketRef.current.on('connect', () => {
        console.log('Connected to socket server with ID:', socketRef.current?.id)
        setIsOnline(true)
        toast.success('Connected to chat server')
      })

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        if (reason === 'io server disconnect') {
          // Reconnect if server disconnected
          socketRef.current?.connect()
        }
        toast.error('Disconnected from chat server')
      })

      socketRef.current.on('reconnect', (attemptNumber: number) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts')
        toast.success('Reconnected to chat server')
      })

    webrtcRef.current = new WebRTCService()

    socketRef.current.on('notification', (notification: Notification) => {
      if (notification.message) {
        switch (notification.type) {
          case 'error':
            toast.error(notification.message)
            break
          case 'success':
            toast.success(notification.message)
            break
          case 'info':
          default:
            toast(notification.message)
            break
        }
      } else if (notification.content) {
        setNotifications(prev => [...prev, notification])
        setUnreadCount(count => count + 1)
      }
    })

    socketRef.current.on('message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketRef.current.on('activeUsers', (count: number) => {
        setActiveUsers(count)
      })


    socketRef.current.on('friendRequest', (data: { from: string; username: string }) => {
      toast.custom((t: any) => handleFriendRequestToast(t, data), {
        duration: 10000,
      })
    })

    webrtcRef.current.setOnRemoteStream((stream) => {
      setRemoteStream(stream)
    })

      socketRef.current.on('matched', (data: { partnerId: string, interests: string[], userProfile: UserProfile }) => {
        setPartnerProfile(data.userProfile)
        handleMatchFound(data.partnerId)
      })

      socketRef.current.on('match-found', (data: { partnerId: string }) => {
        handleMatchFound(data.partnerId)
      })
      socketRef.current.on('offer', handleOffer)
      socketRef.current.on('answer', handleAnswer)
      socketRef.current.on('ice-candidate', handleIceCandidate)

    return () => {
        console.log('Cleaning up socket connection...')
        if (socketRef.current) {
          socketRef.current.disconnect()
        }
      }
    } catch (error) {
      console.error('Socket initialization error:', error)
      toast.error('Failed to initialize chat connection')
    }
  }, [])

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [])

  const checkMediaPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      if (result.state === 'denied') {
        throw new Error('Camera permission denied')
      }
      
      const audioResult = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      if (audioResult.state === 'denied') {
        throw new Error('Microphone permission denied')
      }
      
      return true
    } catch (error) {
      console.error('Permission check error:', error)
      return false
    }
  }

  const skipPartner = () => {
    webrtcRef.current?.cleanup()
    setRemoteStream(null)
    setPartnerId(null)
    setMessages([])
    
    const deviceId = localStorage.getItem('deviceId') || Math.random().toString(36).substring(7)
    socketRef.current?.emit('waiting', { 
      interests: [],
      deviceId,
      filters: {
        gender: [],
        countries: [],
        gender_preference: 'any',
        country_preference: []
      },
      userProfile: {
        gender: userProfile?.gender || '',
        country: userProfile?.country || '',
        avatar_url: userProfile?.avatar_url || null,
        username: userProfile?.username || 'anonymous'
      }
    })
  }

  const reportUser = () => {
    if (!partnerId) return
    
    socketRef.current?.emit('report', { 
      reportedUser: partnerId,
      reason: 'inappropriate behavior'
    })
    
    toast.success('User reported. Finding new partner...')
    skipPartner()
  }

  const startVideoStream = async () => {
    try {
      const hasPermissions = await checkMediaPermissions()
      if (!hasPermissions) {
        toast.error('Please allow camera and microphone access')
        return null
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      return stream
    } catch (error) {
      console.error('Media stream error:', error)
      toast.error('Failed to access camera and microphone')
      return null
    }
  }

  const startChat = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to start chatting')
      return
    }

    setIsLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      localStreamRef.current = stream

      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', currentUserId)
        .single()

      const hasPreferences = preferences && (
        preferences.gender_preference !== 'any' ||
        preferences.country_preference?.length > 0 ||
        preferences.interests?.length > 0
      )

      socketRef.current?.emit('waiting', {
        interests: preferences?.interests || [],
        deviceId: stream.id,
        filters: {
          gender: [userProfile?.gender || 'not_specified'],
          countries: [userProfile?.country || 'not_specified'],
          gender_preference: preferences?.gender_preference || 'any',
          country_preference: preferences?.country_preference || [],
          preferenceTimeout: hasPreferences ? 5000 : 0 // 5 seconds timeout for preference matching
        },
        userProfile: userProfile || {
          gender: 'not_specified',
          country: 'not_specified',
          avatar_url: null,
          username: 'anonymous'
        }
      })

      setIsMatching(true)
      if (hasPreferences) {
        toast('Looking for matches based on your preferences...')
      }
    } catch (error) {
      console.error('Error starting chat:', error)
      toast.error('Failed to access camera/microphone')
    } finally {
      setIsLoading(false)
    }
  }

  const startSearching = async () => {
    try {
      if (!socketRef.current?.connected) {
        toast.error('Not connected to chat server')
        return
      }

      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current
      }

      setIsWaiting(true)
      console.log('Emitting waiting event...')
      
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', currentUserId)
        .single()

      const hasPreferences = preferences && (
        preferences.gender_preference !== 'any' ||
        preferences.country_preference?.length > 0 ||
        preferences.interests?.length > 0
      )

      socketRef.current.emit('waiting', {
        interests: preferences?.interests || [],
        deviceId: 'default',
        filters: {
          gender: [userProfile?.gender || ''],
          countries: [userProfile?.country || ''],
          gender_preference: preferences?.gender_preference || 'any',
          country_preference: preferences?.country_preference || [],
          preferenceTimeout: hasPreferences ? 15000 : 0 // 15 seconds timeout for preference matching
        },
        userProfile: {
          gender: userProfile?.gender || '',
          country: userProfile?.country || '',
          avatar_url: userProfile?.avatar_url || null,
          username: userProfile?.username || 'anonymous'
        }
      })

      if (hasPreferences) {
        toast('Looking for matches based on your preferences...')
      }
    } catch (error) {
      console.error('Error starting search:', error)
      toast.error('Failed to access camera and microphone')
    }
  }

  const handleMatchFound = async (partnerId: string) => {
    if (!socketRef.current?.id) return
    
    setPartnerId(partnerId)
    setIsMatching(false)
    setIsChatting(true)

    try {
      peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS)
      
      // Add local stream tracks to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          if (localStreamRef.current) {
            peerConnectionRef.current?.addTrack(track, localStreamRef.current)
          }
        })
      }

      // Handle incoming streams
      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind)
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate to', partnerId)
          socketRef.current?.emit('ice-candidate', {
            candidate: event.candidate,
            to: partnerId
          })
        }
      }

      // Log connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnectionRef.current?.connectionState)
      }

      peerConnectionRef.current.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnectionRef.current?.iceConnectionState)
      }

      // Create and send offer if we are the initiator
      if (socketRef.current?.id < partnerId) {
        console.log('Creating offer as initiator')
        const offer = await peerConnectionRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        })
        await peerConnectionRef.current.setLocalDescription(offer)
        socketRef.current?.emit('offer', { offer, to: partnerId })
      }
    } catch (error) {
      console.error('Error in handleMatchFound:', error)
      toast.error('Failed to establish peer connection')
    }
  }

  const handleOffer = async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
    if (!peerConnectionRef.current) return

    await peerConnectionRef.current.setRemoteDescription(offer)
    const answer = await peerConnectionRef.current.createAnswer()
    
    if (!answer) {
      console.error('Failed to create answer')
      return
    }

    await peerConnectionRef.current.setLocalDescription(answer)
    socketRef.current?.emit('answer', { answer, to: from })
  }

  const handleAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
    await peerConnectionRef.current?.setRemoteDescription(answer)
  }

  const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
    await peerConnectionRef.current?.addIceCandidate(candidate)
  }

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    const message: Message = {
      text: messageInput,
      from: currentUserId!,
      timestamp: Date.now(),
    };

    if (partnerId && socketRef.current) {
      socketRef.current.emit('message', { text: messageInput, to: partnerId });
    }
    setMessages(prev => [...prev, message]);
    setMessageInput('');
  };

  const endChat = () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop())
      }

      webrtcRef.current?.cleanup()
    setLocalStream(null)
    setRemoteStream(null)
      setPartnerId(null)
      setMessages([])
    setIsMatching(false)
    setIsChatting(false)
    
    // Clean up peer connection
    cleanup()
  }

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop())
      }
      webrtcRef.current?.cleanup()
    }
  }, [localStream, remoteStream])

  useEffect(() => {
    const handleEndVideoChat = () => {
      if (isMatching) {
        endChat()
      }
    }

    window.addEventListener('endVideoChat', handleEndVideoChat)
    return () => {
      window.removeEventListener('endVideoChat', handleEndVideoChat)
    }
  }, [isMatching])

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      setAvailableCameras(cameras)
      if (cameras.length > 0 && !currentCameraId) {
        setCurrentCameraId(cameras[0].deviceId)
      }
    } catch (error) {
      console.error('Error getting cameras:', error)
    }
  }

  const switchCamera = async () => {
    try {
      // Toggle between front and back camera
      const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
      setCameraFacing(newFacing);
      
      // Get new media stream with the selected camera facing mode
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: true
      });

      // Update the local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }

      // Update the local stream state
      setLocalStream(newStream);
      localStreamRef.current = newStream;

      // Update the connection with the new stream
      if (webrtcRef.current) {
        await webrtcRef.current.updateLocalStream(newStream);
      }
      
      toast.success(`Switched to ${newFacing === 'user' ? 'front' : 'back'} camera`);
    } catch (error) {
      console.error('Error switching camera:', error);
      toast.error('Failed to switch camera');
    }
  };

  const swapScreens = () => {
    // Toggle the state first
    setIsLocalBig(!isLocalBig);
    
    // Swap the video streams between the video elements
    if (localVideoRef.current && remoteVideoRef.current) {
      // Store the current srcObjects
      const localSrc = localVideoRef.current.srcObject;
      const remoteSrc = remoteVideoRef.current.srcObject;
      
      // Swap the srcObjects
      localVideoRef.current.srcObject = remoteSrc;
      remoteVideoRef.current.srcObject = localSrc;
    }
  }

  useEffect(() => {
    getAvailableCameras()
  }, [])

  const renderVideoGrid = () => {
    return (
      <div className="grid grid-cols-5 gap-5 md:relative z-[60] h-[calc(100vh-200px)]">
        {/* Main Video */}
        <div className="mb-4 col-span-4 relative">
          <div className="h-[calc(100vh-100px)] bg-gray-800/50 rounded-2xl overflow-hidden relative backdrop-blur-sm border border-white/10 shadow-2xl">
            {/* The main video element - only show one video here */}
            <video
              ref={isLocalBig ? localVideoRef : remoteVideoRef}
              autoPlay
              playsInline
              muted={isLocalBig}
              className="w-full h-full object-cover"
            />
            {!isLocalBig && partnerProfile && (
              <div className="absolute bottom-4 left-4 p-3 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 flex items-center gap-3 text-white">
                {partnerProfile.avatar_url ? (
                  <img src={partnerProfile.avatar_url} alt="Partner" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-lg">{partnerProfile.username.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{partnerProfile.username}</h3>
                  <p className="text-sm text-gray-300">{partnerProfile.country}</p>
                </div>
              </div>
            )}
            
            {/* Logo Watermark */} 
            <LogoWatermark size="lg" opacity={0.15} position="bottom-left" />  

            
            {/* Camera controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={switchCamera}
                disabled={availableCameras.length < 2}
                className="p-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-all"
                title={t('switchCamera')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={swapScreens}
                className="p-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-all"
                title={t('swapScreens')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>
            
            {!isLocalBig && renderVideoControls()}
          </div>
        </div>
        
        {/* Small Video */}
        <div className="col-span-1">
          <div className="aspect-[3/4] bg-gray-800/50 rounded-2xl overflow-hidden relative backdrop-blur-sm border border-white/10 shadow-xl">
            {/* The small video element */}
            <video
              ref={isLocalBig ? remoteVideoRef : localVideoRef}
              autoPlay
              playsInline
              muted={!isLocalBig}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-sm text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              {isLocalBig ? t('partner') : t('you')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderVideoControls = () => (
    <div className="absolute bottom-4 left-1/2  transform -translate-x-1/2 flex gap-3 backdrop-blur-xl bg-black/40 p-2 rounded-xl border border-white/10 shadow-lg">
      <button
        onClick={skipPartner}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-1.5 text-sm font-medium shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
        <span>Next</span>
      </button>
      
      <button
        onClick={reportUser}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all flex items-center gap-1.5 text-sm font-medium shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Report</span>
      </button>

      <button
        onClick={endChat}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1.5 text-sm font-medium shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>End</span>
      </button>

      <button
        onClick={sendFriendRequest}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-1.5 text-sm font-medium shadow-lg"
      >
        <UserPlus size={16} />
        <span>Befriend</span>
      </button>
    </div>
  );

  const ActiveUsersCounter = () => (
    <div className=" md:relative top-6 px-4 py-2 rounded-xl bg-gray-800/40 backdrop-blur-xl border border-white/10 shadow-lg flex items-center gap-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-sm font-medium text-gray-300">Active Users</span>
      </div>
      <span className="text-lg font-bold text-white">{activeUsers}</span>
    </div>
  );

  const ProfileButton = () => (
    <div className="absolute top-6 right-20 flex items-center gap-4">
      <button
        onClick={() => setShowNotifications(true)}
        className="relative p-2 rounded-full bg-gray-800/40 backdrop-blur-xl border border-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      <button
        onClick={() => setShowProfileMenu(true)}
        className="w-10 h-10 rounded-full bg-gray-800/40 backdrop-blur-xl border border-white/10 overflow-hidden"
      >
        <img src={userProfile?.avatar_url || '/default-avatar.png'} alt="" className="w-full h-full object-cover" />
      </button>
    </div>
  );

  const handleFriendRequest = async (requestId: string, accept: boolean) => {
    if (!currentUserId) return

    try {
      if (accept) {
        // Add to friends table
        await supabase.from('friends').insert([
          {
            user_id: currentUserId,
            friend_id: requestId,
            status: 'accepted'
          }
        ])

        toast.success(t('friendRequestAccepted'))
      } else {
        toast.success(t('friendRequestDeclined'))
      }

      // Update notifications
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('from_user_id', requestId)
        .eq('type', 'friend_request')

    } catch (error) {
      console.error('Error handling friend request:', error)
      toast.error(t('error'))
    }
  }

  const sendFriendRequest = async () => {
    if (!partnerId || !currentUserId || !userProfile) return;

    try {
      // Send friend request via socket
      if (socketRef.current) {
        socketRef.current.emit('friendRequest', {
          from: currentUserId,
          username: userProfile.username
        });
        toast.success('Friend request sent!');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const addNotification = async (notification: {
    type: 'friend_request' | 'room_invite' | 'message'
    from_user_id: string
    content: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newNotification: Notification = {
        id: Math.random().toString(),
        ...notification,
        read: false,
        created_at: new Date().toISOString()
      }

      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          ...notification,
          read: false
        })

      setNotifications(prev => [...prev, newNotification])
    } catch (error: any) {
      console.error('Failed to add notification:', error)
    }
  }

  const handleFriendRequestToast = (t: { id: string; visible: boolean }, data: { from: string; username: string }) => (
    <div className="flex flex-col gap-2">
      <p>{data.username} wants to be friends</p>
      <div className="flex gap-2">
        <button onClick={() => handleFriendRequest(data.from, true)} className="px-3 py-1 bg-green-500 rounded">
          Accept
        </button>
        <button onClick={() => handleFriendRequest(data.from, false)} className="px-3 py-1 bg-red-500 rounded">
          Decline
        </button>
      </div>
    </div>
  )

  const toggleChat = () => {
    setShowMobileChat(!showMobileChat)
    
    // Create a chat ID if it doesn't exist
    if (!activeChatId && partnerId) {
      // Generate a unique chat ID using the two user IDs
      const chatId = [currentUserId, partnerId].sort().join('_')
      setActiveChatId(chatId)
    }
  }

  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
  }

  useEffect(() => {
    if (isMatching || partnerId) {
      setIsInVideoChat(true)
    } else {
      setIsInVideoChat(false)
    }
  }, [isMatching, partnerId])

  // Effect to handle sidebar visibility on mobile
  useEffect(() => {
    if (isMobile && isInVideoChat) {
      setShowSidebar(false)
    } else {
      setShowSidebar(true)
    }
  }, [isMobile, isInVideoChat]);
  
  return (
    <div className="flex">
      {showSidebar && <Sidebar />}
      <div className={`min-h-screen bg-gradient-to-b from-gray-900 to-black p-6 sm:p-8 relative overflow-hidden flex-1 ${isMobile && isInVideoChat ? 'video-chat-fullwidth' : ''}`}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            background: 'radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)',
            filter: 'blur(80px)'
          }}
        />
      </div>

      <div className="max-w-[1920px] mx-auto md:relative">
        <div className="fixed left-4 top-4  ">  
          <ActiveUsersCounter />
        </div>
        {!isMatching ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8 relative"
            >
              <h2 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent text-center">
                {t('meetNewPeople')}
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl text-center">
                {t('connectWithPeople')}
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startChat}
                disabled={isLoading || !userProfile}
                className="px-10 sm:px-12 py-4 sm:py-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg sm:text-xl shadow-lg shadow-purple-500/20 mx-auto md:relative z-[60]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    {t('connecting')}
                  </div>
                ) : (
                  t('startVideoChat')
                )}
              </motion.button>
            </motion.div>

            {/* Floating Elements Animation */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, -5, 5, 0]
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
            />
          </div>
        ) : (
          <>
            {/* Desktop Layout */}
            <div className="hidden md:relative z-[60] right-6 mr-3 sm:flex gap-5 relative h-[calc(100vh-120px)]">
              <div className="flex-1 relative">
                {renderVideoGrid()}
              </div>

              <div className="w-full h-full sm:w-96 bg-gray-800/30 backdrop-blur-xl rounded-2xl flex flex-col border border-white/10 shadow-xl mr-3">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold">Chat</h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span>{activeUsers} online</span>
                    </div>
                    {partnerId && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>Connected</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                  {messages.map((message, i) => (
                    <div
                      key={i}
                      className={`flex ${message.from === socketRef.current?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          message.from === socketRef.current?.id
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'bg-gray-700/50 border border-white/10'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={t('typeMessage')}
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center"
                    >
                      <span className="sr-only">{t('sendMessage')}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* Mobile Layout */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 flex flex-nowrap flex-col h-screen">
              {/* Partner's Screen */}
              <div className="h-1/2 relative bg-gray-900 border-b  border-gray-800">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                /> 

                {/* Logo Watermark */} 
                <LogoWatermark size="md" opacity={0.15} position="bottom-left" />

                <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-lg text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>DisplayName</span>
                  </div>
                </div>
                
                {/* Screen swap and camera switch buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={swapScreens}
                    className="p-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-all"
                    title={t('swapScreens')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                  <button
                    onClick={switchCamera}
                    disabled={availableCameras.length < 2}
                    className="p-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-all"
                    title={t('switchCamera')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* User's Screen */}
              <div className="h-1/2 relative bg-gray-900">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-lg text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>You</span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="fixed bottom-1 left-2 right-3 flex justify-center gap-4">
              <div className="relative left-2 right-2 flex justify-center gap-2 px-2 py-2 bg-gray-800/10 backdrop-blur-3xl rounded-xl ">
                <button
                  onClick={skipPartner}
                  className="relative px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center gap-1.5 text-sm font-small"
                  title="Next"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  <span>Next</span>
                </button>
                <button
                  onClick={reportUser}
                  className="relative px-2.5 py-1.5 rounded-lg bg-orange-600 text-white flex items-center gap-1.5 text-sm font-medium"
                  title="Report"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Report</span>
                </button>
                <button
                  onClick={endChat}
                  className="relative px-2.5 py-1.5 rounded-lg bg-red-600 text-white flex items-center gap-1.5 text-sm font-medium"
                  title="End"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>End</span>
                </button>
                <button
                  onClick={sendFriendRequest}
                  className="relative px-2.5 py-1.5 rounded-lg bg-blue-600 text-white flex items-center gap-1.5 text-sm font-medium"
                  title="Add Friend"
                >
                  <UserPlus size={16} />
                  <span>Befriend</span>
                </button>
              </div>  

                <button
                  onClick={toggleChat}
                  className="relative px-2.5 rounded-lg bg-gray-800/10 text-white backdrop-blur-3xl flex items-center gap-1.5 text-sm font-medium"
                  title="Chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="full" >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Chat Interface */}
      {showMobileChat && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed inset-x-0 bottom-0 h-2/3 bg-gray-800/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl z-50 flex flex-col"
        >
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chat</h3>
            <button
              onClick={toggleChat}
              className="p-2 rounded-lg hover:bg-gray-700/50"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.from === socketRef.current?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.from === socketRef.current?.id
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-gray-700/50 border border-white/10'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={t('typeMessage')}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center"
              >
                <span className="sr-only">{t('sendMessage')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
   </div>
  );
}

export default VideoChat
