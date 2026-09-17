import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { InsuranceBenefits, benefitRecordSchema } from './InsuranceBenefits';

describe('insurance and death benefits', () => {
  it('shows the contractual beneficiary warning and policy inventory columns', () => {
    render(<MemoryRouter><InsuranceBenefits database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText(/A will may not control assets or benefits/i)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Policy identifier' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Beneficiary summary' })).toBeInTheDocument();
  });

  it('accepts all supported beneficiary reference types', () => {
    const base = { id: 'b', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', insuredPersonId: 'p', carrier: 'Carrier', kind: 'life' as const, policyIdentifier: '1234', identifierDisplayPolicy: 'last4' as const, benefit: '1000', documentLocation: 'safe', reviewStatus: 'needsReview' as const };
    for (const beneficiaryType of ['person', 'trust', 'estate', 'other'] as const) expect(benefitRecordSchema.parse({ ...base, beneficiaryType, beneficiarySummary: beneficiaryType }).beneficiaryType).toBe(beneficiaryType);
  });
});
