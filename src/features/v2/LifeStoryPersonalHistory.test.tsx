import { describe, expect, it } from 'vitest';
import { lifeStorySchema } from './LifeStoryPersonalHistory';

describe('life story questionnaires', () => {
  it('requires a canonical person reference and does not persist review status', () => {
    const record = lifeStorySchema.parse({
      id: 'life', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', personId: 'person-1', childhood: 'Unknown', parentsFamily: '', placesLived: '', education: '', career: '', service: '', relationships: '', children: '', turningPoints: '', proudestMoments: '', lessons: '', favoriteMemories: '', values: '', messageToFamily: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record.personId).toBe('person-1');
    expect(record).not.toHaveProperty('reviewedWithFamily');
    expect(record).not.toHaveProperty('additionsRecorded');
  });

  it('preserves narrative fields and excludes copied person names', () => {
    const record = lifeStorySchema.parse({
      id: 'life', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', personId: 'person-1', childhood: 'Small town', parentsFamily: 'Family', placesLived: 'Several places', education: 'School', career: 'Work', service: 'Unknown', relationships: 'Family', children: 'Unknown', turningPoints: 'Move', proudestMoments: 'Graduation', lessons: 'Be kind', favoriteMemories: 'Holidays', values: 'Care', messageToFamily: 'Love', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record.messageToFamily).toBe('Love');
    expect(record).not.toHaveProperty('personName');
  });
});
