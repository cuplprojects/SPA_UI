// Importing Ant Design locales for English (US) and Hindi (India)
import en_US from 'antd/locale/en_US';
import hi_IN from 'antd/locale/hi_IN';

// Importing the useTranslation hook from react-i18next for handling translations
import { useTranslation } from 'react-i18next';

// Importing the LocalEnum which likely contains enums for localization keys
import { LocalEnum } from '#/enum';

// Importing the type definition for Ant Design locale
import type { Locale as AntdLocal } from 'antd/es/locale';

// Defining a union type of all keys from LocalEnum as Locale
type Locale = keyof typeof LocalEnum;

// Defining the structure of a Language object
type Language = {
  locale: keyof typeof LocalEnum; // Key of LocalEnum indicating the locale
  icon: string; // String representing the icon associated with the language
  label: string; // String representing the label (name) of the language
  antdLocal: AntdLocal; // Ant Design locale object associated with the language
};

// Mapping between locales defined in LocalEnum and their corresponding Language objects
export const LANGUAGE_MAP: Record<Locale, Language> = {
  [LocalEnum.hi_IN]: { // Mapping for Hindi (India)
    locale: LocalEnum.hi_IN,
    label: 'हिंदी', // Label in Hindi
    icon: 'ic-locale_hi_IN', // Icon for Hindi
    antdLocal: hi_IN, // Ant Design locale for Hindi (India)
  },
  [LocalEnum.en_US]: { // Mapping for English (US)
    locale: LocalEnum.en_US,
    label: 'English', // Label in English
    icon: 'ic-locale_en_US', // Icon for English
    antdLocal: en_US, // Ant Design locale for English (US)
  },
};

// Custom hook for managing locale and language settings
export default function useLocale() {
  const { i18n } = useTranslation(); // Accessing i18n instance from useTranslation hook

  /**
   * Function to change the current locale/language
   * @param locale - The locale key to change to
   */
  const setLocale = (locale: Locale) => {
    i18n.changeLanguage(locale); // Calling i18n's changeLanguage method to update the language
  };

  // Resolving the current locale/language from i18n instance
  const locale = (i18n.resolvedLanguage || LocalEnum.en_US) as Locale;

  // Getting the Language object corresponding to the current locale from LANGUAGE_MAP
  const language = LANGUAGE_MAP[locale];

  // Returning the current locale, its associated Language object, and the setLocale function
  return {
    locale,
    language,
    setLocale,
  };
}
