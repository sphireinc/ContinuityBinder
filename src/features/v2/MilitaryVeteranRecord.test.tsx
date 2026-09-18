import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { MilitaryVeteranRecord, militaryVeteranSchema } from './MilitaryVeteranRecord';

describe('military and veteran record', () => {
  it('shows the localized empty state and blank paper actions', () => {
    render(<MilitaryVeteranRecord database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Military / Veteran Record' })).toBeInTheDocument();
    expect(screen.getByText(/No military \/ veteran record records have been prepared yet/i)).toBeInTheDocument();
    expect(screen.getByText(/DD-214 located.*VA contacted.*Honors eligibility verified/)).toBeInTheDocument();
  });

  it('requires a canonical person and branch without a digital status', () => {
    expect(() => militaryVeteranSchema.parse({})).toThrow();
    const record = militaryVeteranSchema.parse({ id: 'military', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', personId: 'person-1', branch: 'Synthetic branch', serviceStart: '', serviceEnd: '', serviceNumber: '', rankRate: '', dischargeStatus: '', dd214Location: '', vaContact: '', veteranOrganization: '', medalsLocation: '', burialHonorsNotes: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record.personId).toBe('person-1');
    expect(record).not.toHaveProperty('status');
  });
});
