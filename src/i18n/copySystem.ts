export type SectionCopy = { title: string; purpose: string; caution?: string; emptyState: string; addAction: string; reviewPrompt: string; exportHeading: string };

const purposes: Record<string, string> = {
  household: 'Record the people, places, and jurisdictional details your household may need to carry forward.',
  immediate: 'Set out the first practical steps after a death and the actions that should wait.',
  contacts: 'Record who should be contacted, why, and where their current contact details are kept.',
  legal: 'Record where signed legal originals and copies are kept and who should be contacted about them.',
  insurance: 'Record coverage, beneficiary information, and where policy documents can be found.',
  finance: 'Record accounts and access references without putting unnecessary sensitive identifiers in print.',
  debts: 'Record debts and recurring obligations so essential payments are not missed.',
  property: 'Record ownership, document locations, maintenance, and access references for property.',
  business: 'Record employment and business continuity details that depend on a person or organization.',
  digital: 'Record digital services, devices, recovery references, and the location of credentials.',
  care: 'Record care routines, important contacts, and continuity references for dependents and pets.',
  tax: 'Record tax documents, retention notes, and the location of records to preserve.',
  wishes: 'Record personal wishes and legacy notes without treating them as legal instruments.',
  review: 'Show what has been reviewed, what changed, and which gaps still need attention.',
  rendering: 'Assemble the canonical binder view for review and paper-first output.',
  export: 'Prepare a readable archive only when you understand that its contents are no longer encrypted.',
  backup: 'Create and validate an encrypted backup that can be restored with its passphrase.',
};

export const sectionCopy: Record<string, SectionCopy> = Object.fromEntries(Object.entries(purposes).map(([key, purpose]) => [key, {
  title: key,
  purpose,
  caution: key === 'legal' || key === 'wishes' ? 'This record does not create or replace a legal instrument.' : undefined,
  emptyState: `No ${key} records have been added yet.`,
  addAction: `Add ${key} record`,
  reviewPrompt: `Review the ${key} information for accuracy and changes.`,
  exportHeading: key,
}])) as Record<string, SectionCopy>;

export const sensitiveIdentifierPrompt = 'Optional. A full identifier may help your family distinguish accounts, but it also makes printed and readable exports more sensitive. You can choose to print only the last four characters.';
export const saveLanguage = ['Saved locally', 'Last saved on this device', 'Encrypted backup created'] as const;
export const prohibitedSaveLanguage = ['Synced', 'Uploaded', 'Saved to your account'] as const;
export const deathLanguage = ['After a death', 'if [name] dies'] as const;
