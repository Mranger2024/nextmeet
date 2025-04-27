export interface UserSettings {
  theme: 'dark' | 'light'
  language: string
  notifications: {
    sound: boolean
    desktop: boolean
    email: boolean
  }
  soundEffects: {
    message: boolean
    call: boolean
    notification: boolean
  }
  video: {
    quality: 'auto' | '720p' | '1080p' | '360p'
    defaultMuted: boolean
    defaultVideoOff: boolean
  }
  privacy: {
    showStatus: boolean
    allowFriendRequests: boolean
    allowDirectMessages: boolean
  }
}

export const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'en',
  notifications: {
    sound: true,
    desktop: true,
    email: false
  },
  soundEffects: {
    message: true,
    call: true,
    notification: true
  },
  video: {
    quality: 'auto',
    defaultMuted: false,
    defaultVideoOff: false
  },
  privacy: {
    showStatus: true,
    allowFriendRequests: true,
    allowDirectMessages: true
  }
}

const SETTINGS_KEY = 'user_settings'

export const loadSettings = (): UserSettings => {
  if (typeof window === 'undefined') return defaultSettings

  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (!savedSettings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings))
      return defaultSettings
    }

    const parsedSettings = JSON.parse(savedSettings)
    // Merge with defaults to ensure all properties exist
    return {
      ...defaultSettings,
      ...parsedSettings,
      notifications: {
        ...defaultSettings.notifications,
        ...parsedSettings.notifications
      },
      soundEffects: {
        ...defaultSettings.soundEffects,
        ...parsedSettings.soundEffects
      },
      video: {
        ...defaultSettings.video,
        ...parsedSettings.video
      },
      privacy: {
        ...defaultSettings.privacy,
        ...parsedSettings.privacy
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error)
    return defaultSettings
  }
}

export const saveSettings = (settings: Partial<UserSettings>): boolean => {
  if (typeof window === 'undefined') return false

  try {
    const currentSettings = loadSettings()
    const newSettings = {
      ...currentSettings,
      ...settings,
      notifications: {
        ...currentSettings.notifications,
        ...(settings.notifications || {})
      },
      soundEffects: {
        ...currentSettings.soundEffects,
        ...(settings.soundEffects || {})
      },
      video: {
        ...currentSettings.video,
        ...(settings.video || {})
      },
      privacy: {
        ...currentSettings.privacy,
        ...(settings.privacy || {})
      }
    }
    
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    return true
  } catch (error) {
    console.error('Error saving settings:', error)
    return false
  }
}

export const resetSettings = (): boolean => {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings))
    return true
  } catch (error) {
    console.error('Error resetting settings:', error)
    return false
  }
}
// Removing the unused import
