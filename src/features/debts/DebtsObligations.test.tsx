import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { DebtsObligations, obligationSchema } from './DebtsObligations';

describe('debts and household obligations', () => {
  it('shows the continuity-only responsibility boundary and running-household columns', () => {
    render(<MemoryRouter><DebtsObligations database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText(/does not determine who is legally responsible/i)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Criticality' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Responsible person' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep the household running' })).toBeInTheDocument();
  });

  it('allows optional amounts while preserving criticality and autopay fields', () => {
    const record = obligationSchema.parse({ id: 'o', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', service: 'Power', category: 'utilities', frequency: 'monthly', due: '1st', autopay: true, paidFrom: 'checking', criticality: 'critical' });
    expect(record.amount).toBeUndefined();
    expect(record.autopay).toBe(true);
    expect(record.criticality).toBe('critical');
  });
});
