import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { TaxRecords, retentionSchema, taxReturnSchema } from './TaxRecords';

describe('tax and record retention', () => {
  it('shows the last-three-years prompt and organizational retention boundary', () => {
    render(<MemoryRouter><TaxRecords database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText(/last three years of filed returns/i)).toBeInTheDocument();
    expect(screen.getByText(/not jurisdiction-specific retention advice/i)).toBeInTheDocument();
  });

  it('keeps tax-year and retention records referenceable and structured', () => {
    const tax = taxReturnSchema.parse({ id: 't', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', year: '2025', taxpayerIds: ['p'], federal: 'vault/federal' });
    const retention = retentionSchema.parse({ id: 'r', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', category: 'insurance', years: '2020-2025', location: 'file cabinet' });
    expect(tax.taxpayerIds).toEqual(['p']);
    expect(retention.category).toBe('insurance');
  });
});
