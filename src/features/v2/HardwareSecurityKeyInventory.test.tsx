import { describe, expect, it } from 'vitest';
import { hardwareSecurityKeySchema } from './HardwareSecurityKeyInventory';

describe('hardware security key inventory', () => {
  it('requires a canonical owner reference and never stores secret key material', () => {
    const record = hardwareSecurityKeySchema.parse({ id: 'key', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', keyLabel: 'Primary key', ownerId: 'person-1', makeModel: 'YubiKey 5', physicalLocation: 'Desk drawer', backupKeyLocation: 'Safe', associatedServiceCategories: 'Email, banking', recoveryInstructionLocation: 'Binder page 15', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true });
    expect(record.ownerId).toBe('person-1');
    expect(record).not.toHaveProperty('secret');
    expect(record).not.toHaveProperty('pin');
    expect(record).not.toHaveProperty('located');
  });

  it('accepts Unknown for facts requiring follow-up', () => {
    expect(() => hardwareSecurityKeySchema.parse({ id: 'key', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', keyLabel: 'Unknown', ownerId: 'person-1', makeModel: 'Unknown', physicalLocation: 'Unknown', backupKeyLocation: 'Unknown', associatedServiceCategories: 'Unknown', recoveryInstructionLocation: 'Unknown', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true })).not.toThrow();
  });
});
