import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { storage, STORAGE_KEYS } from '../storage';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import sw from './locales/sw.json';
import ar from './locales/ar.json';

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  sw: {
    translation: sw,
  },
  ar: {
    translation: ar,
  },
};

export const initI18n = async () => {
  // Get saved language preference or use device locale
  let language = await storage.get<string>(STORAGE_KEYS.LANGUAGE);

  if (!language) {
    // Get device locale
    const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
    // Map device locale to supported UI languages (en/fr/sw)
    if (deviceLocale === 'fr') {
      language = 'fr';
    } else if (deviceLocale === 'sw') {
      language = 'sw';
    } else if (deviceLocale === 'ar') {
      language = 'ar';
    } else {
      language = 'en';
    }
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'en',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
    });

  return i18n;
};

export default i18n;
