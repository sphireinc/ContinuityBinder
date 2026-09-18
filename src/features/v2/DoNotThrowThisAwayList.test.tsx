import { describe, expect, it } from 'vitest';
import { doNotThrowAwaySchema } from './DoNotThrowThisAwayList';

describe('do not throw this away records', () => {
  it('requires structural facts and does not persist survivor decisions', () => {
    const record = doNotThrowAwaySchema.parse({
      id: 'item', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', item: 'Unknown', location: 'Unknown', ownerId: '', whyItMatters: 'Review before disposal', relatedPersonBusinessId: '', whoShouldReviewId: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record).not.toHaveProperty('located');
    expect(record).not.toHaveProperty('reviewed');
    expect(record).not.toHaveProperty('safeToDispose');
  });

  it('stores canonical person references rather than copied names', () => {
    const record = doNotThrowAwaySchema.parse({
      id: 'item', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', item: 'Synthetic archive drive', location: 'Office', ownerId: 'person-1', whyItMatters: 'Contains family records', relatedPersonBusinessId: 'person-2', whoShouldReviewId: 'person-3', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record.ownerId).toBe('person-1');
    expect(record.relatedPersonBusinessId).toBe('person-2');
    expect(record.whoShouldReviewId).toBe('person-3');
    expect(record).not.toHaveProperty('ownerName');
  });
});
