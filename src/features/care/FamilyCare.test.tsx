import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { FamilyCare, careSchema, routineSchema } from './FamilyCare';

describe('family care', () => {
  it('shows the medical freshness boundary and care sections', () => {
    render(<MemoryRouter><FamilyCare database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText(/can become outdated/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pets' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Household Routines' })).toBeInTheDocument();
  });

  it('keeps routines linked to people and importance classifications', () => {
    const routine = routineSchema.parse({ id: 'r', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', title: 'School pickup', frequency: 'weekdays', responsiblePersonId: 'p', instructions: 'Call if late', importance: 'important' });
    const care = careSchema.parse({ id: 'c', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', allergies: 'None reported' });
    expect(routine.responsiblePersonId).toBe('p');
    expect(routine.importance).toBe('important');
    expect(care.allergies).toBe('None reported');
  });
});
