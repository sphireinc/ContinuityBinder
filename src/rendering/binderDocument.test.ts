import { describe, expect, it } from 'vitest';
import { buildBinderDocument, DEFAULT_BINDER_ORDER } from './binderDocument';

describe('canonical binder document', () => {
  it('preserves the default print order and export choices', () => {
    const document = buildBinderDocument(Object.fromEntries(DEFAULT_BINDER_ORDER.map((key) => [key, key])), { identifier: 'last4', balances: 'omit', letters: true, medical: true, digital: true });
    expect(document.sections.map((section) => section.id)).toEqual([...DEFAULT_BINDER_ORDER]);
    expect(document.metadata.choices.balances).toBe('omit');
  });

  it('excludes optional sections before rendering', () => {
    const document = buildBinderDocument({}, { identifier: 'hidden', balances: 'range', letters: false, medical: false, digital: false }, { letters: false, digital: false });
    expect(document.sections.some((section) => section.id === 'letters')).toBe(false);
    expect(document.sections.some((section) => section.id === 'digital')).toBe(false);
  });

  it('includes supplied detailed section content in the canonical document', () => {
    const document = buildBinderDocument({}, { identifier: 'last4', balances: 'omit', letters: true, medical: true, digital: true }, {}, { insurance: ['Synthetic carrier | ••••1234'] });
    expect(document.sections.find((section) => section.id === 'insurance')?.blocks).toContainEqual({ type: 'paragraph', text: 'Synthetic carrier | ••••1234' });
  });
});
