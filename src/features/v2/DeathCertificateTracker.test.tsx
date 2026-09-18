import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { DeathCertificateTracker, deathCertificateSchema } from './DeathCertificateTracker';

describe('death certificate tracker', () => {
  it('shows the localized empty state and blank paper actions', () => {
    render(<DeathCertificateTracker database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Death Certificate Tracker' })).toBeInTheDocument();
    expect(screen.getByText(/No death certificate tracker records have been prepared yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Sent.*Returned.*No return expected/)).toBeInTheDocument();
  });

  it('requires a deceased person and preserves no mutable survivor status', () => {
    expect(() => deathCertificateSchema.parse({})).toThrow();
    const record = deathCertificateSchema.parse({ id: 'r', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', deceasedPersonId: 'person', copiesOrdered: '3', orderingOffice: '', orderDate: '', copiesReceived: '', institution: '', copySent: '', returnExpected: '', referenceNumber: '', notes: '', includeInPrint: true, includeInReadableExport: true });
    expect(record).not.toHaveProperty('sentStatus');
  });
});
