import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n/config';
import { AccountClosureTransferTracker, accountClosureTransferSchema } from './AccountClosureTransferTracker';

describe('account closure and transfer tracker', () => {
  it('shows the localized empty state and blank survivor actions', () => {
    render(<AccountClosureTransferTracker database={null} dek={{} as CryptoKey} />);
    expect(screen.getByRole('heading', { name: 'Account Closure / Transfer Tracker' })).toBeInTheDocument();
    expect(screen.getByText(/No account closure \/ transfer tracker records have been prepared yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Leave active.*Transfer.*Close.*Review.*Other/)).toBeInTheDocument();
  });

  it('requires structural references and does not persist survivor completion status', () => {
    expect(() => accountClosureTransferSchema.parse({})).toThrow();
    const record = accountClosureTransferSchema.parse({ id: 'account', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', accountReference: 'Synthetic account', ownerId: 'person-1', institutionProvider: 'Synthetic provider', recommendedAction: 'Review', reason: '', contact: '', documentsNeeded: '', targetTiming: '', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true });
    expect(record).not.toHaveProperty('status');
    expect(record.ownerId).toBe('person-1');
  });
});
