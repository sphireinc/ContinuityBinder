import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { BinderPreview } from './BinderPreview';

describe('binder preview print controls', () => {
  it('shows browser print guidance, page size, cover, and sensitive-data choices', () => {
    render(
      <MemoryRouter>
        <BinderPreview />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(
        /print dialog can print to paper or save this binder as a PDF/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Page size')).toBeInTheDocument();
    expect(screen.getByLabelText('Include cover')).toBeInTheDocument();
    expect(screen.getByText('Personal letters: Include')).toBeInTheDocument();
  });
});
