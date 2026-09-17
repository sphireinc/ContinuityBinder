import { useTranslation } from 'react-i18next';
import type { SupportedLocale } from './config';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const locale = i18n.language === 'es' ? 'es' : 'en';
  const names: Record<SupportedLocale, string> = { en: 'English', es: 'Español' };
  return <label className="language-selector"> <span>{t('language')}</span><select value={locale} onChange={(event) => { const next = event.target.value as SupportedLocale; void i18n.changeLanguage(next); window.localStorage.setItem('continuity-binder-locale', next); document.documentElement.lang = next; document.documentElement.dir = 'ltr'; }} aria-label={t('language')}><option value="en">{names.en}</option><option value="es">{names.es}</option></select></label>;
}
