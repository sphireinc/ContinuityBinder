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
import { claimsBenefitsSchema } from '../v2/ClaimsBenefitsTracker';
import { accountClosureTransferSchema } from '../v2/AccountClosureTransferTracker';
import { governmentLicensingSchema } from '../v2/GovernmentLicensingRecords';
import { militaryVeteranSchema } from '../v2/MilitaryVeteranRecord';
import { foreignPropertySchema } from '../v2/ForeignPropertyInternationalAffairs';
import { travelTimeshareSchema } from '../v2/TravelTimeshareVacationProperty';
import { loyaltyPointsSchema } from '../v2/LoyaltyPointsRewards';

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
  const emptyAccountClosureTransferContent = [
    'Continuity Binder',
    'IMMEDIATE RESPONSE',
    t('account_closure_transfer_tracker.title', { ns: 'v2' }),
    `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
    t('account_closure_transfer_tracker.intro', { ns: 'v2' }),
    t('account_closure_transfer_tracker.caution', { ns: 'v2' }),
    `☐ ${t('account_closure_transfer_tracker.leaveActive', { ns: 'v2' })}   ☐ ${t('account_closure_transfer_tracker.transfer', { ns: 'v2' })}   ☐ ${t('account_closure_transfer_tracker.close', { ns: 'v2' })}   ☐ ${t('account_closure_transfer_tracker.review', { ns: 'v2' })}   ☐ ${t('account_closure_transfer_tracker.other', { ns: 'v2' })}`,
    `${t('account_closure_transfer_tracker.completionDate', { ns: 'v2' })}: ____ / ____ / ______    ${t('account_closure_transfer_tracker.initials', { ns: 'v2' })}: __________    ${t('account_closure_transfer_tracker.confirmationNumber', { ns: 'v2' })}: __________`,
    `${t('account_closure_transfer_tracker.notes', { ns: 'v2' })}: ________________________________________________________________`,
    '[PAGE_BREAK]',
    `${t('account_closure_transfer_tracker.notes', { ns: 'v2' })}: ________________________________________________________________`,
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
  const [claimsBenefitsContent, setClaimsBenefitsContent] = useState<string[]>([]);
  const [accountClosureTransferContent, setAccountClosureTransferContent] = useState<string[]>([]);
  const [governmentLicensingContent, setGovernmentLicensingContent] = useState<string[]>([]);
  const [militaryVeteranContent, setMilitaryVeteranContent] = useState<string[]>([]);
  const [foreignInternationalContent, setForeignInternationalContent] = useState<string[]>([]);
  const [travelVacationContent, setTravelVacationContent] = useState<string[]>([]);
  const [loyaltyRewardsContent, setLoyaltyRewardsContent] = useState<string[]>([]);
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
      createEncryptedRepository(database, dek, 'ClaimsBenefitsRecord', claimsBenefitsSchema).list(),
      createEncryptedRepository(database, dek, 'AccountClosureTransferRecord', accountClosureTransferSchema).list(),
      createEncryptedRepository(database, dek, 'GovernmentLicensingRecord', governmentLicensingSchema).list(),
      createEncryptedRepository(database, dek, 'MilitaryVeteranRecord', militaryVeteranSchema).list(),
      createEncryptedRepository(database, dek, 'ForeignPropertyRecord', foreignPropertySchema).list(),
      createEncryptedRepository(database, dek, 'TravelTimeshareRecord', travelTimeshareSchema).list(),
      createEncryptedRepository(database, dek, 'LoyaltyPointsRecord', loyaltyPointsSchema).list(),
    ]).then(([letters, households, plans, people, certificates, estateTasks, claims, accountActions, licenses, militaryRecords, foreignRecords, travelRecords, loyaltyRecords]) => {
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
      setClaimsBenefitsContent(claims.filter((record) => record.includeInPrint).flatMap((record) => [
        `${record.benefitPolicy} — ${record.carrier}`,
        `${v2('claimContact')}: ${record.claimContact} | ${v2('submissionMethod')}: ${record.submissionMethod}`,
        `☐ ${v2('claimOpened')}   ☐ ${v2('documentsSupplied')}   ☐ ${v2('approved')}   ☐ ${v2('paid')}   ☐ ${v2('closed')}`,
        `${v2('notes')}: ________________________________________________________________`,
      ]));
      const accountContent = accountActions.filter((record) => record.includeInPrint).flatMap((record) => [
        'Continuity Binder',
        'IMMEDIATE RESPONSE',
        t('account_closure_transfer_tracker.title', { ns: 'v2' }),
        `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        `${record.accountReference} — ${record.institutionProvider} — ${record.ownerId ? names.get(record.ownerId) ?? record.ownerId : t('account_closure_transfer_tracker.ownerUnknown', { ns: 'v2' })}`,
        `${t('account_closure_transfer_tracker.recommendedAction', { ns: 'v2' })}: ${record.recommendedAction} | ${t('account_closure_transfer_tracker.contact', { ns: 'v2' })}: ${record.contact}`,
        `☐ ${t('account_closure_transfer_tracker.leaveActive', { ns: 'v2' })}   ☐ ${t('account_closure_transfer_tracker.transfer', { ns: 'v2' })}   ☐ ${t('account_closure_transfer_tracker.close', { ns: 'v2' })}   ☐ ${t('account_closure_transfer_tracker.review', { ns: 'v2' })}   ☐ ${t('account_closure_transfer_tracker.other', { ns: 'v2' })}`,
        `${t('account_closure_transfer_tracker.completionDate', { ns: 'v2' })}: ____ / ____ / ______    ${t('account_closure_transfer_tracker.initials', { ns: 'v2' })}: __________    ${t('account_closure_transfer_tracker.confirmationNumber', { ns: 'v2' })}: __________`,
      ]);
      setAccountClosureTransferContent(accountContent.length > 0 ? ['[PAGE_BREAK]', ...accountContent] : emptyAccountClosureTransferContent);
      const licensingContent = licenses.filter((record) => record.includeInPrint).flatMap((record) => [
        'Continuity Binder', 'LEGAL, TAX & GOVERNMENT', t('government_licensing_records.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        `${names.get(record.personId) ?? t('government_licensing_records.person', { ns: 'v2' })} — ${record.credentialType} — ${record.issuingAuthority}`,
        `${t('government_licensing_records.expiration', { ns: 'v2' })}: ${record.expiration} | ${t('government_licensing_records.documentLocation', { ns: 'v2' })}: ${record.documentLocation}`,
        `☐ ${t('government_licensing_records.renew', { ns: 'v2' })}   ☐ ${t('government_licensing_records.cancel', { ns: 'v2' })}   ☐ ${t('government_licensing_records.transfer', { ns: 'v2' })}   ☐ ${t('government_licensing_records.preserve', { ns: 'v2' })}   ☐ ${t('government_licensing_records.review', { ns: 'v2' })}`,
        `${t('government_licensing_records.newExpiry', { ns: 'v2' })}: ____ / ____ / ______    ${t('government_licensing_records.reference', { ns: 'v2' })}: __________`,
        `${t('government_licensing_records.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      setGovernmentLicensingContent(licensingContent.length > 0 ? ['[PAGE_BREAK]', ...licensingContent] : [
        '[PAGE_BREAK]', 'Continuity Binder', 'LEGAL, TAX & GOVERNMENT', t('government_licensing_records.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        t('government_licensing_records.intro', { ns: 'v2' }), t('government_licensing_records.caution', { ns: 'v2' }),
        `☐ ${t('government_licensing_records.renew', { ns: 'v2' })}   ☐ ${t('government_licensing_records.cancel', { ns: 'v2' })}   ☐ ${t('government_licensing_records.transfer', { ns: 'v2' })}   ☐ ${t('government_licensing_records.preserve', { ns: 'v2' })}   ☐ ${t('government_licensing_records.review', { ns: 'v2' })}`,
        `${t('government_licensing_records.newExpiry', { ns: 'v2' })}: ____ / ____ / ______    ${t('government_licensing_records.reference', { ns: 'v2' })}: __________`, `${t('government_licensing_records.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      const militaryContent = militaryRecords.filter((record) => record.includeInPrint).flatMap((record) => [
        'Continuity Binder', 'LEGAL, TAX & GOVERNMENT', t('military_veteran_record.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        `${names.get(record.personId) ?? t('military_veteran_record.person', { ns: 'v2' })} — ${record.branch} — ${record.dischargeStatus}`,
        `${t('military_veteran_record.dd214Location', { ns: 'v2' })}: ${record.dd214Location} | ${t('military_veteran_record.vaContact', { ns: 'v2' })}: ${record.vaContact}`,
        `☐ ${t('military_veteran_record.dd214Located', { ns: 'v2' })}   ☐ ${t('military_veteran_record.vaContacted', { ns: 'v2' })}   ☐ ${t('military_veteran_record.honorsVerified', { ns: 'v2' })}`,
        `${t('military_veteran_record.date', { ns: 'v2' })}: ____ / ____ / ______    ${t('military_veteran_record.initials', { ns: 'v2' })}: __________    ${t('military_veteran_record.reference', { ns: 'v2' })}: __________`,
        `${t('military_veteran_record.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      setMilitaryVeteranContent(militaryContent.length > 0 ? ['[PAGE_BREAK]', ...militaryContent] : [
        '[PAGE_BREAK]', 'Continuity Binder', 'LEGAL, TAX & GOVERNMENT', t('military_veteran_record.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        t('military_veteran_record.intro', { ns: 'v2' }), t('military_veteran_record.caution', { ns: 'v2' }),
        `☐ ${t('military_veteran_record.dd214Located', { ns: 'v2' })}   ☐ ${t('military_veteran_record.vaContacted', { ns: 'v2' })}   ☐ ${t('military_veteran_record.honorsVerified', { ns: 'v2' })}`,
        `${t('military_veteran_record.date', { ns: 'v2' })}: ____ / ____ / ______    ${t('military_veteran_record.initials', { ns: 'v2' })}: __________    ${t('military_veteran_record.reference', { ns: 'v2' })}: __________`, `${t('military_veteran_record.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      const foreignContent = foreignRecords.filter((record) => record.includeInPrint).flatMap((record) => [
        'Continuity Binder', 'LEGAL, TAX & GOVERNMENT', t('foreign_property_international_affairs.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        `${record.country} — ${record.matterType} — ${names.get(record.personId) ?? t('foreign_property_international_affairs.person', { ns: 'v2' })}`,
        `${t('foreign_property_international_affairs.localAttorneyContact', { ns: 'v2' })}: ${record.localAttorneyContact} | ${t('foreign_property_international_affairs.documentLocation', { ns: 'v2' })}: ${record.documentLocation}`,
        `☐ ${t('foreign_property_international_affairs.contactReached', { ns: 'v2' })}   ☐ ${t('foreign_property_international_affairs.documentsLocated', { ns: 'v2' })}   ☐ ${t('foreign_property_international_affairs.requirementsReviewed', { ns: 'v2' })}`,
        `${t('foreign_property_international_affairs.date', { ns: 'v2' })}: ____ / ____ / ______    ${t('foreign_property_international_affairs.initials', { ns: 'v2' })}: __________    ${t('foreign_property_international_affairs.reference', { ns: 'v2' })}: __________`,
        `${t('foreign_property_international_affairs.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      setForeignInternationalContent(foreignContent.length > 0 ? ['[PAGE_BREAK]', ...foreignContent] : [
        '[PAGE_BREAK]', 'Continuity Binder', 'LEGAL, TAX & GOVERNMENT', t('foreign_property_international_affairs.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        t('foreign_property_international_affairs.intro', { ns: 'v2' }), t('foreign_property_international_affairs.caution', { ns: 'v2' }),
        `☐ ${t('foreign_property_international_affairs.contactReached', { ns: 'v2' })}   ☐ ${t('foreign_property_international_affairs.documentsLocated', { ns: 'v2' })}   ☐ ${t('foreign_property_international_affairs.requirementsReviewed', { ns: 'v2' })}`,
        `${t('foreign_property_international_affairs.date', { ns: 'v2' })}: ____ / ____ / ______    ${t('foreign_property_international_affairs.initials', { ns: 'v2' })}: __________    ${t('foreign_property_international_affairs.reference', { ns: 'v2' })}: __________`, `${t('foreign_property_international_affairs.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      const travelContent = travelRecords.filter((record) => record.includeInPrint).flatMap((record) => [
        'Continuity Binder', 'TRAVEL & OTHER ASSETS', t('travel_timeshare_vacation_property.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        `${record.assetProgram} — ${record.type} — ${names.get(record.ownerId) ?? t('travel_timeshare_vacation_property.owner', { ns: 'v2' })}`,
        `${t('travel_timeshare_vacation_property.locationProvider', { ns: 'v2' })}: ${record.locationProvider} | ${t('travel_timeshare_vacation_property.annualCost', { ns: 'v2' })}: ${record.annualCost}`,
        `☐ ${t('travel_timeshare_vacation_property.continue', { ns: 'v2' })}   ☐ ${t('travel_timeshare_vacation_property.transfer', { ns: 'v2' })}   ☐ ${t('travel_timeshare_vacation_property.sell', { ns: 'v2' })}   ☐ ${t('travel_timeshare_vacation_property.cancel', { ns: 'v2' })}   ☐ ${t('travel_timeshare_vacation_property.review', { ns: 'v2' })}`,
        `${t('travel_timeshare_vacation_property.date', { ns: 'v2' })}: ____ / ____ / ______    ${t('travel_timeshare_vacation_property.initials', { ns: 'v2' })}: __________    ${t('travel_timeshare_vacation_property.reference', { ns: 'v2' })}: __________`,
        `${t('travel_timeshare_vacation_property.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      setTravelVacationContent(travelContent.length > 0 ? ['[PAGE_BREAK]', ...travelContent] : [
        '[PAGE_BREAK]', 'Continuity Binder', 'TRAVEL & OTHER ASSETS', t('travel_timeshare_vacation_property.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        t('travel_timeshare_vacation_property.intro', { ns: 'v2' }), t('travel_timeshare_vacation_property.caution', { ns: 'v2' }),
        `☐ ${t('travel_timeshare_vacation_property.continue', { ns: 'v2' })}   ☐ ${t('travel_timeshare_vacation_property.transfer', { ns: 'v2' })}   ☐ ${t('travel_timeshare_vacation_property.sell', { ns: 'v2' })}   ☐ ${t('travel_timeshare_vacation_property.cancel', { ns: 'v2' })}   ☐ ${t('travel_timeshare_vacation_property.review', { ns: 'v2' })}`,
        `${t('travel_timeshare_vacation_property.date', { ns: 'v2' })}: ____ / ____ / ______    ${t('travel_timeshare_vacation_property.initials', { ns: 'v2' })}: __________    ${t('travel_timeshare_vacation_property.reference', { ns: 'v2' })}: __________`, `${t('travel_timeshare_vacation_property.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      const loyaltyContent = loyaltyRecords.filter((record) => record.includeInPrint).flatMap((record) => [
        'Continuity Binder', 'MONEY & BENEFITS', t('loyalty_points_rewards.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        `${record.program} — ${names.get(record.ownerId) ?? t('loyalty_points_rewards.owner', { ns: 'v2' })} — ${record.approximateValue}`,
        `${t('loyalty_points_rewards.accountIdentifier', { ns: 'v2' })}: ${record.accountIdentifier} | ${t('loyalty_points_rewards.relatedCard', { ns: 'v2' })}: ${record.relatedCard}`,
        `☐ ${t('loyalty_points_rewards.providerContacted', { ns: 'v2' })}   ☐ ${t('loyalty_points_rewards.transferredRedeemed', { ns: 'v2' })}   ☐ ${t('loyalty_points_rewards.closed', { ns: 'v2' })}`,
        `${t('loyalty_points_rewards.date', { ns: 'v2' })}: ____ / ____ / ______    ${t('loyalty_points_rewards.initials', { ns: 'v2' })}: __________    ${t('loyalty_points_rewards.reference', { ns: 'v2' })}: __________`,
        `${t('loyalty_points_rewards.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
      setLoyaltyRewardsContent(loyaltyContent.length > 0 ? ['[PAGE_BREAK]', ...loyaltyContent] : [
        '[PAGE_BREAK]', 'Continuity Binder', 'MONEY & BENEFITS', t('loyalty_points_rewards.title', { ns: 'v2' }), `${t('prepared', { ns: 'rendering' })}: ${new Date().toLocaleDateString()}`,
        t('loyalty_points_rewards.intro', { ns: 'v2' }), t('loyalty_points_rewards.caution', { ns: 'v2' }),
        `☐ ${t('loyalty_points_rewards.providerContacted', { ns: 'v2' })}   ☐ ${t('loyalty_points_rewards.transferredRedeemed', { ns: 'v2' })}   ☐ ${t('loyalty_points_rewards.closed', { ns: 'v2' })}`,
        `${t('loyalty_points_rewards.date', { ns: 'v2' })}: ____ / ____ / ______    ${t('loyalty_points_rewards.initials', { ns: 'v2' })}: __________    ${t('loyalty_points_rewards.reference', { ns: 'v2' })}: __________`, `${t('loyalty_points_rewards.notes', { ns: 'v2' })}: ________________________________________________________________`,
      ]);
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
          'claimsBenefits',
          'accountClosureTransfer',
          'governmentLicensing',
          'militaryVeteran',
          'foreignInternational',
          'travelVacation',
          'loyaltyRewards',
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
        ].map((key) => [key, key === 'incapacity' ? t('incapacity_continuity_plan.title', { ns: 'v2' }) : key === 'deathCertificates' ? t('death_certificate_tracker.title', { ns: 'v2' }) : key === 'estateAdministration' ? t('estate_administration_tracker.title', { ns: 'v2' }) : key === 'claimsBenefits' ? t('claims_benefits_tracker.title', { ns: 'v2' }) : key === 'accountClosureTransfer' ? t('account_closure_transfer_tracker.title', { ns: 'v2' }) : key === 'governmentLicensing' ? t('government_licensing_records.title', { ns: 'v2' }) : key === 'militaryVeteran' ? t('military_veteran_record.title', { ns: 'v2' }) : key === 'foreignInternational' ? t('foreign_property_international_affairs.title', { ns: 'v2' }) : key === 'travelVacation' ? t('travel_timeshare_vacation_property.title', { ns: 'v2' }) : key === 'loyaltyRewards' ? t('loyalty_points_rewards.title', { ns: 'v2' }) : t(`sectionNames.${key}`)]),
      ),
    [t],
  );
  const document = useMemo(
    () =>
      buildBinderDocument(
        sectionTitles,
        choices,
        { cover: includeCover },
        { letters: letterContent, incapacity: incapacityContent, deathCertificates: deathCertificateContent, estateAdministration: estateAdministrationContent, claimsBenefits: claimsBenefitsContent, accountClosureTransfer: accountClosureTransferContent, governmentLicensing: governmentLicensingContent, militaryVeteran: militaryVeteranContent, foreignInternational: foreignInternationalContent, travelVacation: travelVacationContent, loyaltyRewards: loyaltyRewardsContent },
      ),
    [sectionTitles, choices, includeCover, letterContent, incapacityContent, deathCertificateContent, estateAdministrationContent, claimsBenefitsContent, accountClosureTransferContent, governmentLicensingContent, militaryVeteranContent, foreignInternationalContent, travelVacationContent, loyaltyRewardsContent],
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
