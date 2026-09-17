import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createEncryptedBackup, validateEncryptedBackup } from '../../backup/encryptedBackup';
import type { ContinuityDatabase } from '../../data/repositories/encryptedRepository';

export function EncryptedBackup({ database }: { database: ContinuityDatabase | null }) {
  const { t } = useTranslation('backup');
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'created' | 'valid' | 'invalid'>('idle');
  const create = async () => {
    if (!database) return;
    const { blob } = await createEncryptedBackup(database);
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `Continuity-Binder-${new Date().toISOString().slice(0, 10)}.continuity-backup`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    setStatus('created');
  };
  const validate = async (file: Parameters<typeof validateEncryptedBackup>[0] | undefined) => { if (!file) return; try { await validateEncryptedBackup(file); setStatus('valid'); } catch { setStatus('invalid'); } };
  return <section className="section-page"><p className="eyebrow">{t('title')}</p><h2>{t('title')}</h2><p className="security-clarification">{t('explain')}</p><label><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> {t('explain')}</label><button type="button" className="button button-primary" disabled={!confirmed || !database} onClick={() => void create()}>{t('button')}</button><label>{t('choose')}<input type="file" accept=".continuity-backup" onChange={(event) => void validate(event.target.files?.[0])} /></label>{status === 'created' && <p role="status">{t('created')}</p>}{status === 'valid' && <p role="status">{t('valid')}</p>}{status === 'invalid' && <p role="alert">{t('invalid')}</p>}</section>;
}
