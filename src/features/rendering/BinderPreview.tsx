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
import { householdSchema, personSchema } from '../household/HouseholdSetup';
import { incapacityPlanSchema } from '../v2/IncapacityContinuityPlan';
import { deathCertificateSchema } from '../v2/DeathCertificateTracker';
import { estateAdministrationSchema } from '../v2/EstateAdministrationTracker';

export function BinderPreview({
  database,
  dek,
}: {
  database?: ContinuityDatabase | null;
  dek?: CryptoKey;
}) {
  database ??= null;
  const { t } = useTranslation('rendering');
  const v2 = (key: string) => t(`incapacity_continuity_plan.${key}`, { ns: 'v2' });
  const emptyIncapacityContent = [
    v2('intro'),
    v2('caution'),
    `☐ ${v2('authorityConfirmed')}   ☐ ${v2('contactsReached')}   ☐ ${v2('billsReviewed')}   ☐ ${v2('careActivated')}`,
    `${v2('preparerNotes')}: ________________________________________________________________`,
    '[PAGE_BREAK]',
    `${v2('preparerNotes')}: ________________________________________________________________`,
    'Date: ____ / ____ / ______    Initials: __________    Reference: __________',
  ];
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
  const [incapacityContent, setIncapacityContent] = useState<string[]>(emptyIncapacityContent);
  const [deathCertificateContent, setDeathCertificateContent] = useState<string[]>([]);
  const [estateAdministrationContent, setEstateAdministrationContent] = useState<string[]>([]);
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
      createEncryptedRepository(
        database,
        dek,
        'IncapacityContinuityPlan',
        incapacityPlanSchema,
      ).list(),
      createEncryptedRepository(database, dek, 'Person', personSchema).list(),
      createEncryptedRepository(database, dek, 'DeathCertificateRecord', deathCertificateSchema).list(),
      createEncryptedRepository(database, dek, 'EstateAdministrationTask', estateAdministrationSchema).list(),
    ]).then(([letters, households, plans, people, certificates, estateTasks]) => {
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
      const names = new Map(people.map((person) => [person.id, `${person.legalFirstName} ${person.legalLastName}`]));
      const planContent = plans.filter((plan) => plan.includeInPrint).flatMap((plan) => [
        `${names.get(plan.personId) ?? v2('person')} — ${plan.condition}`,
        `${v2('financialAgent')}: ${plan.financialAgent} | ${v2('healthcareAgent')}: ${plan.healthcareAgent}`,
        `${v2('householdManager')}: ${plan.householdManager} | ${v2('dependentContact')}: ${plan.dependentContact}`,
        `${v2('instructions')}: ${plan.instructions}`,
        `☐ ${v2('authorityConfirmed')}   ☐ ${v2('contactsReached')}   ☐ ${v2('billsReviewed')}   ☐ ${v2('careActivated')}`,
        `${v2('preparerNotes')}: ________________________________________________________________`,
        '[PAGE_BREAK]',
        `${v2('preparerNotes')}: ________________________________________________________________`,
        'Date: ____ / ____ / ______    Initials: __________    Reference: __________',
      ]);
      setIncapacityContent(planContent.length > 0 ? planContent : emptyIncapacityContent);
      setDeathCertificateContent(certificates.filter((record) => record.includeInPrint).flatMap((record) => [
        `${names.get(record.deceasedPersonId) ?? v2('deceased')}: ${record.copiesOrdered}`,
        `${v2('institution')}: ${record.institution} | ${v2('copySent')}: ${record.copySent}`,
        `☐ ${v2('sent')}   ☐ ${v2('returned')}   ☐ ${v2('noReturnExpected')}`,
        `${v2('notes')}: ________________________________________________________________`,
      ]));
      setEstateAdministrationContent(estateTasks.filter((record) => record.includeInPrint).flatMap((record) => [
        `${names.get(record.deceasedPersonId) ?? v2('deceased')}: ${record.task}`,
        `${v2('courtAgency')}: ${record.courtAgency} | ${v2('responsiblePerson')}: ${names.get(record.responsiblePersonId) ?? ''}`,
        `☐ ${v2('notStarted')}   ☐ ${v2('inProgress')}   ☐ ${v2('completed')}   ☐ ${v2('notApplicable')}`,
        `${v2('notes')}: ________________________________________________________________`,
      ]));
    });
  }, [database, dek]);
  const sectionTitles = useMemo(
    () =>
      Object.fromEntries(
        [
          'cover',
          'notice',
          'start',
          'incapacity',
          'deathCertificates',
          'estateAdministration',
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
        ].map((key) => [key, key === 'incapacity' ? t('incapacity_continuity_plan.title', { ns: 'v2' }) : key === 'deathCertificates' ? t('death_certificate_tracker.title', { ns: 'v2' }) : key === 'estateAdministration' ? t('estate_administration_tracker.title', { ns: 'v2' }) : t(`sectionNames.${key}`)]),
      ),
    [t],
  );
  const document = useMemo(
    () =>
      buildBinderDocument(
        sectionTitles,
        choices,
        { cover: includeCover },
        { letters: letterContent, incapacity: incapacityContent, deathCertificates: deathCertificateContent, estateAdministration: estateAdministrationContent },
      ),
    [sectionTitles, choices, includeCover, letterContent, incapacityContent, deathCertificateContent, estateAdministrationContent],
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
            <li className={`binder-section binder-section-${section.id}`} key={section.id}>
              <strong>{section.title}</strong>
              {section.blocks.map((block, index) => (
                block.type === 'pageBreak'
                  ? <div className="page-break" aria-hidden="true" key={`page-break-${index}`} />
                  : <p key={`${String(block.text)}-${index}`}>{String(block.text ?? '')}</p>
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
