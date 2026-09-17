import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildBinderDocument } from '../../rendering/binderDocument';
import { exportReadableArchive } from '../../export/readableArchive';
import {
  createEncryptedRepository,
  type ContinuityDatabase,
} from '../../data/repositories/encryptedRepository';
import { benefitRecordSchema } from '../insurance/InsuranceBenefits';
import { personSchema } from '../household/HouseholdSetup';
import { personalLetterSchema } from '../wishes/WishesLegacy';

export function ReadableArchiveExport({
  database,
  dek,
}: {
  database: ContinuityDatabase | null;
  dek: CryptoKey;
}) {
  const { t, i18n } = useTranslation('export');
  const [confirmed, setConfirmed] = useState(false);
  const [household, setHousehold] = useState('');
  const [done, setDone] = useState(false);
  const [balanceChoice, setBalanceChoice] = useState<
    'include' | 'range' | 'omit'
  >('omit');
  const [insuranceContent, setInsuranceContent] = useState<string[]>([]);
  const [letterContent, setLetterContent] = useState<string[]>([]);
  useEffect(() => {
    if (!database) return;
    void Promise.all([
      createEncryptedRepository(
        database,
        dek,
        'BenefitRecord',
        benefitRecordSchema,
      ).list(),
      createEncryptedRepository(database, dek, 'Person', personSchema).list(),
      createEncryptedRepository(
        database,
        dek,
        'PersonalLetter',
        personalLetterSchema,
      ).list(),
    ]).then(([benefits, people, letters]) => {
      const names = new Map(
        people.map((person) => [
          person.id,
          `${person.legalFirstName} ${person.legalLastName}`,
        ]),
      );
      setInsuranceContent(
        benefits.map(
          (benefit) =>
            `${names.get(benefit.insuredPersonId) ?? 'Unassigned insured'} | ${benefit.carrier} | ${benefit.kind} | ${benefit.identifierDisplayPolicy === 'hidden' ? 'Not printed' : benefit.identifierDisplayPolicy === 'last4' ? `••••${benefit.policyIdentifier.slice(-4)}` : benefit.policyIdentifier} | ${benefit.benefit} | ${benefit.beneficiarySummary} | ${benefit.documentLocation ?? 'No location'} | ${benefit.reviewStatus}`,
        ),
      );
      setLetterContent(
        letters
          .filter((letter) => letter.includePrint)
          .map((letter) =>
            letter.sealed
              ? `Letter for ${letter.recipients} — private`
              : `${letter.title}: ${letter.body}`,
          ),
      );
    });
  }, [database, dek]);
  const exportArchive = async () => {
    const titles = Object.fromEntries(
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
      ].map((key) => [key, key]),
    );
    const blob = await exportReadableArchive(
      buildBinderDocument(
        titles,
        {
          identifier: 'last4',
          balances: balanceChoice,
          letters: true,
          medical: true,
          digital: true,
        },
        {},
        { insurance: insuranceContent, letters: letterContent },
      ),
      i18n.language,
      household,
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Continuity-Binder-${new Date().toISOString().slice(0, 10)}.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
    setDone(true);
  };
  return (
    <section className="section-page">
      <p className="eyebrow">{t('title')}</p>
      <h2>{t('title')}</h2>
      <p className="security-clarification">{t('warning')}</p>
      <label>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />{' '}
        {t('confirm')}
      </label>
      <Text label={t('household')} value={household} onChange={setHousehold} />
      <label>
        {t('valueDisplay', { defaultValue: 'Financial value display' })}
        <select
          value={balanceChoice}
          onChange={(event) =>
            setBalanceChoice(event.target.value as typeof balanceChoice)
          }
        >
          <option value="omit">
            {t('omitValues', { defaultValue: 'Omit exact values' })}
          </option>
          <option value="range">
            {t('valueRange', { defaultValue: 'Show value range' })}
          </option>
          <option value="include">
            {t('includeValues', { defaultValue: 'Include values' })}
          </option>
        </select>
      </label>
      <button
        type="button"
        className="button button-primary"
        disabled={!confirmed}
        onClick={() => void exportArchive()}
      >
        {t('button')}
      </button>
      {done && <p role="status">{t('exported')}</p>}
    </section>
  );
}
function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
