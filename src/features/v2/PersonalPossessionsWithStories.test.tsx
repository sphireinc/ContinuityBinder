import { describe, expect, it } from 'vitest';
import { personalPossessionStorySchema } from './PersonalPossessionsWithStories';

describe('personal possessions with stories', () => {
  it('requires item, title, and narrative facts without persisting survivor decisions', () => {
    const record = personalPossessionStorySchema.parse({
      id: 'story', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', itemReference: 'Unknown', storyTitle: 'Unknown', origin: '', giverMakerId: '', whyItMatters: '', associatedPeoplePlace: '', photoLocation: '', intendedRecipientNote: '', narrative: 'Unknown', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record).not.toHaveProperty('storyReviewed');
    expect(record).not.toHaveProperty('recipientConfirmed');
  });

  it('stores the giver or maker as a canonical person ID', () => {
    const record = personalPossessionStorySchema.parse({
      id: 'story', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', itemReference: 'Wooden clock', storyTitle: 'Grandfather clock', origin: 'Family home', giverMakerId: 'person-1', whyItMatters: 'Family history', associatedPeoplePlace: 'Grandparents', photoLocation: 'Photos/clock', intendedRecipientNote: 'Discuss with family', narrative: 'A long family story.', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record.giverMakerId).toBe('person-1');
    expect(record).not.toHaveProperty('giverMakerName');
  });
});
