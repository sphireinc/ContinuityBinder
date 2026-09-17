import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n/config';
import { PeopleContacts } from './PeopleContacts';

describe('people and contact directory', () => {
  it('exposes protected identifier guidance and the complete contact role set', () => {
    render(<MemoryRouter><PeopleContacts database={null} dek={null as unknown as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText(/including a full identifier increases the sensitivity/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Employment record reference (optional)')).toBeInTheDocument();
    const role = screen.getByLabelText('Contact role');
    expect(role).toHaveValue('attorney');
    expect(screen.getByRole('option', { name: 'CPA / tax preparer' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Property service professional' })).toBeInTheDocument();
  });
});
