import { describe, expect, it } from 'vitest';
import { familyRecipeTraditionSchema } from './FamilyRecipesTraditions';

describe('family recipes and traditions', () => {
  it('requires title, type, and instructions without digital status state', () => {
    const record = familyRecipeTraditionSchema.parse({
      id: 'recipe', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', title: 'Unknown', type: 'Recipe', originPersonId: '', ingredientsMaterials: 'Unknown', instructions: 'Unknown', whenObserved: '', participantIds: '', storyContext: '', photoLocation: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record).not.toHaveProperty('completed');
    expect(record).not.toHaveProperty('status');
  });

  it('stores origin and participant references as IDs rather than copied names', () => {
    const record = familyRecipeTraditionSchema.parse({
      id: 'recipe', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', title: 'Grandma pie', type: 'Recipe', originPersonId: 'person-1', ingredientsMaterials: 'Apples', instructions: 'Bake slowly.', whenObserved: 'Holidays', participantIds: 'person-1,person-2', storyContext: 'Family gathering', photoLocation: 'Photos/pie', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true,
    });
    expect(record.originPersonId).toBe('person-1');
    expect(record.participantIds.split(',')).toEqual(['person-1', 'person-2']);
    expect(record).not.toHaveProperty('originPersonName');
  });
});
