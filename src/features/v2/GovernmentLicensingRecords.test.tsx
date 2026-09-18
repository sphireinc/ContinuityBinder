import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { GovernmentLicensingRecords, governmentLicensingSchema } from './GovernmentLicensingRecords';

describe('government and licensing records', () => {
  it('shows the localized empty state and blank paper actions', () => {
    render(<GovernmentLicensingRecords database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Government & Licensing Records' })).toBeInTheDocument();
    expect(screen.getByText(/No government & licensing records records have been prepared yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Renew.*Cancel.*Transfer.*Preserve.*Review/)).toBeInTheDocument();
  });

  it('requires person and structural credential references without a digital status', () => {
    expect(() => governmentLicensingSchema.parse({})).toThrow();
    const record = governmentLicensingSchema.parse({ id: 'license', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', personId: 'person-1', credentialType: 'Synthetic permit', issuingAuthority: 'Synthetic authority', credentialNumber: '', issueDate: '', expiration: '', renewalContact: '', documentLocation: '', relatedBusinessProperty: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record.personId).toBe('person-1');
    expect(record).not.toHaveProperty('status');
  });
});
