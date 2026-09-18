import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { ClaimsBenefitsTracker, claimsBenefitsSchema } from './ClaimsBenefitsTracker';

describe('claims and benefits tracker', () => {
  it('shows the localized empty state and blank claim controls', () => {
    render(<ClaimsBenefitsTracker database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Claims & Benefits Tracker' })).toBeInTheDocument();
    expect(screen.getByText(/No claims & benefits tracker records have been prepared yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Claim opened.*Documents supplied.*Approved.*Paid.*Closed/)).toBeInTheDocument();
  });

  it('requires policy and carrier fields and has no mutable survivor status', () => {
    expect(() => claimsBenefitsSchema.parse({})).toThrow();
    const record = claimsBenefitsSchema.parse({ id: 'claim', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', benefitPolicy: 'Synthetic policy', carrier: 'Synthetic carrier', claimContact: '', documentsRequested: '', estimatedBenefit: '', submissionMethod: '', followUpContact: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record).not.toHaveProperty('status');
  });
});
