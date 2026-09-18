import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { WarrantyServiceContracts, warrantyServiceSchema } from './WarrantyServiceContracts';

describe('warranty and service contract inventory', () => {
  it('shows localized empty state and blank paper actions', () => {
    render(<WarrantyServiceContracts database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Warranty & Service Contract Inventory' })).toBeInTheDocument();
    expect(screen.getByText(/No warranty & service contract inventory records/i)).toBeInTheDocument();
    expect(screen.getByText(/Coverage verified.*Transferred.*Claim opened.*Expired\/closed/)).toBeInTheDocument();
  });

  it('requires item, provider, and type without a digital status', () => {
    expect(() => warrantyServiceSchema.parse({})).toThrow();
    const record = warrantyServiceSchema.parse({ id: 'warranty', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', itemProperty: 'Synthetic appliance', provider: 'Synthetic provider', contractType: 'Warranty', reference: '', coverage: '', startDate: '', endDate: '', transferabilityNote: '', contact: '', documentLocation: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record).not.toHaveProperty('status');
  });
});
