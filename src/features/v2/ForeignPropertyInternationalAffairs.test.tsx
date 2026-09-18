import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { ForeignPropertyInternationalAffairs, foreignPropertySchema } from './ForeignPropertyInternationalAffairs';

describe('foreign property and international affairs', () => {
  it('shows localized empty state and blank country follow-up controls', () => {
    render(<ForeignPropertyInternationalAffairs database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Foreign Property / International Affairs' })).toBeInTheDocument();
    expect(screen.getByText(/No foreign property \/ international affairs records/i)).toBeInTheDocument();
    expect(screen.getByText(/Local contact reached.*Documents located.*Local requirements reviewed/)).toBeInTheDocument();
  });

  it('requires canonical person, country, and matter without a digital status', () => {
    expect(() => foreignPropertySchema.parse({})).toThrow();
    const record = foreignPropertySchema.parse({ id: 'foreign', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', personId: 'person-1', country: 'Synthetic country', matterType: 'Synthetic property', description: '', localAttorneyContact: '', documentLocation: '', accountPropertyReference: '', taxContactNotes: '', languagePreference: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record).not.toHaveProperty('status');
  });
});
