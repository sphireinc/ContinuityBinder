import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { DigitalAccess, deviceSchema, digitalAccountSchema } from './DigitalAccess';

describe('digital access', () => {
  it('shows the password-manager boundary and custom-instruction sensitivity warning', () => {
    render(<MemoryRouter><DigitalAccess database={null} dek={{} as CryptoKey} /></MemoryRouter>);
    expect(screen.getByText(/not intended to replace a password manager/i)).toBeInTheDocument();
    expect(screen.getByText(/increase the sensitivity of printed and exported copies/i)).toBeInTheDocument();
  });

  it('keeps PINs and passwords out of the canonical device/account schemas', () => {
    const device = deviceSchema.parse({ id: 'd', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', ownerId: 'p', deviceType: 'phone', makeModel: 'Model' });
    const account = digitalAccountSchema.parse({ id: 'a', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', service: 'Mail', kind: 'email', identifier: 'owner', ownerId: 'p' });
    expect(device).not.toHaveProperty('pin');
    expect(account).not.toHaveProperty('password');
  });
});
