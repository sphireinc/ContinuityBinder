/* global navigator */
import { useEffect, useState } from 'react';
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './i18n/LanguageSelector';
import {
  changeVaultPassphrase,
  createVault,
  unlockVault,
  type VaultHeader,
} from './crypto/vault';
import {
  ContinuityDatabase,
  eraseVault,
  getVaultHeader,
  putVaultHeader,
} from './data/repositories/encryptedRepository';
import { Dashboard } from './features/overview/Dashboard';
import { HouseholdSetup } from './features/household/HouseholdSetup';
import { ImmediateResponse } from './features/immediate-response/ImmediateResponse';
import { PeopleContacts } from './features/contacts/PeopleContacts';
import { LegalEstate } from './features/legal/LegalEstate';
import { InsuranceBenefits } from './features/insurance/InsuranceBenefits';
import { FinanceAccounts } from './features/finance/FinanceAccounts';
import { DebtsObligations } from './features/debts/DebtsObligations';
import { PropertyAssets } from './features/property/PropertyAssets';
import { BusinessEmployment } from './features/business/BusinessEmployment';
import { DigitalAccess } from './features/digital/DigitalAccess';
import { FamilyCare } from './features/care/FamilyCare';
import { DependentSection } from './features/care/DependentSection';
import { TaxRecords } from './features/tax/TaxRecords';
import { WishesLegacy } from './features/wishes/WishesLegacy';
import { CompletenessReview } from './features/review/CompletenessReview';
import { BinderPreview } from './features/rendering/BinderPreview';
import { ReadableArchiveExport } from './features/export/ReadableArchiveExport';
import { EncryptedBackup } from './features/backup/EncryptedBackup';
import { buildDiagnosticInfo } from './diagnostics';
import { Help } from './features/help/Help';
import { FirstRunEducation } from './features/education/FirstRunEducation';
import { migrateAfterUnlock } from './data/migrations';
import { IncapacityContinuityPlan } from './features/v2/IncapacityContinuityPlan';
import { DeathCertificateTracker } from './features/v2/DeathCertificateTracker';
import { EstateAdministrationTracker } from './features/v2/EstateAdministrationTracker';
import { ClaimsBenefitsTracker } from './features/v2/ClaimsBenefitsTracker';
import { AccountClosureTransferTracker } from './features/v2/AccountClosureTransferTracker';
import { GovernmentLicensingRecords } from './features/v2/GovernmentLicensingRecords';
import { MilitaryVeteranRecord } from './features/v2/MilitaryVeteranRecord';
import { ForeignPropertyInternationalAffairs } from './features/v2/ForeignPropertyInternationalAffairs';
import { TravelTimeshareVacationProperty } from './features/v2/TravelTimeshareVacationProperty';
import { LoyaltyPointsRewards } from './features/v2/LoyaltyPointsRewards';
import { OutstandingPurchasesRefunds } from './features/v2/OutstandingPurchasesRefunds';
import { WarrantyServiceContracts } from './features/v2/WarrantyServiceContracts';
import { StorageUnitsOffsiteStorage } from './features/v2/StorageUnitsOffsiteStorage';
import { CollectionsInventory } from './features/v2/CollectionsInventory';

const navigation = [
  ['overview', 'overview'],
  ['householdSetup', 'household-setup'],
  ['startHere', 'start-here'],
  ['first72Hours', 'first-72-hours'],
  ['doNotDoImmediately', 'do-not-do-immediately'],
  ['peopleToNotify', 'people-to-notify'],
  ['incapacityContinuityPlan', 'immediate/incapacity'],
  ['deathCertificateTracker', 'immediate/death-certificates'],
  ['estateAdministrationTracker', 'immediate/estate-administration'],
  ['claimsBenefitsTracker', 'immediate/claims-benefits'],
  ['accountClosureTransferTracker', 'immediate/account-actions'],
  ['governmentLicensingRecords', 'legal/licenses'],
  ['militaryVeteranRecord', 'legal/military'],
  ['foreignPropertyInternationalAffairs', 'legal/international'],
  ['travelTimeshareVacationProperty', 'travel/vacation-assets'],
  ['loyaltyPointsRewards', 'money/loyalty'],
  ['outstandingPurchasesRefunds', 'money/outstanding-purchases'],
  ['warrantyServiceContracts', 'property/warranties'],
  ['peopleContacts', 'people-contacts'],
  ['legalEstate', 'legal-estate'],
  ['moneyBenefits', 'money-benefits'],
  ['bankingInvestments', 'banking-investments'],
  ['debtsObligations', 'debts-obligations'],
  ['property', 'property'],
  ['collectionsInventory', 'property/collections'],
  ['storageUnitsOffsiteStorage', 'property/storage-units'],
  ['businessEmployment', 'business-employment'],
  ['digitalAccess', 'digital-access'],
  ['familyContinuity', 'family-continuity'],
  ['taxRecords', 'tax-records'],
  ['wishesLegacy', 'wishes-legacy'],
  ['review', 'review'],
  ['preview', 'preview'],
  ['export', 'export'],
  ['backupRestore', 'backup-restore'],
  ['settings', 'settings/security'],
] as const;

