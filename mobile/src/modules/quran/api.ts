import axios from 'axios';
import { storage, STORAGE_KEYS } from '../../storage';
import { API_BASE_URL, API_V1_BASE_URL, API_TIMEOUT } from '../../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

const apiV1 = axios.create({
  baseURL: API_V1_BASE_URL,
  timeout: API_TIMEOUT,
});

export interface TranslationCatalog {
  identifier: string;
  language: string;
  translatorName: string;
  sourceUrl?: string;
}

export const fetchTranslationCatalog = async (): Promise<TranslationCatalog[]> => {
  try {
    const response = await apiV1.get('/quran/translations/catalog');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching translation catalog:', error);
    return [];
  }
};

export const fetchTranslation = async (
  lang: string,
  surahNumber: number
): Promise<Record<string, string>> => {
  try {
    // Try to get from cache first
    const cacheKey = `${lang}:${surahNumber}`;
    const cached = await storage.get<{ data: Record<string, string>; timestamp: number }>(
      `${STORAGE_KEYS.QURAN_TRANSLATIONS_CACHE}:${cacheKey}`
    );

    if (cached && Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
      return cached.data;
    }

    // Fetch from API
    const response = await apiV1.get('/quran/translation', {
      params: { lang, surah: surahNumber },
    });

    const translations = response.data.data;

    // Cache the result
    await storage.set(`${STORAGE_KEYS.QURAN_TRANSLATIONS_CACHE}:${cacheKey}`, {
      data: translations,
      timestamp: Date.now(),
    });

    return translations;
  } catch (error) {
    console.error('Error fetching translation:', error);

    // Return fallback translations for MVP
    return getFallbackTranslation(lang, surahNumber);
  }
};

const getFallbackTranslation = (lang: string, surahNumber: number): Record<string, string> => {
  if (surahNumber === 1) {
    if (lang === 'en') {
      return {
        '1:1': 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        '1:2': 'All praise is due to Allah, Lord of the worlds.',
        '1:3': 'The Entirely Merciful, the Especially Merciful,',
        '1:4': 'Sovereign of the Day of Recompense.',
        '1:5': 'It is You we worship and You we ask for help.',
        '1:6': 'Guide us to the straight path.',
        '1:7': 'The path of those upon whom You have bestowed favor, not of those who have evoked Your anger or of those who are astray.',
      };
    } else if (lang === 'fr') {
      return {
        '1:1': 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.',
        '1:2': 'Louange à Allah, Seigneur de l\'univers.',
        '1:3': 'Le Tout Miséricordieux, le Très Miséricordieux,',
        '1:4': 'Maître du Jour de la rétribution.',
        '1:5': 'C\'est Toi que nous adorons, et c\'est Toi dont nous implorons secours.',
        '1:6': 'Guide-nous dans le droit chemin.',
        '1:7': 'Le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés.',
      };
    } else if (lang === 'sw') {
      return {
        '1:1': 'Kwa jina la Mwenyezi Mungu, Mwingi wa Rehema, Mwenye Kurehemu.',
        '1:2': 'Sifa njema zote ni za Mwenyezi Mungu, Mola Mlezi wa walimwengu wote.',
        '1:3': 'Mwingi wa Rehema, Mwenye kurehemu.',
        '1:4': 'Mfalme wa siku ya malipo.',
        '1:5': 'Wewe tu tunaye abudu, na Wewe tu tunaye omba msaada.',
        '1:6': 'Tuongoze njia iliyo nyooka.',
        '1:7': 'Njia ya ulio waneemesha, siyo ya walio kasirikiwa wala walio potea.',
      };
    }
  }

  return {};
};

