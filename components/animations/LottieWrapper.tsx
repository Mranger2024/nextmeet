'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'
import { AnimationItem } from 'lottie-web'

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
  const lottieRef = useRef<LottieRefCurrentType>(null)
  const [animationData, setAnimationData] = useState<LottieAnimationData>(null)

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

// Define proper types for Lottie animation
interface LottieRefCurrentType {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: number) => void;
  playSegments: (segments: [number, number] | [number, number][], forceFlag?: boolean) => void;
  goToAndStop: (value: number, isFrame?: boolean) => void;
  goToAndPlay: (value: number, isFrame?: boolean) => void;
  setSubframe: (useSubFrames: boolean) => void;
  getDuration: (inFrames?: boolean) => number | undefined;
  destroy: () => void;
  animationContainerRef: React.RefObject<HTMLDivElement>;
  animationLoaded: boolean;
  animationItem: AnimationItem | undefined;
}

type LottieAnimationData = Record<string, unknown> | null;