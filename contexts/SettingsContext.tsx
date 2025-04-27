'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { loadSettings, saveSettings, UserSettings, defaultSettings } from '@/lib/settings'
import { translations, TranslationKey } from '@/lib/translations'

interface SettingsContextType {
  settings: UserSettings
  isLoading: boolean
  error: string | null
  updateSettings: (newSettings: Partial<UserSettings>) => void
  resetSettings: () => void
  t: (key: TranslationKey) => string
  applyTheme: (theme: 'dark' | 'light') => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserSettings()
  }, [])

  // Update the translation function to be more robust
  const t = (key: TranslationKey): string => {
    const lang = settings.language as keyof typeof translations
    
    // First try the selected language
    // We need to ensure type safety by checking if the language exists
    const translationSet = translations[lang] || translations.en
    
    // Since TranslationKey is defined as keyof typeof translations.en,
    // we know the key exists in the English translations
    // But we need to handle the case where it might not exist in other languages
    if (translationSet === translations.en) {
      // For English, we know the key exists due to the TranslationKey type
      return translations.en[key];
    }
    
    // For other languages, we need to check if the key exists
    const translation = translationSet[key as keyof typeof translationSet]
    if (translation) return translation;
    
    // Fallback to English if the key doesn't exist in the selected language
    const fallback = translations.en[key];
    
    // If no translation found (which shouldn't happen due to the type), return the key
    if (!fallback) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    
    return fallback;
  }

  const loadUserSettings = () => {
    try {
      const userSettings = loadSettings()
      setSettings(userSettings)
      applyTheme(userSettings.theme)
    } catch (err: any) {
      setError(err.message)
      console.error('Error loading settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    try {
      const success = saveSettings(newSettings)
      if (success) {
        const updatedSettings = loadSettings()
        setSettings(updatedSettings)
        applyTheme(updatedSettings.theme)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating settings:', err)
    }
  }

  const resetSettings = () => {
    try {
      localStorage.removeItem('user_settings')
      setSettings(defaultSettings)
      applyTheme(defaultSettings.theme)
    } catch (err: any) {
      setError(err.message)
      console.error('Error resetting settings:', err)
    }
  }

  // Add theme application function
  const applyTheme = (theme: 'dark' | 'light') => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
      // Update dark theme colors
      document.documentElement.style.setProperty('--foreground', '#E2E8F0')
      document.documentElement.style.setProperty('--background', '#0F172A')
      document.documentElement.style.setProperty('--bg-primary', '#1E293B')
      document.documentElement.style.setProperty('--bg-secondary', '#334155')
      document.documentElement.style.setProperty('--text-primary', '#F1F5F9')
      document.documentElement.style.setProperty('--text-secondary', '#94A3B8')
      document.documentElement.style.setProperty('--sidebar-gradient-from', 'rgba(79, 70, 229, 0.7)')
      document.documentElement.style.setProperty('--sidebar-gradient-via', 'rgba(147, 51, 234, 0.65)')
      document.documentElement.style.setProperty('--sidebar-gradient-to', 'rgba(59, 130, 246, 0.7)')
      document.documentElement.style.setProperty('--panel-bg', 'rgba(15, 23, 42, 0.8)')
      document.documentElement.style.setProperty('--hover-bg', 'rgba(51, 65, 85, 0.6)')
      document.documentElement.style.setProperty('--active-bg', 'rgba(79, 70, 229, 0.2)')
      document.documentElement.style.setProperty('--active-text', '#818CF8')
      document.documentElement.style.setProperty('--border-color', 'rgba(148, 163, 184, 0.1)')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      // Update light theme colors
      document.documentElement.style.setProperty('--foreground', '#1E293B')
      document.documentElement.style.setProperty('--background', '#F8FAFC')
      document.documentElement.style.setProperty('--bg-primary', '#FFFFFF')
      document.documentElement.style.setProperty('--bg-secondary', '#F1F5F9')
      document.documentElement.style.setProperty('--text-primary', '#0F172A')
      document.documentElement.style.setProperty('--text-secondary', '#475569')
      document.documentElement.style.setProperty('--sidebar-gradient-from', 'rgba(79, 70, 229, 0.1)')
      document.documentElement.style.setProperty('--sidebar-gradient-via', 'rgba(147, 51, 234, 0.08)')
      document.documentElement.style.setProperty('--sidebar-gradient-to', 'rgba(59, 130, 246, 0.1)')
      document.documentElement.style.setProperty('--panel-bg', 'rgba(255, 255, 255, 0.9)')
      document.documentElement.style.setProperty('--hover-bg', 'rgba(241, 245, 249, 0.9)')
      document.documentElement.style.setProperty('--active-bg', 'rgba(79, 70, 229, 0.1)')
      document.documentElement.style.setProperty('--active-text', '#4F46E5')
      document.documentElement.style.setProperty('--border-color', 'rgba(148, 163, 184, 0.2)')
    }
  }

  const value = {
    settings,
    isLoading,
    error: error ? t('error') : null,
    updateSettings,
    resetSettings,
    t,
    applyTheme
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}