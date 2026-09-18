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
import { incapacityPlanSchema } from '../v2/IncapacityContinuityPlan';
import { deathCertificateSchema } from '../v2/DeathCertificateTracker';
import { estateAdministrationSchema } from '../v2/EstateAdministrationTracker';
import { claimsBenefitsSchema } from '../v2/ClaimsBenefitsTracker';
import { accountClosureTransferSchema } from '../v2/AccountClosureTransferTracker';
import { governmentLicensingSchema } from '../v2/GovernmentLicensingRecords';

export function ReadableArchiveExport({
  database,
  dek,
}: {
  database: ContinuityDatabase | null;
  dek: CryptoKey;
}) {
  const { t, i18n } = useTranslation('export');
  const v2 = (key: string) => t(`incapacity_continuity_plan.${key}`, { ns: 'v2' });
  const [confirmed, setConfirmed] = useState(false);
  const [household, setHousehold] = useState('');
  const [done, setDone] = useState(false);
  const [balanceChoice, setBalanceChoice] = useState<
    'include' | 'range' | 'omit'
  >('omit');
  const [insuranceContent, setInsuranceContent] = useState<string[]>([]);
  const [letterContent, setLetterContent] = useState<string[]>([]);
  const [incapacityContent, setIncapacityContent] = useState<string[]>([]);
  const [deathCertificateContent, setDeathCertificateContent] = useState<string[]>([]);
  const [estateAdministrationContent, setEstateAdministrationContent] = useState<string[]>([]);
  const [claimsBenefitsContent, setClaimsBenefitsContent] = useState<string[]>([]);
  const [accountClosureTransferContent, setAccountClosureTransferContent] = useState<string[]>([]);
  const [governmentLicensingContent, setGovernmentLicensingContent] = useState<string[]>([]);
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
      createEncryptedRepository(database, dek, 'IncapacityContinuityPlan', incapacityPlanSchema).list(),
      createEncryptedRepository(database, dek, 'DeathCertificateRecord', deathCertificateSchema).list(),
      createEncryptedRepository(database, dek, 'EstateAdministrationTask', estateAdministrationSchema).list(),
      createEncryptedRepository(database, dek, 'ClaimsBenefitsRecord', claimsBenefitsSchema).list(),
      createEncryptedRepository(database, dek, 'AccountClosureTransferRecord', accountClosureTransferSchema).list(),
      createEncryptedRepository(database, dek, 'GovernmentLicensingRecord', governmentLicensingSchema).list(),
    ]).then(([benefits, people, letters, plans, certificates, estateTasks, claims, accountActions, licenses]) => {
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
      const planContent = plans.filter((plan) => plan.includeInReadableExport).flatMap((plan) => [
        `${names.get(plan.personId) ?? v2('person')} — ${plan.condition}`,
        `${v2('financialAgent')}: ${plan.financialAgent} | ${v2('healthcareAgent')}: ${plan.healthcareAgent}`,
        `${v2('instructions')}: ${plan.instructions}`,
        `- [ ] ${v2('authorityConfirmed')}   - [ ] ${v2('contactsReached')}   - [ ] ${v2('billsReviewed')}   - [ ] ${v2('careActivated')}`,
        `${v2('preparerNotes')}: ________________________________________________________________`,
        '[PAGE_BREAK]',
        `${v2('preparerNotes')}: ________________________________________________________________`,
        'Date: ____ / ____ / ______    Initials: __________    Reference: __________',
      ]);
      setIncapacityContent(planContent.length > 0 ? planContent : [
        v2('intro'),
        v2('caution'),
        `- [ ] ${v2('authorityConfirmed')}   - [ ] ${v2('contactsReached')}   - [ ] ${v2('billsReviewed')}   - [ ] ${v2('careActivated')}`,
        `${v2('preparerNotes')}: ________________________________________________________________`,
        '[PAGE_BREAK]',
        `${v2('preparerNotes')}: ________________________________________________________________`,
        'Date: ____ / ____ / ______    Initials: __________    Reference: __________',
      ]);
      setDeathCertificateContent(certificates.filter((record) => record.includeInReadableExport).flatMap((record) => [
        `${names.get(record.deceasedPersonId) ?? v2('deceased')}: ${record.copiesOrdered}`,
        `${v2('institution')}: ${record.institution} | ${v2('copySent')}: ${record.copySent}`,
        `- [ ] ${v2('sent')}   - [ ] ${v2('returned')}   - [ ] ${v2('noReturnExpected')}`,
        `${v2('notes')}: ________________________________________________________________`,
      ]));
      setEstateAdministrationContent(estateTasks.filter((record) => record.includeInReadableExport).flatMap((record) => [
        `${names.get(record.deceasedPersonId) ?? v2('deceased')}: ${record.task}`,
        `${v2('courtAgency')}: ${record.courtAgency} | ${v2('responsiblePerson')}: ${names.get(record.responsiblePersonId) ?? ''}`,
        `- [ ] ${v2('notStarted')}   - [ ] ${v2('inProgress')}   - [ ] ${v2('completed')}   - [ ] ${v2('notApplicable')}`,
        `${v2('notes')}: ________________________________________________________________`,
      ]));
      setClaimsBenefitsContent(claims.filter((record) => record.includeInReadableExport).flatMap((record) => [
        `${record.benefitPolicy} — ${record.carrier}`,
        `${v2('claimContact')}: ${record.claimContact} | ${v2('submissionMethod')}: ${record.submissionMethod}`,
        `- [ ] ${v2('claimOpened')}   - [ ] ${v2('documentsSupplied')}   - [ ] ${v2('approved')}   - [ ] ${v2('paid')}   - [ ] ${v2('closed')}`,
        `${v2('notes')}: ________________________________________________________________`,
      ]));
      const accountContent = accountActions.filter((record) => record.includeInReadableExport).flatMap((record) => [
        'Continuity Binder',
        'IMMEDIATE RESPONSE',
        t('account_closure_transfer_tracker.title', { ns: 'v2' }),
        `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        `${record.accountReference} — ${record.institutionProvider} — ${record.ownerId ? names.get(record.ownerId) ?? record.ownerId : t('account_closure_transfer_tracker.ownerUnknown', { ns: 'v2' })}`,
        `${t('account_closure_transfer_tracker.recommendedAction', { ns: 'v2' })}: ${record.recommendedAction} | ${t('account_closure_transfer_tracker.contact', { ns: 'v2' })}: ${record.contact}`,
        `- [ ] ${t('account_closure_transfer_tracker.leaveActive', { ns: 'v2' })}   - [ ] ${t('account_closure_transfer_tracker.transfer', { ns: 'v2' })}   - [ ] ${t('account_closure_transfer_tracker.close', { ns: 'v2' })}   - [ ] ${t('account_closure_transfer_tracker.review', { ns: 'v2' })}   - [ ] ${t('account_closure_transfer_tracker.other', { ns: 'v2' })}`,
        `${t('account_closure_transfer_tracker.completionDate', { ns: 'v2' })}: ____ / ____ / ______    ${t('account_closure_transfer_tracker.initials', { ns: 'v2' })}: __________    ${t('account_closure_transfer_tracker.confirmationNumber', { ns: 'v2' })}: __________`,
      ]);
      setAccountClosureTransferContent(accountContent.length > 0 ? ['[PAGE_BREAK]', ...accountContent] : [
        '[PAGE_BREAK]',
        'Continuity Binder',
        'IMMEDIATE RESPONSE',
        t('account_closure_transfer_tracker.title', { ns: 'v2' }),
        `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        t('account_closure_transfer_tracker.intro', { ns: 'v2' }),
        t('account_closure_transfer_tracker.caution', { ns: 'v2' }),
        `- [ ] ${t('account_closure_transfer_tracker.leaveActive', { ns: 'v2' })}   - [ ] ${t('account_closure_transfer_tracker.transfer', { ns: 'v2' })}   - [ ] ${t('account_closure_transfer_tracker.close', { ns: 'v2' })}   - [ ] ${t('account_closure_transfer_tracker.review', { ns: 'v2' })}   - [ ] ${t('account_closure_transfer_tracker.other', { ns: 'v2' })}`,
        `${t('account_closure_transfer_tracker.completionDate', { ns: 'v2' })}: ____ / ____ / ______    ${t('account_closure_transfer_tracker.initials', { ns: 'v2' })}: __________    ${t('account_closure_transfer_tracker.confirmationNumber', { ns: 'v2' })}: __________`,
        `${t('account_closure_transfer_tracker.notes', { ns: 'v2' })}: ________________________________________________________________`,
        '\\pagebreak',
        `${t('account_closure_transfer_tracker.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      const licensingContent = licenses.filter((record) => record.includeInReadableExport).flatMap((record) => [
        'Continuity Binder', 'LEGAL, TAX & GOVERNMENT', t('government_licensing_records.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        `${names.get(record.personId) ?? t('government_licensing_records.person', { ns: 'v2' })} — ${record.credentialType} — ${record.issuingAuthority}`,
        `${t('government_licensing_records.expiration', { ns: 'v2' })}: ${record.expiration} | ${t('government_licensing_records.documentLocation', { ns: 'v2' })}: ${record.documentLocation}`,
        `- [ ] ${t('government_licensing_records.renew', { ns: 'v2' })}   - [ ] ${t('government_licensing_records.cancel', { ns: 'v2' })}   - [ ] ${t('government_licensing_records.transfer', { ns: 'v2' })}   - [ ] ${t('government_licensing_records.preserve', { ns: 'v2' })}   - [ ] ${t('government_licensing_records.review', { ns: 'v2' })}`,
        `${t('government_licensing_records.newExpiry', { ns: 'v2' })}: ____ / ____ / ______    ${t('government_licensing_records.reference', { ns: 'v2' })}: __________`,
        `${t('government_licensing_records.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      setGovernmentLicensingContent(licensingContent.length > 0 ? ['[PAGE_BREAK]', ...licensingContent] : [
        '[PAGE_BREAK]', 'Continuity Binder', 'LEGAL, TAX & GOVERNMENT', t('government_licensing_records.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        t('government_licensing_records.intro', { ns: 'v2' }), t('government_licensing_records.caution', { ns: 'v2' }),
        `- [ ] ${t('government_licensing_records.renew', { ns: 'v2' })}   - [ ] ${t('government_licensing_records.cancel', { ns: 'v2' })}   - [ ] ${t('government_licensing_records.transfer', { ns: 'v2' })}   - [ ] ${t('government_licensing_records.preserve', { ns: 'v2' })}   - [ ] ${t('government_licensing_records.review', { ns: 'v2' })}`,
        `${t('government_licensing_records.newExpiry', { ns: 'v2' })}: ____ / ____ / ______    ${t('government_licensing_records.reference', { ns: 'v2' })}: __________`, `${t('government_licensing_records.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
    });
  }, [database, dek]);
  const exportArchive = async () => {
    const titles = Object.fromEntries(
      [
        'cover',
        'notice',
        'start',
        'incapacity',
        'deathCertificates',
        'estateAdministration',
        'claimsBenefits',
        'accountClosureTransfer',
        'governmentLicensing',
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
      ].map((key) => [key, key === 'incapacity' ? t('incapacity_continuity_plan.title', { ns: 'v2' }) : key === 'deathCertificates' ? t('death_certificate_tracker.title', { ns: 'v2' }) : key === 'estateAdministration' ? t('estate_administration_tracker.title', { ns: 'v2' }) : key === 'claimsBenefits' ? t('claims_benefits_tracker.title', { ns: 'v2' }) : key === 'accountClosureTransfer' ? t('account_closure_transfer_tracker.title', { ns: 'v2' }) : key === 'governmentLicensing' ? t('government_licensing_records.title', { ns: 'v2' }) : key]),
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
        { insurance: insuranceContent, letters: letterContent, incapacity: incapacityContent, deathCertificates: deathCertificateContent, estateAdministration: estateAdministrationContent, claimsBenefits: claimsBenefitsContent, accountClosureTransfer: accountClosureTransferContent, governmentLicensing: governmentLicensingContent },
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
