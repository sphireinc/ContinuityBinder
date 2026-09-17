import { useTranslation } from 'react-i18next';

const topics = ['clearData', 'recovery', 'encryption', 'server', 'offline', 'moveComputer', 'exportDifference', 'will', 'passwords', 'review', 'print', 'erase'] as const;
export function Help() {
  const { t } = useTranslation('help');
  return <main className="public-page"><p className="eyebrow">{t('eyebrow')}</p><h1>{t('title')}</h1>{topics.map((topic) => <section key={topic}><h2>{t(`${topic}Question`)}</h2><p>{t(`${topic}Answer`)}</p></section>)}</main>;
}
