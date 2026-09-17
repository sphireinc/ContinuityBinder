import { describe, expect, it } from 'vitest';
import { deathLanguage, prohibitedSaveLanguage, saveLanguage, sectionCopy, sensitiveIdentifierPrompt } from './copySystem';

describe('copy system rails', () => {
  it('provides complete guidance for every binder section', () => {
    const required = ['household', 'immediate', 'contacts', 'legal', 'insurance', 'finance', 'debts', 'property', 'business', 'digital', 'care', 'tax', 'wishes', 'review', 'rendering', 'export', 'backup'];
    for (const key of required) expect(sectionCopy[key]).toEqual(expect.objectContaining({ title: expect.any(String), purpose: expect.any(String), emptyState: expect.any(String), addAction: expect.any(String), reviewPrompt: expect.any(String), exportHeading: expect.any(String) }));
  });

  it('keeps sensitive and save language explicit', () => {
    expect(sensitiveIdentifierPrompt).toContain('last four characters');
    expect(saveLanguage).toContain('Saved locally');
    expect(saveLanguage).toContain('Encrypted backup created');
    expect(prohibitedSaveLanguage).toContain('Synced');
    expect(deathLanguage).toContain('After a death');
    expect(saveLanguage.join(' ')).not.toMatch(/synced|uploaded|account/i);
  });
});
