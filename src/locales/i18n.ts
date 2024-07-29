import i18n from 'i18next'; // Importing i18next library for internationalization support
import LanguageDetector from 'i18next-browser-languagedetector'; // Importing language detector for browser-based language detection
import { initReactI18next } from 'react-i18next'; // Importing React integration for i18next

import { getStringItem } from '@/utils/storage'; // Importing utility function to retrieve string item from storage

import en_US from './lang/en_US'; // Importing English (US) translation resources
import hi_IN from './lang/hi_IN'; // Importing Hindi (India) translation resources

import { LocalEnum, StorageEnum } from '#/enum'; // Importing enums for local and storage identifiers

const defaultLng = getStringItem(StorageEnum.I18N) || (LocalEnum.en_US as string); // Determining default language from storage or falling back to English (US)

i18n
  .use(LanguageDetector) // Configuring i18next to use language detector for automatic language detection based on browser settings
  .use(initReactI18next) // Integrating i18next with React for seamless internationalization in React components
  .init({
    debug: true, // Enabling debug mode for i18next to log more information to the console
    lng: defaultLng, // Setting the initial language to the default language determined above
    fallbackLng: LocalEnum.en_US, // Fallback language in case the detected language is not available
    interpolation: {
      escapeValue: false, // Disabling escaping of string values for interpolation (React does this by default)
    },
    resources: {
      en_US: { translation: en_US }, // Providing English (US) translation resources to i18next
      hi_IN: { translation: hi_IN }, // Providing Hindi (India) translation resources to i18next
    },
  });

export default i18n; // Exporting configured i18n instance for use throughout the application
export const { t } = i18n; // Exporting translation function `t` from i18n for easy access in components
