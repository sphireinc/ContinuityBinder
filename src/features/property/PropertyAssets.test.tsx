import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { PropertyAssets, propertyAssetSchema } from './PropertyAssets';

describe('property and asset records', () => {
  it('shows attachment gating and the intended-recipient legal boundary', () => {
    render(<MemoryRouter><PropertyAssets database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText(/Image attachments are unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/Personal note only/i)).toBeInTheDocument();
  });

  it('supports vehicle VIN display policies without alarm PIN fields', () => {
    const vehicle = propertyAssetSchema.parse({ id: 'v', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', kind: 'vehicle', label: 'Car', ownerIds: [], vin: '123456789', vinDisplayPolicy: 'last4' });
    expect(vehicle.vinDisplayPolicy).toBe('last4');
    expect(vehicle).not.toHaveProperty('alarmPin');
  });
});
