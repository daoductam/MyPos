import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import vi from './locales/vi.json';
import en from './locales/en.json';

// Ensure default language is 'vi' if not previously set by user
const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;
const defaultLanguage = (savedLanguage === 'en' || savedLanguage === 'vi') ? savedLanguage : 'vi';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    lng: defaultLanguage,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
