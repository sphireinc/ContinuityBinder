import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { OutstandingPurchasesRefunds, outstandingPurchasesSchema } from './OutstandingPurchasesRefunds';

describe('outstanding purchases, deposits, and refunds', () => {
  it('shows localized empty state and blank paper actions', () => {
    render(<OutstandingPurchasesRefunds database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Outstanding Purchases / Deposits / Refunds' })).toBeInTheDocument();
    expect(screen.getByText(/No outstanding purchases \/ deposits \/ refunds records/i)).toBeInTheDocument();
    expect(screen.getByText(/Contacted.*Refund received.*Service completed.*Canceled/)).toBeInTheDocument();
  });

  it('requires merchant and type without a digital status', () => {
    expect(() => outstandingPurchasesSchema.parse({})).toThrow();
    const record = outstandingPurchasesSchema.parse({ id: 'purchase', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', merchantProvider: 'Synthetic merchant', type: 'Deposit', amount: 'Unknown', datePaid: '', expectedRefundService: '', orderReference: '', paymentSource: '', contact: '', supportingDocument: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record).not.toHaveProperty('status');
  });
});
