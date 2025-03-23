'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import FloatingChatbot from './FloatingChatbot'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { settings, applyTheme } = useSettings()
  const pathname = usePathname()

  useEffect(() => {
    applyTheme(settings.theme)
    document.documentElement.lang = settings.language
  }, [settings.theme, settings.language, applyTheme])

  return (
    <>
      {children}
      {pathname === '/' && <FloatingChatbot />}
    </>
  )
}