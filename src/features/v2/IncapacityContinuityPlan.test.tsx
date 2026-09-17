import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { IncapacityContinuityPlan, incapacityPlanSchema } from './IncapacityContinuityPlan';

describe('incapacity continuity plan', () => {
  it('shows the caution, empty state, references, and paper actions', () => {
    render(<IncapacityContinuityPlan database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Incapacity Continuity Plan' })).toBeInTheDocument();
    expect(screen.getByText(/No incapacity continuity plan records have been prepared yet/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Applies to person')).toBeInTheDocument();
    expect(screen.getByText('☐ Authority confirmed')).toBeInTheDocument();
  });

  it('requires the linked person and a condition while keeping workflow state out of the schema', () => {
    expect(() => incapacityPlanSchema.parse({})).toThrow();
    const plan = incapacityPlanSchema.parse({
      id: 'plan', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', personId: 'person', condition: 'Synthetic condition', financialAgent: '', healthcareAgent: '', householdManager: '', dependentContact: '', businessContact: '', obligations: '', documentLocations: '', instructions: '', supportingDocument: '', primaryContact: '', preparerNotes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true,
    });
    expect(plan).not.toHaveProperty('status');
  });
});
