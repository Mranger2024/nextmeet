'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'

interface LottieWrapperProps {
  animationPath: string
  loop?: boolean
  autoplay?: boolean
  style?: React.CSSProperties
  className?: string
  onComplete?: () => void
  speed?: number
  segments?: [number, number]
  direction?: 1 | -1
}

const LottieWrapper = ({
  animationPath,
  loop = true,
  autoplay = true,
  style,
  className = '',
  onComplete,
  speed = 1,
  segments,
  direction = 1
}: LottieWrapperProps) => {
  const lottieRef = useRef<any>(null)
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const data = await fetch(animationPath).then(r => r.json())
        setAnimationData(data)
        if (lottieRef.current) {
          lottieRef.current.setSpeed(speed)
          if (segments) {
            lottieRef.current.playSegments(segments, true)
          }
          if (direction === -1) {
            lottieRef.current.setDirection(-1)
          }
        }
      } catch (error) {
        console.error('Error loading Lottie animation:', error)
      }
    }

    loadAnimation()
  }, [animationPath, speed, segments, direction])

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      style={style}
      className={className}
      onComplete={onComplete}
    />
  )
}

export default LottieWrapper