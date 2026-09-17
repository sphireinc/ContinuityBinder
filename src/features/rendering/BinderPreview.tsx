import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  buildBinderDocument,
  type BinderChoices,
} from '../../rendering/binderDocument';
import {
  createEncryptedRepository,
  type ContinuityDatabase,
} from '../../data/repositories/encryptedRepository';
import { personalLetterSchema } from '../wishes/WishesLegacy';
import { householdSchema } from '../household/HouseholdSetup';

export function BinderPreview({
  database,
  dek,
}: {
  database?: ContinuityDatabase | null;
  dek?: CryptoKey;
}) {
  database ??= null;
  const { t } = useTranslation('rendering');
  const [choices, setChoices] = useState<BinderChoices>({
    identifier: 'last4',
    balances: 'omit',
    letters: true,
    medical: true,
    digital: true,
  });
  const [pageSize, setPageSize] = useState<'letter' | 'a4'>('letter');
  const [includeCover, setIncludeCover] = useState(true);
  const [saved, setSaved] = useState(false);
  const [letterContent, setLetterContent] = useState<string[]>([]);
  const [householdName, setHouseholdName] = useState('');
  useEffect(() => {
    if (!database || !dek) return;
    void Promise.all([
      createEncryptedRepository(
        database,
        dek,
        'PersonalLetter',
        personalLetterSchema,
      ).list(),
      createEncryptedRepository(
        database,
        dek,
        'Household',
        householdSchema,
      ).list(),
    ]).then(([letters, households]) => {
      setLetterContent(
        letters
          .filter((letter) => letter.includePrint)
          .map((letter) =>
            letter.sealed
              ? `Letter for ${letter.recipients} — private`
              : `${letter.title}: ${letter.body}`,
          ),
      );
      setHouseholdName(households[0]?.householdName ?? '');
    });
  }, [database, dek]);
  const sectionTitles = useMemo(
    () =>
      Object.fromEntries(
        [
          'cover',
          'notice',
          'start',
          'first72',
          'doNot',
          'notify',
          'household',
          'legal',
          'insurance',
          'banking',
          'investments',
          'debts',
          'obligations',
          'employment',
          'property',
          'vehicles',
          'valuables',
          'business',
          'digital',
          'dependents',
          'pets',
          'routines',
          'tax',
          'wishes',
          'letters',
          'locations',
          'contacts',
          'review',
        ].map((key) => [key, t(`sectionNames.${key}`)]),
      ),
    [t],
  );
  const document = useMemo(
    () =>
      buildBinderDocument(
        sectionTitles,
        choices,
        { cover: includeCover },
        { letters: letterContent },
      ),
    [sectionTitles, choices, includeCover, letterContent],
  );
  return (
    <section className={`section-page print-${pageSize}`}>
      <div className="print-toolbar">
        <Link to="/binder/overview">{t('back')}</Link>
        <Select
          label={t('pageSize')}
          value={pageSize}
          onChange={(value) => setPageSize(value as 'letter' | 'a4')}
          options={[
            { value: 'letter', label: t('letter') },
            { value: 'a4', label: t('a4') },
          ]}
        />
        <label>
          <input
            type="checkbox"
            checked={includeCover}
            onChange={(event) => setIncludeCover(event.target.checked)}
          />{' '}
          {t('includeCover')}
        </label>
        <button type="button" onClick={() => window.print()}>
          {t('print')}
        </button>
      </div>
      <p className="print-copy">{t('printCopy')}</p>
      <div className="section-card export-choices">
        <h3>{t('choices')}</h3>
        <Select
          label={t('identifiers')}
          value={choices.identifier}
          onChange={(value) =>
            setChoices({
              ...choices,
              identifier: value as BinderChoices['identifier'],
            })
          }
          options={['full', 'last4', 'hidden'].map((value) => ({
            value,
            label: t(value),
          }))}
        />
        <Select
          label={t('balances')}
          value={choices.balances}
          onChange={(value) =>
            setChoices({
              ...choices,
              balances: value as BinderChoices['balances'],
            })
          }
          options={['include', 'range', 'omit'].map((value) => ({
            value,
            label: t(value),
          }))}
        />
        {(['letters', 'medical', 'digital'] as const).map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={choices[key]}
              onChange={(event) =>
                setChoices({ ...choices, [key]: event.target.checked })
              }
            />{' '}
            {t(key)}: {t(choices[key] ? 'include' : 'omit')}
          </label>
        ))}
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(
              'continuity-binder-render-choices',
              JSON.stringify({ choices, pageSize, includeCover }),
            );
            setSaved(true);
          }}
        >
          {t('save')}
        </button>
        {saved && <p role="status">{t('saved')}</p>}
      </div>
      <div className="binder-preview">
        {includeCover && (
          <header className="binder-cover">
            <h2>{t('cover')}</h2>
            {householdName && <p>{householdName}</p>}
            <p>{t('prepared')}</p>
            <p>{t('confidential')}</p>
            <small>
              {t('lastUpdated')}: {document.metadata.generatedAt}
            </small>
          </header>
        )}
        <h3>{t('preview')}</h3>
        <ol>
          {document.sections.map((section) => (
            <li key={section.id}>
              <strong>{section.title}</strong>
              {section.blocks.map((block) => (
                <p key={String(block.text)}>{String(block.text ?? '')}</p>
              ))}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
