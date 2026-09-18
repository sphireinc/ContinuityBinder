import { describe, expect, it } from 'vitest';
import { photoVideoArchiveSchema } from './PhotoVideoArchiveMap';

describe('photo and video archive maps', () => {
  it('requires structural archive facts and a stable owner reference', () => {
    const record = photoVideoArchiveSchema.parse({ id: 'archive', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', collectionSource: 'Family photos', ownerId: 'person-1', serviceDevice: 'External drive', dateRange: '1990-2000', approximateSize: '2 TB', primaryLocation: 'Study cabinet', backupLocation: 'Unknown', accessInstructionLocation: 'Binder page 12', irreplaceableNote: 'Childhood photos', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record.ownerId).toBe('person-1');
    expect(record).not.toHaveProperty('backupCreated');
    expect(record).not.toHaveProperty('accessConfirmed');
  });

  it('accepts Unknown for facts that still need research', () => {
    expect(() => photoVideoArchiveSchema.parse({ id: 'archive', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', collectionSource: 'Unknown', ownerId: 'person-1', serviceDevice: 'Unknown', dateRange: 'Unknown', approximateSize: 'Unknown', primaryLocation: 'Unknown', backupLocation: 'Unknown', accessInstructionLocation: 'Unknown', irreplaceableNote: 'Unknown', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true })).not.toThrow();
  });
});
