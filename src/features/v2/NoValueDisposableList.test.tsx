import { describe, expect, it } from 'vitest';
import { noValueDisposableSchema } from './NoValueDisposableList';

describe('no-value disposable records', () => {
  it('requires structural facts and does not persist survivor decisions', () => {
    const record = noValueDisposableSchema.parse({
      id: 'item', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', itemCategory: 'Unknown', location: 'Unknown', reason: 'Unknown', anyException: '', whoShouldVerifyId: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record).not.toHaveProperty('reviewed');
    expect(record).not.toHaveProperty('disposedDonated');
  });

  it('stores the verifier as a canonical person ID', () => {
    const record = noValueDisposableSchema.parse({
      id: 'item', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', itemCategory: 'Old cables', location: 'Garage', reason: 'Replaced equipment', anyException: 'Check adapters first', whoShouldVerifyId: 'person-1', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record.whoShouldVerifyId).toBe('person-1');
    expect(record).not.toHaveProperty('whoShouldVerifyName');
  });
});
