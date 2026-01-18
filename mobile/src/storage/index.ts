import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  LANGUAGE: '@adhan_app:language',
  LOCATION: '@adhan_app:location',
  PRAYER_SETTINGS: '@adhan_app:prayer_settings',
  ADHAN_SETTINGS: '@adhan_app:adhan_settings',
  NOTIFICATION_SETTINGS: '@adhan_app:notification_settings',
  QURAN_BOOKMARKS: '@adhan_app:quran_bookmarks',
  QURAN_LAST_READ: '@adhan_app:quran_last_read',
  QURAN_TRANSLATIONS_CACHE: '@adhan_app:quran_translations',
  LEARN_CONTENT_CACHE: '@adhan_app:learn_content',
  LEARN_PROGRESS: '@adhan_app:learn_progress',
  SELECTED_TRANSLATION: '@adhan_app:selected_translation',
  THEME_MODE: '@adhan_app:theme_mode',
  FONT_SIZE: '@adhan_app:font_size',
};

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

export { STORAGE_KEYS };
