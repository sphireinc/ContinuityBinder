import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmailField, IdentifierField, Picker, TextField } from './forms';

describe('shared form primitives', () => {
  it('renders accessible labels, help, and validation state', () => {
    render(<TextField label="Household name" helpText="Use a name you recognize." error="A name is required." />);
    expect(screen.getByLabelText('Household name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('A name is required.');
  });

  it('provides specialized field semantics and shared picker creation', () => {
    const onAddNew = vi.fn();
    render(<><EmailField label="Email" /><IdentifierField label="Policy number" /><Picker label="Person" options={[{ value: 'one', label: 'One' }]} onAddNew={onAddNew} /></>);
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Person')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Add new' }).click();
    expect(onAddNew).toHaveBeenCalledOnce();
  });
});
