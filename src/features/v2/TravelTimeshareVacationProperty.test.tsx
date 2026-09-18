import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { TravelTimeshareVacationProperty, travelTimeshareSchema } from './TravelTimeshareVacationProperty';

describe('travel timeshare and vacation property', () => {
  it('shows localized empty state and blank paper actions', () => {
    render(<TravelTimeshareVacationProperty database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Travel / Timeshare / Vacation Property' })).toBeInTheDocument();
    expect(screen.getByText(/No travel \/ timeshare \/ vacation property records/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue.*Transfer.*Sell.*Cancel.*Review/)).toBeInTheDocument();
  });

  it('requires asset, type, owner references without a digital status', () => {
    expect(() => travelTimeshareSchema.parse({})).toThrow();
    const record = travelTimeshareSchema.parse({ id: 'travel', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', assetProgram: 'Synthetic timeshare', type: 'Timeshare', ownerId: 'person-1', locationProvider: '', accountReference: '', annualCost: '', renewalUseDates: '', paymentSource: '', transferCancellationContact: '', documentLocation: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record).not.toHaveProperty('status');
  });
});
