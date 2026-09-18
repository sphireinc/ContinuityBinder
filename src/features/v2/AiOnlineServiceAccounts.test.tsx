import { describe, expect, it } from 'vitest';
import { aiOnlineServiceSchema } from './AiOnlineServiceAccounts';

describe('AI and online service accounts', () => {
  it('uses a stable owner reference and excludes credentials', () => {
    const record = aiOnlineServiceSchema.parse({ id: 'service', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', service: 'AI workspace', ownerBusinessId: 'person-1', purpose: 'Projects', accountIdentifier: '••••1234', billingFrequency: 'Monthly', paymentSource: 'Business card', storedDataProjects: 'Prompts', credentialLocation: 'Password manager', desiredHandling: 'Review and export', contact: 'Support portal', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'last4', includeInPrint: true, includeInReadableExport: true });
    expect(record.ownerBusinessId).toBe('person-1');
    expect(record).not.toHaveProperty('password');
    expect(record).not.toHaveProperty('apiKey');
    expect(record).not.toHaveProperty('reviewed');
  });

  it('accepts Unknown facts', () => {
    expect(() => aiOnlineServiceSchema.parse({ id: 'service', schemaVersion: 1, createdAt: 'now', updatedAt: 'now', service: 'Unknown', ownerBusinessId: 'person-1', purpose: 'Unknown', accountIdentifier: 'Unknown', billingFrequency: 'Unknown', paymentSource: 'Unknown', storedDataProjects: 'Unknown', credentialLocation: 'Unknown', desiredHandling: 'Unknown', contact: 'Unknown', supportingDocumentLocation: '', primaryContact: '', preparerNotes: '', notes: '', printPolicy: 'hidden', includeInPrint: true, includeInReadableExport: true })).not.toThrow();
  });
});
