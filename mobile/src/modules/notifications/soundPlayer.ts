import { Audio } from 'expo-av';
import { AdhanSound } from './types';

let currentSound: Audio.Sound | null = null;

// Map sound types to audio file paths
const soundFiles: Record<Exclude<AdhanSound, 'silent'>, any> = {
  'adhan-full': require('../../../assets/adhan/adhan-full.mp3'),
  'adhan-short': require('../../../assets/adhan/adhan-short.mp3'),
  'beep': require('../../../assets/adhan/beep.mp3'),
};

/**
 * Play the selected adhan sound
 * @param selectedSound - The sound to play
 */
export async function playSound(selectedSound: AdhanSound): Promise<void> {
  // Do nothing for silent
  if (selectedSound === 'silent') {
    return;
  }

  try {
    // Stop and unload any currently playing sound
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // Load and play the new sound
    const { sound } = await Audio.Sound.createAsync(
      soundFiles[selectedSound],
      { shouldPlay: true }
    );

    currentSound = sound;

    // Clean up when playback finishes
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        if (currentSound === sound) {
          currentSound = null;
        }
      }
    });
  } catch (error) {
    console.error('Error playing sound:', error);
    throw error;
  }
}

/**
 * Stop any currently playing sound
 */
export async function stopSound(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }
}
