import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './fr.json';
import en from './en.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr', // Force French as default
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
