export type BinderBlock = {
  type:
    | 'heading'
    | 'paragraph'
    | 'definitionList'
    | 'table'
    | 'checklist'
    | 'pageBreak'
    | 'letter'
    | 'warning'
    | 'contactCard';
  [key: string]: unknown;
};
export type BinderSection = {
  id: string;
  title: string;
  optional?: boolean;
  blocks: BinderBlock[];
};
export type BinderDocument = {
  metadata: {
    generatedAt: string;
    schemaVersion: number;
    choices: BinderChoices;
  };
  sections: BinderSection[];
};
export type BinderChoices = {
  identifier: 'full' | 'last4' | 'hidden';
  balances: 'include' | 'range' | 'omit';
  letters: boolean;
  medical: boolean;
  digital: boolean;
};
export const DEFAULT_BINDER_ORDER = [
  'cover',
  'notice',
  'start',
  'incapacity',
  'deathCertificates',
  'first72',
  'doNot',
  'notify',
  'household',
  'legal',
  'insurance',
  'banking',
  'investments',
  'debts',
  'obligations',
  'employment',
  'property',
  'vehicles',
  'valuables',
  'business',
  'digital',
  'dependents',
  'pets',
  'routines',
  'tax',
  'wishes',
  'letters',
  'locations',
  'contacts',
  'review',
] as const;
export function buildBinderDocument(
  sectionTitles: Record<string, string>,
  choices: BinderChoices,
  optional: Record<string, boolean> = {},
  sectionContent: Record<string, string[]> = {},
): BinderDocument {
  const sections = DEFAULT_BINDER_ORDER.filter(
    (id) =>
      optional[id] !== false &&
      (id !== 'letters' || choices.letters) &&
      (id !== 'digital' || choices.digital),
  ).map((id) => ({
    id,
    title: sectionTitles[id] ?? id,
    optional: optional[id],
    blocks: [
      {
        type:
          id === 'cover'
            ? 'heading'
            : id === 'notice'
              ? 'warning'
              : 'paragraph',
        text: sectionTitles[id] ?? id,
      },
      ...(sectionContent[id] ?? []).map((text) => text === '[PAGE_BREAK]'
        ? { type: 'pageBreak' as const }
        : { type: 'paragraph' as const, text }),
    ] as BinderBlock[],
  }));
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      schemaVersion: 1,
      choices,
    },
    sections,
  };
}
