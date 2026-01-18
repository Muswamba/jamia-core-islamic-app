import { storage, STORAGE_KEYS } from '../../storage';
import { PrayerSettings, getDefaultSettings } from './types';

export const loadSettings = async (): Promise<PrayerSettings> => {
  try {
    const stored = await storage.get<PrayerSettings>(STORAGE_KEYS.PRAYER_SETTINGS);
    if (stored) {
      // Merge with defaults to ensure all fields exist
      const defaults = getDefaultSettings();
      return {
        ...defaults,
        ...stored,
        adjustments: { ...defaults.adjustments, ...stored.adjustments },
        notifications: { ...defaults.notifications, ...stored.notifications },
      };
    }
    return getDefaultSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    return getDefaultSettings();
  }
};

export const saveSettings = async (settings: PrayerSettings): Promise<void> => {
  try {
    await storage.set(STORAGE_KEYS.PRAYER_SETTINGS, settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};