function PublicPage({
  titleKey,
}: {
  titleKey: 'privacy' | 'security' | 'terms' | 'notFound';
}) {
  const { t } = useTranslation(['common', 'public']);
  const contentKey =
    titleKey === 'privacy'
      ? 'privacy'
      : titleKey === 'security'
        ? 'security'
        : titleKey === 'terms'
          ? 'terms'
          : '';
  const paragraphs = contentKey
    ? (t(`${contentKey}Body`, {
        ns: 'public',
        returnObjects: true,
      }) as string[])
    : [t('tagline')];
  return (
    <main className="public-page">
      <Link to="/">{t('backToApp')}</Link>
      <h1>
        {contentKey ? t(`${contentKey}Title`, { ns: 'public' }) : t(titleKey)}
      </h1>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </main>
  );
}
function Landing({ eraseNotice = false }: { eraseNotice?: boolean }) {
  const { t } = useTranslation(['common', 'landing']);
  return (
    <>
      <header className="site-header">
        <Link className="wordmark" to="/">
          <span>{t('appName')}</span>
          <small>{t('localFirst')}</small>
        </Link>
        <LanguageSelector />
        <nav aria-label={t('primary', { ns: 'navigation' })}>
          <a href="#privacy">{t('privacy')}</a>
          <a href="#how-it-works">{t('howItWorks')}</a>
          <Link to="/help">{t('title', { ns: 'help' })}</Link>
        </nav>
      </header>
      <main>
        {eraseNotice && (
          <p role="status">Your local binder was erased from this browser.</p>
        )}
        <section className="hero">
          <p className="eyebrow">{t('eyebrow', { ns: 'landing' })}</p>
          <h1>{t('headline', { ns: 'landing' })}</h1>
          <p className="hero-copy">{t('description', { ns: 'landing' })}</p>
          <p className="trust-statement">{t('trust', { ns: 'landing' })}</p>
          <Link className="button button-primary" to="/binder/setup">
            {t('cta', { ns: 'landing' })}
          </Link>
          <p className="free-note">{t('freeNote', { ns: 'landing' })}</p>
          <p className="quiet-note">{t('quietNote', { ns: 'landing' })}</p>
        </section>
        <section className="trust-strip" id="privacy" aria-label={t('privacy')}>
          <article>
            <h2>{t('localTitle', { ns: 'landing' })}</h2>
            <p>{t('localBody', { ns: 'landing' })}</p>
          </article>
          <article>
            <h2>{t('encryptedTitle', { ns: 'landing' })}</h2>
            <p>{t('encryptedBody', { ns: 'landing' })}</p>
          </article>
          <article>
            <h2>{t('noTrackingTitle', { ns: 'landing' })}</h2>
            <p>{t('noTrackingBody', { ns: 'landing' })}</p>
          </article>
        </section>
        <section className="how-it-works" id="how-it-works">
          <h2>{t('howTitle', { ns: 'landing' })}</h2>
          <div className="steps">
            <article>
              <h3>{t('stepOneTitle', { ns: 'landing' })}</h3>
              <p>{t('stepOneBody', { ns: 'landing' })}</p>
            </article>
            <article>
              <h3>{t('stepTwoTitle', { ns: 'landing' })}</h3>
              <p>{t('stepTwoBody', { ns: 'landing' })}</p>
            </article>
            <article>
              <h3>{t('stepThreeTitle', { ns: 'landing' })}</h3>
              <p>{t('stepThreeBody', { ns: 'landing' })}</p>
            </article>
          </div>
        </section>
        <section className="security-clarification">
          <h2>{t('clarificationTitle', { ns: 'landing' })}</h2>
          <p>{t('clarificationBody', { ns: 'landing' })}</p>
        </section>
      </main>
    </>
  );
}
function Setup({
  onCreated,
}: {
  onCreated: (header: VaultHeader, dek: CryptoKey) => void;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [passphrase, setPassphrase] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [educationStep, setEducationStep] = useState(0);
  const valid =
    passphrase.length >= 12 && passphrase === confirmation && acknowledged;
  if (educationStep < 3)
    return (
      <FirstRunEducation
        step={educationStep}
        onNext={() => setEducationStep((step) => step + 1)}
      />
    );
  return (
    <main className="public-page">
      <p className="eyebrow">{t('appName')}</p>
      <h1>{t('setupTitle')}</h1>
      <p>{t('setupBody')}</p>
      <p>{t('noRecovery')}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void createVault(passphrase).then(({ header, dek }) => {
            onCreated(header, dek);
            navigate('/binder/overview');
          });
        }}
      >
        <label>
          {t('passphrase')}
          <input
            type="password"
            autoComplete="new-password"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
          />
        </label>
        <label>
          {t('confirmPassphrase')}
          <input
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        <p>{t('passphraseRequirements')}</p>
        <label>
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />{' '}
          {t('passphraseAcknowledgment')}
        </label>
        <button className="button button-primary" disabled={!valid}>
          {t('createBinder')}
        </button>
      </form>
    </main>
  );
}
function Unlock({
  header,
  database,
  onUnlock,
  onErase,
}: {
  header: VaultHeader | null;
  database: ContinuityDatabase | null;
  onUnlock: (dek: CryptoKey) => void;
  onErase: () => Promise<void>;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [passphrase, setPassphrase] = useState('');
  const [failed, setFailed] = useState(false);
  return (
    <main className="public-page">
      <p className="eyebrow">{t('appName')}</p>
      <h1>{t('unlockTitle')}</h1>
      <p>{t('unlockBody')}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!header) {
            navigate('/binder/setup');
            return;
          }
          void unlockVault(passphrase, header)
            .then(async (dek) => {
              if (database) await migrateAfterUnlock(database);
              setFailed(false);
              onUnlock(dek);
              navigate('/binder/overview');
            })
            .catch(() => setFailed(true));
        }}
      >
        <label>
          {t('passphrase')}
          <input
            type="password"
            autoComplete="current-password"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
          />
        </label>
        {failed && <p role="alert">{t('invalidPassphrase')}</p>}
        <button className="button button-primary">{t('unlock')}</button>
      </form>
      <button
        className="quiet-link"
        onClick={() => navigate('/binder/backup-restore')}
      >
        {t('restoreBackup')}
      </button>
      <button
        className="quiet-link"
        onClick={() => {
          if (window.confirm(t('eraseConfirm'))) void onErase();
        }}
      >
        {t('eraseBinder')}
      </button>
    </main>
  );
}
function Shell({ onLock }: { onLock: () => void }) {
  const location = useLocation();
  const { t } = useTranslation();
  const titleKey =
    navigation.find(([, path]) => location.pathname.endsWith(path))?.[0] ??
    'overview';
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        {t('skipToContent')}
      </a>
      <aside className="sidebar">
        <Link className="wordmark" to="/binder/overview">
          <span>{t('appName')}</span>
          <small>{t('localFirst')}</small>
        </Link>
        <LanguageSelector />
        <p className="security-indicator">{t('unlockedOnDevice')}</p>
        <nav aria-label={t('binder', { ns: 'navigation' })}>
          {navigation.map(([key, path]) => (
            <Link
              aria-current={
                location.pathname.endsWith(path) ? 'page' : undefined
              }
              className={location.pathname.endsWith(path) ? 'active' : ''}
              key={path}
              to={`/binder/${path}`}
            >
              {t(key, { ns: 'navigation' })}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="content-region">
        <header className="utility-bar">
          <h1>{t(titleKey, { ns: 'navigation' })}</h1>
          <span className="save-state">{t('savedLocally')}</span>
          <button className="lock-button" onClick={onLock}>
            {t('lock')}
          </button>
        </header>
        <main id="main-content" className="page-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
function ProtectedPage() {
  const location = useLocation();
  const { t } = useTranslation();
  const key =
    navigation.find(([, path]) => location.pathname.endsWith(path))?.[0] ??
    'overview';
  return (
    <section>
      <p className="eyebrow">{t('appName')}</p>
      <h2>{t(key, { ns: 'navigation' })}</h2>
      <p>{t('protectedBody')}</p>
    </section>
  );
}
function AutoLockSettings({
  database,
  header,
  dek,
  onHeaderChanged,
  onErase,
}: {
  database: ContinuityDatabase | null;
  header: VaultHeader | null;
  dek: CryptoKey;
  onHeaderChanged: (header: VaultHeader) => void;
  onErase: () => Promise<void>;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [minutes, setMinutes] = useState(() =>
    Number(window.localStorage.getItem('continuity-binder-auto-lock') ?? 15),
  );
  const [copied, setCopied] = useState(false);
  const [currentPassphrase, setCurrentPassphrase] = useState('');
  const [newPassphrase, setNewPassphrase] = useState('');
  const [confirmNewPassphrase, setConfirmNewPassphrase] = useState('');
  const [passphraseStatus, setPassphraseStatus] = useState<
    'idle' | 'changed' | 'failed'
  >('idle');
  const [erasePassphrase, setErasePassphrase] = useState('');
  const [eraseConfirmation, setEraseConfirmation] = useState('');
  const [eraseStatus, setEraseStatus] = useState<'idle' | 'failed'>('idle');
  const changePassphrase = async () => {
    if (
      !database ||
      !header ||
      newPassphrase.length < 12 ||
      newPassphrase !== confirmNewPassphrase
    ) {
      setPassphraseStatus('failed');
      return;
    }
    try {
      await unlockVault(currentPassphrase, header);
      const nextHeader = await changeVaultPassphrase(
        dek,
        newPassphrase,
        header,
      );
      await putVaultHeader(database, nextHeader);
      onHeaderChanged(nextHeader);
      setCurrentPassphrase('');
      setNewPassphrase('');
      setConfirmNewPassphrase('');
      setPassphraseStatus('changed');
    } catch {
      setPassphraseStatus('failed');
    }
  };
  return (
    <section>
      <p className="eyebrow">{t('appName')}</p>
      <h2>{t('autoLock')}</h2>
      <p>{t('autoLockHelp')}</p>
      <label>
        {t('autoLock')}
        <select
          value={minutes}
          onChange={(event) => {
            const next = Number(event.target.value);
            setMinutes(next);
            window.localStorage.setItem(
              'continuity-binder-auto-lock',
              String(next),
            );
          }}
        >
          <option value="5">5 {t('minutes')}</option>
          <option value="15">15 {t('minutes')}</option>
          <option value="30">30 {t('minutes')}</option>
          <option value="60">60 {t('minutes')}</option>
        </select>
      </label>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard
            ?.writeText(buildDiagnosticInfo())
            .then(() => setCopied(true));
        }}
      >
        Copy diagnostic info
      </button>
      {copied && (
        <p role="status">
          Diagnostic info copied. It contains no binder values.
        </p>
      )}
      <h2>{t('changePassphrase', { ns: 'settings' })}</h2>
      <p>{t('changePassphraseHelp', { ns: 'settings' })}</p>
      <label>
        {t('currentPassphrase', { ns: 'settings' })}
        <input
          type="password"
          value={currentPassphrase}
          onChange={(event) => setCurrentPassphrase(event.target.value)}
        />
      </label>
      <label>
        {t('newPassphrase', { ns: 'settings' })}
        <input
          type="password"
          value={newPassphrase}
          onChange={(event) => setNewPassphrase(event.target.value)}
        />
      </label>
      <label>
        {t('confirmNewPassphrase', { ns: 'settings' })}
        <input
          type="password"
          value={confirmNewPassphrase}
          onChange={(event) => setConfirmNewPassphrase(event.target.value)}
        />
      </label>
      <button type="button" onClick={() => void changePassphrase()}>
        {t('change', { ns: 'settings' })}
      </button>
      {passphraseStatus === 'changed' && (
        <p role="status">{t('changed', { ns: 'settings' })}</p>
      )}
      {passphraseStatus === 'failed' && (
        <p role="alert">{t('changeFailed', { ns: 'settings' })}</p>
      )}
      <h2>{t('eraseTitle', { ns: 'settings' })}</h2>
      <p>{t('eraseBody', { ns: 'settings' })}</p>
      <p>{t('eraseBackupReminder', { ns: 'settings' })}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void unlockVault(erasePassphrase, header!)
            .then(() => {
              if (eraseConfirmation !== 'ERASE')
                throw new Error('confirmation');
              return onErase();
            })
            .catch(() => setEraseStatus('failed'));
        }}
      >
        <label>
          {t('erasePassphrase', { ns: 'settings' })}
          <input
            type="password"
            value={erasePassphrase}
            onChange={(event) => setErasePassphrase(event.target.value)}
          />
        </label>
        <label>
          {t('eraseConfirmation', { ns: 'settings' })}
          <input
            value={eraseConfirmation}
            onChange={(event) => setEraseConfirmation(event.target.value)}
          />
        </label>
        {eraseStatus === 'failed' && (
          <p role="alert">{t('eraseFailed', { ns: 'settings' })}</p>
        )}
        <button type="submit">{t('eraseButton', { ns: 'settings' })}</button>
      </form>
    </section>
  );
}

export function App() {
  const [dek, setDek] = useState<CryptoKey | null>(null);
  const [header, setHeader] = useState<VaultHeader | null>(null);
  const [database] = useState(() =>
    typeof indexedDB === 'undefined' ? null : new ContinuityDatabase(),
  );
  const [lastActivity, setLastActivity] = useState(() => Date.now());
  const autoLockMinutes = Number(
    window.localStorage.getItem('continuity-binder-auto-lock') ?? 15,
  );
  useEffect(() => {
    if (!database) return;
    void getVaultHeader(database).then(setHeader);
  }, [database]);
  useEffect(() => {
    if (!dek) return;
    const activity = () => setLastActivity(Date.now());
    window.addEventListener('pointerdown', activity);
    window.addEventListener('keydown', activity);
    const timer = window.setInterval(() => {
      if (Date.now() - lastActivity >= autoLockMinutes * 60_000) setDek(null);
    }, 1000);
    return () => {
      window.removeEventListener('pointerdown', activity);
      window.removeEventListener('keydown', activity);
      window.clearInterval(timer);
    };
  }, [dek, lastActivity, autoLockMinutes]);
  const clearVault = async () => {
    if (database) await eraseVault(database);
    setDek(null);
    setHeader(null);
  };
  const eraseFromSettings = async () => {
    await clearVault();
    window.location.assign('/?erased=1');
  };
  const restored = () => {
    setDek(null);
    if (database) void getVaultHeader(database).then(setHeader);
  };
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Landing eraseNotice={window.location.search === '?erased=1'} />
        }
      />
      <Route path="/privacy" element={<PublicPage titleKey="privacy" />} />
      <Route path="/security" element={<PublicPage titleKey="security" />} />
      <Route path="/disclaimer" element={<PublicPage titleKey="terms" />} />
      <Route path="/help" element={<Help />} />
      <Route
        path="/binder/setup"
        element={
          <Setup
            onCreated={(nextHeader, nextDek) => {
              setHeader(nextHeader);
              setDek(nextDek);
              if (database) void putVaultHeader(database, nextHeader);
            }}
          />
        }
      />
      <Route
        path="/binder/unlock"
        element={
          <Unlock
            header={header}
            database={database}
            onUnlock={(nextDek) => {
              setLastActivity(Date.now());
              setDek(nextDek);
            }}
            onErase={clearVault}
          />
        }
      />
      <Route
        path="/binder/backup-restore"
        element={
          <EncryptedBackup
            database={database}
            restoreOnly={!dek}
            onRestored={restored}
          />
        }
      />
      <Route
        path="/binder"
        element={
          dek ? (
            <Shell onLock={() => setDek(null)} />
          ) : (
            <Navigate to="/binder/unlock" replace />
          )
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route
          path="overview"
          element={<Dashboard database={database} dek={dek!} />}
        />
        <Route
          path="household-setup"
          element={<HouseholdSetup database={database} dek={dek!} />}
        />
        <Route
          path="people-contacts"
          element={<PeopleContacts database={database} dek={dek!} />}
        />
        <Route
          path="start-here"
          element={
            <ImmediateResponse mode="start" database={database} dek={dek!} />
          }
        />
        <Route
          path="first-72-hours"
          element={
            <ImmediateResponse mode="first72" database={database} dek={dek!} />
          }
        />
        <Route
          path="do-not-do-immediately"
          element={
            <ImmediateResponse mode="doNot" database={database} dek={dek!} />
          }
        />
        <Route
          path="people-to-notify"
          element={
            <ImmediateResponse mode="notify" database={database} dek={dek!} />
          }
        />
        {navigation
          .filter(
            ([, path]) =>
              ![
                'overview',
                'household-setup',
                'people-contacts',
                'start-here',
                'first-72-hours',
                'do-not-do-immediately',
                'people-to-notify',
              ].includes(path),
          )
          .map(([, path]) => (
            <Route
              key={path}
              path={path}
              element={
                path === 'settings/security' ? (
                  <AutoLockSettings
                    database={database}
                    header={header}
                    dek={dek!}
                    onHeaderChanged={setHeader}
                    onErase={eraseFromSettings}
                  />
                ) : path === 'backup-restore' ? (
                  <EncryptedBackup database={database} />
                ) : path === 'immediate/incapacity' ? (
                  <IncapacityContinuityPlan database={database} dek={dek!} />
                ) : path === 'immediate/death-certificates' ? (
                  <DeathCertificateTracker database={database} dek={dek!} />
                ) : path === 'immediate/estate-administration' ? (
                  <EstateAdministrationTracker database={database} dek={dek!} />
                ) : path === 'immediate/claims-benefits' ? (
                  <ClaimsBenefitsTracker database={database} dek={dek!} />
                ) : path === 'immediate/account-actions' ? (
                  <AccountClosureTransferTracker database={database} dek={dek!} />
                ) : path === 'legal/licenses' ? (
                  <GovernmentLicensingRecords database={database} dek={dek!} />
                ) : path === 'legal/military' ? (
                  <MilitaryVeteranRecord database={database} dek={dek!} />
                ) : path === 'legal/international' ? (
                  <ForeignPropertyInternationalAffairs database={database} dek={dek!} />
                ) : path === 'travel/vacation-assets' ? (
                  <TravelTimeshareVacationProperty database={database} dek={dek!} />
                ) : path === 'money/loyalty' ? (
                  <LoyaltyPointsRewards database={database} dek={dek!} />
                ) : path === 'money/outstanding-purchases' ? (
                  <OutstandingPurchasesRefunds database={database} dek={dek!} />
                ) : path === 'property/warranties' ? (
                  <WarrantyServiceContracts database={database} dek={dek!} />
                ) : path === 'property/storage-units' ? (
                  <StorageUnitsOffsiteStorage database={database} dek={dek!} />
                ) : path === 'property/collections' ? (
                  <CollectionsInventory database={database} dek={dek!} />
                ) : path === 'legal-estate' ? (
                  <LegalEstate database={database} dek={dek!} />
                ) : path === 'money-benefits' ? (
                  <InsuranceBenefits database={database} dek={dek!} />
                ) : path === 'banking-investments' ? (
                  <FinanceAccounts database={database} dek={dek!} />
                ) : path === 'debts-obligations' ? (
                  <DebtsObligations database={database} dek={dek!} />
                ) : path === 'property' ? (
                  <PropertyAssets database={database} dek={dek!} />
                ) : path === 'business-employment' ? (
                  <BusinessEmployment database={database} dek={dek!} />
                ) : path === 'digital-access' ? (
                  <DigitalAccess database={database} dek={dek!} />
                ) : path === 'family-continuity' ? (
                  <>
                    <FamilyCare database={database} dek={dek!} />
                    <DependentSection database={database} dek={dek!} />
                  </>
                ) : path === 'tax-records' ? (
                  <TaxRecords database={database} dek={dek!} />
                ) : path === 'wishes-legacy' ? (
                  <WishesLegacy database={database} dek={dek!} />
                ) : path === 'review' ? (
                  <CompletenessReview database={database} dek={dek!} />
                ) : path === 'preview' ? (
                  <BinderPreview database={database} dek={dek!} />
                ) : path === 'export' ? (
                  <ReadableArchiveExport database={database} dek={dek!} />
                ) : (
                  <ProtectedPage />
                )
              }
            />
          ))}
      </Route>
      <Route path="*" element={<PublicPage titleKey="notFound" />} />
    </Routes>
  );
}
