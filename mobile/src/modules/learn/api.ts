import axios from 'axios';
import { API_V1_BASE_URL, API_TIMEOUT } from '../../config/api';
import { storage, STORAGE_KEYS } from '../../storage';
import { Category, Lesson } from './types';

const api = axios.create({
  baseURL: API_V1_BASE_URL,
  timeout: API_TIMEOUT,
});

export interface LearnPackResponse {
  success: boolean;
  data: {
    lang: string;
    version: string;
    categories: Category[];
    lessons: Lesson[];
  };
}

/**
 * Fetch learn content from backend API
 * Falls back to local data if API is unavailable
 */
export const fetchLearnContent = async (lang: string): Promise<{ categories: Category[]; lessons: Lesson[] }> => {
  try {
    // Try to get from cache first
    const cached = await storage.get<{ categories: Category[]; lessons: Lesson[]; timestamp: number }>(
      `${STORAGE_KEYS.LEARN_CONTENT_CACHE}:${lang}`
    );

    // Cache for 7 days
    if (cached && Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
      console.log('Using cached learn content for', lang);
      return { categories: cached.categories, lessons: cached.lessons };
    }

    // Fetch from API
    console.log('Fetching learn content from API for', lang);
    const response = await api.get<LearnPackResponse>('/content/learn', {
      params: { lang },
    });

    if (response.data.success && response.data.data) {
      const { categories, lessons } = response.data.data;

      // Cache the result
      await storage.set(`${STORAGE_KEYS.LEARN_CONTENT_CACHE}:${lang}`, {
        categories,
        lessons,
        timestamp: Date.now(),
      });

      return { categories, lessons };
    }

    // If API response is not successful, fall back to local data
    console.log('API response not successful, using local data');
    return getFallbackData(lang);
  } catch (error) {
    console.error('Error fetching learn content:', error);
    // Return fallback local data
    return getFallbackData(lang);
  }
};

/**
 * Get fallback data from local storage
 * This imports from the existing data.ts file
 */
const getFallbackData = (lang: string): { categories: Category[]; lessons: Lesson[] } => {
  // Lazy import to avoid circular dependencies
  const { getCategories, getLessons } = require('./data');
  return {
    categories: getCategories(lang),
    lessons: getLessons(lang),
  };
};
