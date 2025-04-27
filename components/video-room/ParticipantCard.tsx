'use client'

import { useState, useEffect, useRef } from 'react'
import { MicOff, VideoOff } from 'lucide-react'
import LogoWatermark from '@/components/ui/LogoWatermark'

interface ParticipantCardProps {
  id: string
  username: string
  displayName?: string
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isMainSpeaker: boolean
  isSpeaking: boolean
  stream?: MediaStream
  onClick: () => void
}

export default function ParticipantCard({
  username,
  displayName,
  isAudioEnabled,
  isVideoEnabled,
  isMainSpeaker,
  isSpeaking,
  stream,
  onClick
}: ParticipantCardProps) {
  const [audioLevel, setAudioLevel] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!stream) return

    let audioContext: AudioContext
    let analyser: AnalyserNode
    let dataArray: Uint8Array
    let animationFrame: number

    const analyzeAudio = () => {
      try {
        if (!analyser) return
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average / 255)
        animationFrame = requestAnimationFrame(analyzeAudio)
      } catch (error) {
        console.error('Error analyzing audio:', error)
      }
    }

    const initializeAudioAnalysis = async () => {
      try {
        audioContext = new AudioContext()
        analyser = audioContext.createAnalyser()
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)
        analyser.fftSize = 256
        dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyzeAudio()
      } catch (error) {
        console.error('Error initializing audio analysis:', error)
      }
    }

    initializeAudioAnalysis()

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
      if (audioContext) audioContext.close()
    }
  }, [stream, isAudioEnabled])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div
      onClick={onClick}
      className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all
        ${isMainSpeaker ? 'ring-2 md:ring-4 ring-blue-500' : ''}
        ${isSpeaking ? 'ring-1 md:ring-2 ring-green-500' : ''}
        hover:ring-2 hover:ring-white/50
      `}
      style={{
        boxShadow: isSpeaking ? `0 0 ${Math.floor(audioLevel * 20)}px ${Math.floor(audioLevel * 10)}px rgba(34, 197, 94, 0.5)` : 'none'
      }}
    >
      {isVideoEnabled && stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover bg-gray-800"
          />
          <LogoWatermark size="lg" opacity={0.15} position="bottom-right" />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-2xl md:text-4xl font-bold text-gray-600">
            {(displayName || username)[0].toUpperCase()}
          </div>
          <LogoWatermark size="sm" opacity={0.15} position="bottom-right" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-1 md:p-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm font-medium truncate">
            {displayName || username}
          </span>
          <div className="flex items-center gap-1">
            {!isAudioEnabled && (
              <MicOff size={14} className="text-red-500" />
            )}
            {!isVideoEnabled && (
              <VideoOff size={14} className="text-red-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
