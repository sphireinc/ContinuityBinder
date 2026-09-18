import { describe, expect, it } from 'vitest';
import { collectionSchema } from './CollectionsInventory';

describe('collections inventory records', () => {
  it('requires structural collection facts and allows unknown values', () => {
    const record = collectionSchema.parse({
      id: 'collection', schemaVersion: 1, createdAt: 'now', updatedAt: 'now',
      collectionName: 'Unknown', category: 'Unknown', ownerId: '', location: 'Unknown', approximateSizeValue: '', catalogLocation: '', knowledgeableContactId: '', insurance: 'Unknown', preferredDispositionNote: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record.ownerId).toBe('');
    expect(record).not.toHaveProperty('specialistContacted');
    expect(record).not.toHaveProperty('valuationObtained');
  });

  it('stores canonical person IDs and never duplicates person names', () => {
    const record = collectionSchema.parse({
      id: 'collection', schemaVersion: 1, createdAt: 'now', updatedAt: 'now',
      collectionName: 'Synthetic stamps', category: 'Philately', ownerId: 'person-1', location: 'Study', approximateSizeValue: 'Unknown', catalogLocation: 'Shelf 2', knowledgeableContactId: 'person-2', insurance: '', preferredDispositionNote: 'Review with specialist', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record.ownerId).toBe('person-1');
    expect(record.knowledgeableContactId).toBe('person-2');
    expect(record).not.toHaveProperty('ownerName');
    expect(record).not.toHaveProperty('knowledgeableContactName');
  });
});
