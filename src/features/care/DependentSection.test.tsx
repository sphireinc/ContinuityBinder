import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { DependentSection } from './DependentSection';

describe('dependent records', () => {
  it('renders linked-person fields and the signed-document guardian boundary', () => {
    render(
      <MemoryRouter>
        <DependentSection database={null} dek={{} as CryptoKey} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/not legal appointments/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Linked person')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Continuity letter reference'),
    ).toBeInTheDocument();
  });
});
