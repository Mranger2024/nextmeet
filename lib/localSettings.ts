export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  video: {
    quality: 'auto' | '720p' | '1080p' | '360p';
    defaultMuted: boolean;
    defaultVideoOff: boolean;
  };
  audio: {
    inputDevice: string;
    outputDevice: string;
    defaultMuted: boolean;
    noiseSuppression: boolean;
    echoCancellation: boolean;
  };
  chat: {
    fontSize: number;
    enterToSend: boolean;
    showTimestamps: boolean;
  };
  privacy: {
    showStatus: boolean;
    allowFriendRequests: boolean;
    allowDirectMessages: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reducedMotion: boolean;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
  },
  video: {
    quality: 'auto',
    defaultMuted: false,
    defaultVideoOff: false,
  },
  audio: {
    inputDevice: 'default',
    outputDevice: 'default',
    defaultMuted: false,
    noiseSuppression: true,
    echoCancellation: true,
  },
  chat: {
    fontSize: 16,
    enterToSend: true,
    showTimestamps: true,
  },
  privacy: {
    showStatus: true,
    allowFriendRequests: true,
    allowDirectMessages: true,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
  },
};

const SETTINGS_KEY = 'videochat_settings';

export const loadSettings = (): AppSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  const savedSettings = localStorage.getItem(SETTINGS_KEY);
  if (!savedSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }

  try {
    const parsedSettings = JSON.parse(savedSettings);
    // Merge with default settings to ensure all properties exist
    return { ...DEFAULT_SETTINGS, ...parsedSettings };
  } catch (error) {
    console.error('Failed to parse settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Partial<AppSettings>) => {
  if (typeof window === 'undefined') return;

  const currentSettings = loadSettings();
  const newSettings = { ...currentSettings, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
};

export const resetSettings = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
};
