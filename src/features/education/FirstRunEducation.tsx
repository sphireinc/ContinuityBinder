import { useTranslation } from 'react-i18next';

export function FirstRunEducation({ step, onNext, onSkip }: { step: number; onNext: () => void; onSkip: () => void }) {
  const { t } = useTranslation('education');
  const title = t(`step${step + 1}Title`);
  const body = t(`step${step + 1}Body`);
  return <main className="public-page"><p className="eyebrow">{t('eyebrow')}</p><h1>{title}</h1><p>{body}</p><p>{t('progress', { current: step + 1, total: 3 })}</p>{step > 0 && <button type="button" className="quiet-link" onClick={onSkip}>{t('skip')}</button>}<button type="button" className="button button-primary" onClick={onNext}>{step === 2 ? t('begin') : t('continue')}</button></main>;
}
