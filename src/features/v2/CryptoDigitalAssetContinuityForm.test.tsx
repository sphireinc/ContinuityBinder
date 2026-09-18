import { describe, expect, it } from 'vitest';
import { cryptoDigitalAssetSchema } from './CryptoDigitalAssetContinuityForm';

describe('crypto digital asset continuity', () => {
  it('requires masked structural facts and stable person references', () => {
    const record = cryptoDigitalAssetSchema.parse({ id: 'crypto', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', ownerId: 'person-1', assetWalletCategory: 'Bitcoin wallet', custodianExchange: 'Exchange', accountWalletIdentifier: '••••1234', hardwareWalletLocation: 'Safe', recoveryInstructionLocation: 'Binder page 16', trustedTechnicalContactId: 'person-2', taxRecordLocation: 'Tax folder', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true });
    expect(record.ownerId).toBe('person-1');
    expect(record.accountWalletIdentifier).toContain('1234');
    expect(record).not.toHaveProperty('seedPhrase');
    expect(record).not.toHaveProperty('privateKey');
    expect(record).not.toHaveProperty('deviceLocated');
  });

  it('accepts Unknown for facts needing follow-up', () => {
    expect(() => cryptoDigitalAssetSchema.parse({ id: 'crypto', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', ownerId: 'person-1', assetWalletCategory: 'Unknown', custodianExchange: 'Unknown', accountWalletIdentifier: 'Unknown', hardwareWalletLocation: 'Unknown', recoveryInstructionLocation: 'Unknown', trustedTechnicalContactId: '', taxRecordLocation: 'Unknown', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true })).not.toThrow();
  });
});
