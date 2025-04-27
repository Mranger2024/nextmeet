'use client'

import { useState } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { Volume2, VolumeX, Bell, BellOff, Mail, Ban, Moon, Sun, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { playSound } from '@/lib/sounds'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' }
] as const

export default function SettingsPanel() {
  const { settings, isLoading, error, updateSettings, t } = useSettings()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleThemeChange = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
      await updateSettings({ theme: newTheme })
      toast.success(t('themeUpdated'))
    } catch {
      toast.error(t('themeUpdateError'))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLanguageChange = async (language: typeof languages[number]['code']) => {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      await updateSettings({ language })
      toast.success(t('languageUpdated'))
      // Force a re-render to update all translations
      window.location.reload()
    } catch {
      toast.error(t('languageUpdateError'))
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleNotification = async (key: keyof typeof settings.notifications) => {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      // Play notification sound when toggling notification settings
      if (settings.notifications.sound && key !== 'sound') {
        playSound('notification')
      }
      
      const newValue = !settings.notifications[key]
      await updateSettings({
        notifications: {
          ...settings.notifications,
          [key]: newValue
        }
      })
      
      // If enabling sound notifications, play a sound to demonstrate
      if (key === 'sound' && newValue) {
        playSound('notification')
      }
      
      toast.success(t('settingsUpdated'))
    } catch {
      toast.error(t('settingsUpdateError'))
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleSoundEffect = async (key: keyof typeof settings.soundEffects) => {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      const newValue = !settings.soundEffects[key]
      await updateSettings({
        soundEffects: {
          ...settings.soundEffects,
          [key]: newValue
        }
      })
      
      // Play the corresponding sound effect if it's being enabled
      if (newValue && settings.notifications.sound) {
        playSound(key)
      }
      
      toast.success(t('settingsUpdated'))
    } catch {
      toast.error(t('settingsUpdateError'))
    } finally {
      setIsUpdating(false)
    }
  }

  // Function to test sound effects
  const testSoundEffect = (type: keyof typeof settings.soundEffects) => {
    if (settings.notifications.sound && settings.soundEffects[type]) {
      playSound(type)
    } else {
      toast.error(t('soundDisabled'))
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        Error loading settings: {error}
      </div>
    )
  }

  return (

    <div className="h-full flex flex-col backdrop-blur-lg shadow-lg z-50 text-gray-200 
      overflow-hidden 
      scrollbar-thin 
      scrollbar-track-color-900 
      scrollbar-thumb-color-900 
      hover:scrollbar-thumb-color-500">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold">{t('settings')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Theme */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('theme')}</h3>
          <button
            onClick={handleThemeChange}
            className="w-full p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 
                     transition-all flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              {settings.theme === 'dark' ? t('darkMode') : t('lightMode')}
            </span>
          </button>
        </div>

        {/* Language */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('language')}</h3>
          <div className="grid grid-cols-2 gap-2">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-3 rounded-lg flex items-center gap-2 transition-all
                  ${settings.language === lang.code
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800/50 hover:bg-gray-800/70'
                  }`}
              >
                <Globe size={16} />
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('notifications')}</h3>
          <div className="space-y-2">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <button
                key={key}
                onClick={() => toggleNotification(key as keyof typeof settings.notifications)}
                className="w-full p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 
                         transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {key === 'sound' && (value ? <Volume2 size={20} /> : <VolumeX size={20} />)}
                  {key === 'desktop' && (value ? <Bell size={20} /> : <BellOff size={20} />)}
                  {key === 'email' && (value ? <Mail size={20} /> : <Ban size={20} />)}
                  {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                </span>
                <div className={`w-10 h-6 rounded-full transition-all ${value ? 'bg-blue-500' : 'bg-gray-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-all transform translate-y-1 
                    ${value ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sound Effects */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('soundEffects')}</h3>
          <div className="space-y-2">
            {Object.entries(settings.soundEffects).map(([key, value]) => (
              <div key={key} className="flex flex-col space-y-2">
                <button
                  onClick={() => toggleSoundEffect(key as keyof typeof settings.soundEffects)}
                  className="w-full p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 
                           transition-all flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {value ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    {key.charAt(0).toUpperCase() + key.slice(1)} Sounds
                  </span>
                  <div className={`w-10 h-6 rounded-full transition-all ${value ? 'bg-blue-500' : 'bg-gray-600'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform translate-y-1 
                      ${value ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </button>
                {value && (
                  <button 
                    onClick={() => testSoundEffect(key as keyof typeof settings.soundEffects)}
                    className="ml-auto text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Test Sound
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  )
}