import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enNavigation from './locales/en/navigation.json';
import enSections from './locales/en/sections.json';
import enContacts from './locales/en/contacts.json';
import enLegal from './locales/en/legal.json';
import enInsurance from './locales/en/insurance.json';
import enFinance from './locales/en/finance.json';
import enDebts from './locales/en/debts.json';
import enProperty from './locales/en/property.json';
import enBusiness from './locales/en/business.json';
import enDigital from './locales/en/digital.json';
import enCare from './locales/en/care.json';
import enTax from './locales/en/tax.json';
import enWishes from './locales/en/wishes.json';
import enReview from './locales/en/review.json';
import enRendering from './locales/en/rendering.json';
import enExport from './locales/en/export.json';
import enBackup from './locales/en/backup.json';
import esCommon from './locales/es/common.json';
import esLanding from './locales/es/landing.json';
import esNavigation from './locales/es/navigation.json';
import esSections from './locales/es/sections.json';
import esContacts from './locales/es/contacts.json';
import esLegal from './locales/es/legal.json';
import esInsurance from './locales/es/insurance.json';
import esFinance from './locales/es/finance.json';
import esDebts from './locales/es/debts.json';
import esProperty from './locales/es/property.json';
import esBusiness from './locales/es/business.json';
import esDigital from './locales/es/digital.json';
import esCare from './locales/es/care.json';
import esTax from './locales/es/tax.json';
import esWishes from './locales/es/wishes.json';
import esReview from './locales/es/review.json';
import esRendering from './locales/es/rendering.json';
import esExport from './locales/es/export.json';
import esBackup from './locales/es/backup.json';
import enPublic from './locales/en/public.json';
import esPublic from './locales/es/public.json';
import enHelp from './locales/en/help.json';
import esHelp from './locales/es/help.json';
import enEducation from './locales/en/education.json';
import esEducation from './locales/es/education.json';
import enSettings from './locales/en/settings.json';
import esSettings from './locales/es/settings.json';

const storedLocale = window.localStorage.getItem('continuity-binder-locale');
export const supportedLocales = ['en', 'es'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
const initialLocale: SupportedLocale = storedLocale === 'es' ? 'es' : 'en';
document.documentElement.lang = initialLocale;
document.documentElement.dir = 'ltr';

export const resources = {
    en: { common: enCommon, landing: enLanding, navigation: enNavigation, sections: enSections, contacts: enContacts, legal: enLegal, insurance: enInsurance, finance: enFinance, debts: enDebts, property: enProperty, business: enBusiness, digital: enDigital, care: enCare, tax: enTax, wishes: enWishes, review: enReview, rendering: enRendering, export: enExport, backup: enBackup, public: enPublic, help: enHelp, education: enEducation, settings: enSettings },
    es: { common: esCommon, landing: esLanding, navigation: esNavigation, sections: esSections, contacts: esContacts, legal: esLegal, insurance: esInsurance, finance: esFinance, debts: esDebts, property: esProperty, business: esBusiness, digital: esDigital, care: esCare, tax: esTax, wishes: esWishes, review: esReview, rendering: esRendering, export: esExport, backup: esBackup, public: esPublic, help: esHelp, education: esEducation, settings: esSettings },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
