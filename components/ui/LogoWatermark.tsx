'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoWatermarkProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  opacity?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export default function LogoWatermark({
  className,
  size = 'md',
  opacity = 0.2,
  position = 'bottom-right'
}: LogoWatermarkProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const positionClasses = {
    'top-left': 'top-4 left-6',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-10',
    'bottom-right': 'bottom-4 right-4'
  }

  return (
    <div 
      className={cn(
        'absolute z-10 pointer-events-none',
        positionClasses[position],
        className
      )}
      style={{ opacity }}
    >
      <div className={cn(sizeClasses[size])}>
        <Image 
          src="/nextmeet-logo.ico" 
          alt="NextMeet Logo" 
          width={size === 'lg' ? 96 : size === 'md' ? 72 : 64} 
          height={size === 'lg' ? 96 : size === 'md' ? 72 : 64}
          priority
        />
        <span className="text-l font-bold bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-transparent bg-clip-text">
                NEXTMEET
        </span>
      </div>
    </div>
  )
}