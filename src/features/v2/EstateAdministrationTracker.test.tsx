import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { EstateAdministrationTracker, estateAdministrationSchema } from './EstateAdministrationTracker';

describe('estate administration tracker', () => {
  it('shows the localized empty state and paper-only status controls', () => {
    render(<EstateAdministrationTracker database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Estate Administration Tracker' })).toBeInTheDocument();
    expect(screen.getByText(/No estate administration tracker records have been prepared yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Not started.*In progress.*Completed.*N\/A/)).toBeInTheDocument();
  });

  it('requires a task and preserves no digital completion status', () => {
    expect(() => estateAdministrationSchema.parse({})).toThrow();
    const record = estateAdministrationSchema.parse({ id: 'task', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', deceasedPersonId: 'person', representative: '', attorney: '', courtAgency: '', caseReference: '', task: 'Locate signed records', responsiblePersonId: '', supportingDocument: '', targetTiming: '', notes: '', includeInPrint: true, includeInReadableExport: true });
    expect(record).not.toHaveProperty('status');
  });
});
