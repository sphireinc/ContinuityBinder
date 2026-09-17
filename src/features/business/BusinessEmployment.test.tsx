import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { BusinessEmployment, businessInterestSchema, employmentSchema } from './BusinessEmployment';

describe('business and employment records', () => {
  it('shows the corporate-document boundary and both record sections', () => {
    render(<MemoryRouter><BusinessEmployment database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText(/does not override corporate documents/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Business interests' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Employment & Benefits' })).toBeInTheDocument();
  });

  it('supports the continuity instruction options and person-linked employment', () => {
    const business = businessInterestSchema.parse({ id: 'b', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', entityIdentity: 'Acme', continuity: 'operator' });
    const employment = employmentSchema.parse({ id: 'e', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', personId: 'p', employer: 'Acme' });
    expect(business.continuity).toBe('operator');
    expect(employment.personId).toBe('p');
  });
});
