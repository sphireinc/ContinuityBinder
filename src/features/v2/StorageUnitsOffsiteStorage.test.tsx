import { describe, expect, it } from 'vitest';
import { storageUnitSchema } from './StorageUnitsOffsiteStorage';

describe('storage unit records', () => {
  it('requires structural facility, address, and unit facts while allowing unknown references', () => {
    const record = storageUnitSchema.parse({
      id: 'storage', schemaVersion: 1, createdAt: 'now', updatedAt: 'now',
      facility: 'Synthetic Storage', address: 'Unknown', unitNumber: 'Unknown', unitNumberPolicy: 'hidden',
      accountHolderId: '', monthlyCost: '', paymentSource: '', accessKeyLocation: '', authorizedPersonIds: '', contentsSummary: '', insurance: '', contact: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record.accountHolderId).toBe('');
    expect(record.authorizedPersonIds).toBe('');
    expect(record).not.toHaveProperty('facilityContacted');
    expect(record).not.toHaveProperty('accessObtained');
  });

  it('preserves stable person references and masking policy without duplicated names', () => {
    const record = storageUnitSchema.parse({
      id: 'storage', schemaVersion: 1, createdAt: 'now', updatedAt: 'now',
      facility: 'Synthetic Storage', address: '123 Example Road', unitNumber: 'A-42', unitNumberPolicy: 'last4',
      accountHolderId: 'person-1', monthlyCost: '100', paymentSource: 'person-1', accessKeyLocation: 'Safe', authorizedPersonIds: 'person-1,person-2', contentsSummary: 'Boxes', insurance: 'Unknown', contact: 'Unknown', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record.accountHolderId).toBe('person-1');
    expect(record.authorizedPersonIds.split(',')).toEqual(['person-1', 'person-2']);
    expect(record.unitNumberPolicy).toBe('last4');
    expect(record).not.toHaveProperty('accountHolderName');
    expect(record).not.toHaveProperty('facilityContacted');
  });
});
