'use client'

import { useState, useEffect } from 'react'
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  MonitorUp, LayoutGrid, Maximize2, Camera,
  MessageSquare, Users
} from 'lucide-react'

interface VideoControlsProps {
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isSharingScreen: boolean
  isGridLayout: boolean
  isChatOpen: boolean
  isParticipantsOpen: boolean
  cameraFacing: 'user' | 'environment'
  onToggleAudio: () => void
  onToggleVideo: () => void
  onToggleScreenShare: () => void
  onToggleLayout: () => void
  onToggleChat: () => void
  onToggleParticipants: () => void
  onSwitchCamera: () => void
  onLeaveRoom: () => void
}

export default function VideoControls({
  isAudioEnabled,
  isVideoEnabled,
  isSharingScreen,
  isGridLayout,
  isChatOpen,
  isParticipantsOpen,
  cameraFacing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleLayout,
  onToggleChat,
  onToggleParticipants,
  onSwitchCamera,
  onLeaveRoom
}: VideoControlsProps) {
  // Detect if we're on a mobile device by checking window width
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 p-2 md:p-3 bg-black/70 backdrop-blur-lg rounded-full shadow-lg border border-white/10">
      <button
        onClick={onToggleAudio}
        className={`p-2 md:p-3 rounded-full transition-colors ${
          isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
        }`}
        title={isAudioEnabled ? 'Mute' : 'Unmute'}
      >
        {isAudioEnabled ? <Mic size={isMobile ? 16 : 19} /> : <MicOff size={isMobile ? 16 : 19} />}
      </button>

      <button
        onClick={onToggleVideo}
        className={`p-2 md:p-3 rounded-full transition-colors ${
          isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
        }`}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <Video size={isMobile ? 16 : 19} /> : <VideoOff size={isMobile ? 16 : 19} />}
      </button>

      <button
        onClick={onSwitchCamera}
        className="p-2 md:p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
        title={`Switch camera (currently: ${cameraFacing === 'user' ? 'front' : 'back'})`}
      >
        <Camera size={isMobile ? 16 : 19} />
      </button>

      {!isMobile && (
        <button
          onClick={onToggleScreenShare}
          className={`p-2 md:p-3 rounded-full transition-colors ${
            isSharingScreen ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isSharingScreen ? 'Stop sharing' : 'Share screen'}
        >
          <MonitorUp size={19} />
        </button>
      )}

      <button
        onClick={onToggleLayout}
        className={`p-2 md:p-3 rounded-full transition-colors ${
          isGridLayout ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        title={isGridLayout ? 'Speaker view' : 'Grid view'}
      >
        {isGridLayout ? <Maximize2 size={isMobile ? 16 : 19} /> : <LayoutGrid size={isMobile ? 16 : 19} />}
      </button>

      <button
        onClick={onToggleChat}
        className={`p-2 md:p-3 rounded-full transition-colors ${
          isChatOpen ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        title={isChatOpen ? 'Close chat' : 'Open chat'}
      >
        <MessageSquare size={isMobile ? 16 : 19} />
      </button>

      <button
        onClick={onToggleParticipants}
        className={`p-2 md:p-3 rounded-full transition-colors ${
          isParticipantsOpen ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        title={isParticipantsOpen ? 'Close participants' : 'Show participants'}
      >
        <Users size={isMobile ? 16 : 19} />
      </button>

      <button
        onClick={onLeaveRoom}
        className="p-2 md:p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
        title="Leave room"
      >
        <PhoneOff size={isMobile ? 16 : 19} />
      </button>
    </div>
  )
}
