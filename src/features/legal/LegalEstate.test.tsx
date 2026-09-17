import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { LegalEstate, legalRecordSchema } from './LegalEstate';

describe('legal and estate records', () => {
  it('labels records as metadata and preserves the legal authority boundary', () => {
    render(<MemoryRouter><LegalEstate database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText('Record metadata only. Continuity Binder does not generate or validate legal instruments.')).toBeInTheDocument();
    expect(screen.getByText('Naming a person here does not legally appoint them. This record should reflect your signed legal documents.')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy location (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Assigned person or contact')).toBeInTheDocument();
  });

  it('requires document type in the LegalRecord schema', () => {
    expect(() => legalRecordSchema.parse({ id: 'x', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', kind: 'will', status: 'unknown', appliesToIds: [], copyLocationIds: [] })).toThrow();
  });
});
