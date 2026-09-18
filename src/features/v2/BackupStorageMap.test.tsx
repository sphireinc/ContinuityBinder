import { describe, expect, it } from 'vitest';
import { backupStorageMapSchema } from './BackupStorageMap';

describe('backup and storage maps', () => {
  it('requires structural locations and stores people as stable IDs', () => {
    const record = backupStorageMapSchema.parse({ id: 'backup', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', systemCollection: 'Family computers', primaryLocation: 'Home NAS', backupMethod: 'Encrypted cloud backup', backupLocation: 'Unknown', frequency: 'Monthly', encryptionNote: 'Key stored separately', recoveryInstructionLocation: 'Binder page 14', responsiblePersonId: 'person-1', technicalContactId: 'person-2', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record.responsiblePersonId).toBe('person-1');
    expect(record).not.toHaveProperty('recoveryTested');
    expect(record).not.toHaveProperty('encryptionKey');
  });

  it('accepts Unknown where a fact needs follow-up', () => {
    expect(() => backupStorageMapSchema.parse({ id: 'backup', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', systemCollection: 'Unknown', primaryLocation: 'Unknown', backupMethod: 'Unknown', backupLocation: 'Unknown', frequency: 'Unknown', encryptionNote: 'Unknown', recoveryInstructionLocation: 'Unknown', responsiblePersonId: '', technicalContactId: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true })).not.toThrow();
  });
});
