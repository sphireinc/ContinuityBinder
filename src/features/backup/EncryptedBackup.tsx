import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createEncryptedBackup,
  restoreEncryptedBackup,
  validateEncryptedBackup,
} from '../../backup/encryptedBackup';
import type { ContinuityDatabase } from '../../data/repositories/encryptedRepository';

export function EncryptedBackup({
  database,
  restoreOnly = false,
  onRestored,
}: {
  database: ContinuityDatabase | null;
  restoreOnly?: boolean;
  onRestored?: () => void;
}) {
  const { t } = useTranslation('backup');
  const [confirmed, setConfirmed] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [replacePhrase, setReplacePhrase] = useState('');
  const [file, setFile] =
    useState<Parameters<typeof validateEncryptedBackup>[0]>();
  const [metadata, setMetadata] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'created' | 'valid' | 'invalid'
  >('idle');
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
  const validate = async (
    nextFile: Parameters<typeof validateEncryptedBackup>[0] | undefined,
  ) => {
    if (!nextFile) return;
    setFile(nextFile);
    try {
      const manifest = await validateEncryptedBackup(nextFile);
      setMetadata(manifest.createdAt);
      setStatus('valid');
    } catch {
      setMetadata('');
      setStatus('invalid');
    }
  };
  const restore = async () => {
    if (!database || !file || replacePhrase !== 'REPLACE' || !passphrase)
      return;
    try {
      await restoreEncryptedBackup(database, file, passphrase);
      setStatus('created');
      onRestored?.();
    } catch {
      setStatus('invalid');
    }
  };
  return (
    <section className="section-page">
      <p className="eyebrow">{t('title')}</p>
      <h2>{t('title')}</h2>
      {!restoreOnly && (
        <>
          <p className="security-clarification">{t('explain')}</p>
          <label>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />{' '}
            {t('explain')}
          </label>
          <button
            type="button"
            className="button button-primary"
            disabled={!confirmed || !database}
            onClick={() => void create()}
          >
            {t('button')}
          </button>
        </>
      )}
      <label>
        {t('choose')}
        <input
          type="file"
          accept=".continuity-backup"
          onChange={(event) => void validate(event.target.files?.[0])}
        />
      </label>
      {status === 'valid' && (
        <>
          <p role="status">
            {t('valid')} {metadata}
          </p>
          <p className="security-clarification">
            {t('replaceWarning', {
              defaultValue:
                'This will replace the current local binder. Create an encrypted backup of the current binder first if you may need it.',
            })}
          </p>
          <label>
            {t('passphrase')}
            <input
              type="password"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
            />
          </label>
          <label>
            {t('replacePrompt')}
            <input
              value={replacePhrase}
              onChange={(event) => setReplacePhrase(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="button"
            disabled={!database || !passphrase || replacePhrase !== 'REPLACE'}
            onClick={() => void restore()}
          >
            {t('replace')}
          </button>
        </>
      )}
      {status === 'created' && <p role="status">{t('restored')}</p>}
      {status === 'invalid' && <p role="alert">{t('invalid')}</p>}
    </section>
  );
}
