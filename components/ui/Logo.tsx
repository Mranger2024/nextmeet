'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  withText?: boolean
}

export default function Logo({
  className,
  size = 'md',
  withText = true
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const LogoContent = (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(sizeClasses[size])}>
        <Image 
          src="/nextmeet-logo.ico" 
          alt="NextMeet Logo" 
          width={size === 'lg' ? 48 : size === 'md' ? 32 : 24} 
          height={size === 'lg' ? 48 : size === 'md' ? 32 : 24}
          priority
        />
      </div>
      {withText && (
        <span className={cn(
          textSizeClasses[size],
          'font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent'
        )}>
          NextMeet
        </span>
      )}
    </div>
  )

  return LogoContent
}