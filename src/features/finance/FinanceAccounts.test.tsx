import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { FinanceAccounts, financialAccountSchema } from './FinanceAccounts';

describe('banking and investment accounts', () => {
  it('defaults the display guidance to omitting exact values', () => {
    render(<MemoryRouter><FinanceAccounts database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText('Omit exact values')).toBeInTheDocument();
    expect(screen.getByText(/For crypto holdings, store a location/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Owners')).toHaveAttribute('multiple');
  });

  it('does not accept PIN or CVV-shaped fields in the canonical schema', () => {
    const parsed = financialAccountSchema.parse({ id: 'a', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', institution: 'Bank', ownerIds: [], kind: 'checking', identifier: '123', displayPolicy: 'omit' });
    expect(parsed).not.toHaveProperty('pin');
    expect(parsed).not.toHaveProperty('cvv');
  });
});
