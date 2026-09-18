import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function FirstRunEducation({ step, onNext }: { step: number; onNext: () => void }) {
  const { t } = useTranslation('education');
  const [remaining, setRemaining] = useState(5);
  useEffect(() => {
    setRemaining(5);
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);
  const title = t(`step${step + 1}Title`);
  const body = t(`step${step + 1}Body`);
  const enabledLabel = step === 2 ? t('begin') : t('continue');
  return <main className="public-page"><p className="eyebrow">{t('eyebrow')}</p><h1>{title}</h1><p>{body}</p><p>{t('progress', { current: step + 1, total: 3 })}</p><button type="button" className="button button-primary" disabled={remaining > 0} aria-describedby="education-countdown-help" onClick={onNext}>{remaining > 0 ? t('countdown', { seconds: remaining }) : enabledLabel}</button><span id="education-countdown-help" aria-live="off">{t('countdownHelp')}</span></main>;
}
