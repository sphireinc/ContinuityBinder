import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { CompletenessReview, reviewStateSchema } from './CompletenessReview';

describe('completeness review', () => {
  it('uses review language without presenting an overall readiness score', () => {
    render(<MemoryRouter><CompletenessReview database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Completeness Review' })).toBeInTheDocument();
    expect(screen.queryByText(/readiness score/i)).not.toBeInTheDocument();
    expect(screen.getByText('0 of 9 included sections reviewed')).toBeInTheDocument();
  });

  it('supports not-applicable and reviewed section states', () => {
    const reviewed = reviewStateSchema.parse({ id: 'r', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', section: 'tax', status: 'reviewed', lastReviewed: 'now' });
    const excluded = reviewStateSchema.parse({ id: 'x', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', section: 'family', status: 'notApplicable', reason: 'No dependents' });
    expect(reviewed.status).toBe('reviewed');
    expect(excluded.reason).toBe('No dependents');
  });
});
