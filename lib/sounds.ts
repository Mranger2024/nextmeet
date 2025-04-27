// Define the type for our sounds object
type SoundType = 'message' | 'call' | 'notification';

// Initialize sounds as null initially
let sounds: Record<SoundType, HTMLAudioElement | null> = {
  message: null,
  call: null,
  notification: null
};

// Initialize sounds only on client side
if (typeof window !== 'undefined') {
  sounds = {
    message: new Audio('/sounds/message.mp3'),
    call: new Audio('/sounds/call.mp3'),
    notification: new Audio('/sounds/notification.mp3')
  };
  
  // Preload audio files
  Object.values(sounds).forEach(audio => {
    audio?.load();
  });
}

export const playSound = (type: SoundType) => {
  if (typeof window === 'undefined' || !sounds[type]) return;
  try {
    sounds[type]?.play().catch(error => {
      console.error(`Failed to play ${type} sound:`, error);
    });
  } catch (error) {
    console.error(`Error playing ${type} sound:`, error);
  }
}