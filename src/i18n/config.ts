import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enNavigation from './locales/en/navigation.json';
import esCommon from './locales/es/common.json';
import esLanding from './locales/es/landing.json';
import esNavigation from './locales/es/navigation.json';

const storedLocale = window.localStorage.getItem('continuity-binder-locale');
export const supportedLocales = ['en', 'es'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
const initialLocale: SupportedLocale = storedLocale === 'es' ? 'es' : 'en';
document.documentElement.lang = initialLocale;
document.documentElement.dir = 'ltr';

export const resources = {
    en: { common: enCommon, landing: enLanding, navigation: enNavigation },
    es: { common: esCommon, landing: esLanding, navigation: esNavigation },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
