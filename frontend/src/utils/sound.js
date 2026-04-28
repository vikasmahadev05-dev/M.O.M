let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

// Sound Registry with absolute paths for robustness
const sounds = {
  notification: { path: '/sounds/mixkit-sci-fi-click-900.wav', instance: null },
  alarm: { path: '/sounds/mixkit-glitchy-sci-fi-bass-suspense-686.wav', instance: null },
  click: { path: '/sounds/mixkit-sci-fi-confirmation-914.wav', instance: null }
};

/**
 * Initializes the sound system.
 */
export const initSound = () => {
  if (typeof window === 'undefined') return;

  Object.keys(sounds).forEach(key => {
    if (!sounds[key].instance) {
      const audio = new Audio(sounds[key].path);
      audio.preload = 'auto';
      // Set volumes
      if (key === 'alarm') audio.volume = 0.7;
      else if (key === 'click') audio.volume = 0.5;
      else audio.volume = 0.4;
      
      sounds[key].instance = audio;
    }
  });

  const unlockAudio = () => {
    console.log('Attempting to unlock audio for all types...');
    Object.keys(sounds).forEach(key => {
      const audio = sounds[key].instance;
      if (audio) {
        audio.play()
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            console.log(`✅ ${key} sound unlocked.`);
          })
          .catch(e => console.warn(`⚠️ Could not unlock ${key}:`, e.message));
      }
    });
    
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };

  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchstart', unlockAudio);
};

/**
 * Plays a specific sound.
 */
export const playSound = (type = 'notification') => {
  if (!soundEnabled) {
    console.log('🔇 Sound disabled in settings.');
    return;
  }
  
  const soundEntry = sounds[type] || sounds.notification;
  let audio = soundEntry.instance;

  // Fallback: create instance on the fly if not initialized
  if (!audio) {
    console.log(`Initializing ${type} instance on the fly...`);
    audio = new Audio(soundEntry.path);
    soundEntry.instance = audio;
  }

  try {
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => console.log(`▶️ Playing ${type} sound.`))
        .catch(error => {
          console.warn(`🔇 Playback blocked for ${type}:`, error.message);
          // If blocked, we try again on the next interaction
        });
    }
  } catch (error) {
    console.error(`Error playing ${type} sound:`, error);
  }
};

/**
 * Stops specific or all sounds.
 */
export const stopSound = (type = null) => {
  if (type) {
    const audio = sounds[type]?.instance;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  } else {
    Object.keys(sounds).forEach(key => {
      const audio = sounds[key].instance;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }
};

export const setSoundEnabled = (enabled) => {
  soundEnabled = enabled;
  localStorage.setItem('soundEnabled', enabled.toString());
};

export const isSoundEnabled = () => soundEnabled;
