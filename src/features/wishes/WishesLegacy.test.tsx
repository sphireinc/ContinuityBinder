import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { WishesLegacy, personalLetterSchema, wishesSchema } from './WishesLegacy';

describe('wishes and legacy', () => {
  it('shows the jurisdiction boundary and plain-text letter guidance', () => {
    render(<MemoryRouter><WishesLegacy database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText(/Whether they are legally binding/i)).toBeInTheDocument();
    expect(screen.getByText(/arbitrary HTML is never rendered/i)).toBeInTheDocument();
  });

  it('supports sealed letters and per-adult arrangements', () => {
    const wishes = wishesSchema.parse({ id: 'w', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', personId: 'p', arrangement: 'cremation' });
    const letter = personalLetterSchema.parse({ id: 'l', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', author: 'A', recipients: 'B', title: 'Hello', body: '**text**', includePrint: true, newPage: true, sealed: true });
    expect(wishes.arrangement).toBe('cremation');
    expect(letter.sealed).toBe(true);
    expect(letter.body).toContain('**text**');
  });
});
