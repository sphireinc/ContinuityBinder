import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { LoyaltyPointsRewards, loyaltyPointsSchema } from './LoyaltyPointsRewards';

describe('loyalty points and rewards', () => {
  it('shows localized empty state and blank paper actions', () => {
    render(<LoyaltyPointsRewards database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Loyalty Points & Rewards' })).toBeInTheDocument();
    expect(screen.getByText(/No loyalty points & rewards records/i)).toBeInTheDocument();
    expect(screen.getByText(/Provider contacted.*Transferred\/redeemed.*Closed/)).toBeInTheDocument();
  });

  it('requires a canonical owner without a digital status', () => {
    expect(() => loyaltyPointsSchema.parse({})).toThrow();
    const record = loyaltyPointsSchema.parse({ id: 'rewards', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', program: 'Synthetic rewards', ownerId: 'person-1', accountIdentifier: '', approximateValue: 'Unknown', relatedCard: '', contact: '', transferPolicyNote: '', credentialLocation: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record).not.toHaveProperty('status');
  });
});
