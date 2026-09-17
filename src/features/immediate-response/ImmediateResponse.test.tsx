import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n/config';
import { ImmediateResponse } from './ImmediateResponse';

describe('immediate response sections', () => {
  it('renders the required Start Here checklist', () => {
    render(<MemoryRouter><ImmediateResponse mode="start" /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Start Here' })).toBeInTheDocument();
    expect(screen.getByText('Locate the will, trust, and directives')).toBeInTheDocument();
    expect(screen.getByText('Preserve phone and email access until administrative needs are understood')).toBeInTheDocument();
  });

  it('supports notes and ordering in the editable 72-hour checklist', () => {
    render(<MemoryRouter><ImmediateResponse mode="first72" /></MemoryRouter>);
    const notes = screen.getAllByPlaceholderText('Notes')[0];
    fireEvent.change(notes, { target: { value: 'Use the directory contact.' } });
    expect(notes).toHaveValue('Use the directory contact.');
    fireEvent.click(screen.getAllByRole('button', { name: 'Move item down' })[0]);
    expect(screen.getByRole('button', { name: 'Save notes locally' })).toBeInTheDocument();
  });

  it('keeps People to Notify sourced from the contact directory', () => {
    render(<MemoryRouter><ImmediateResponse mode="notify" /></MemoryRouter>);
    expect(screen.getByRole('columnheader', { name: 'Person or organization' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Phone' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByText('No contacts have been selected from the directory yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Contact Directory' })).toHaveAttribute('href', '/people-contacts');
  });
});
