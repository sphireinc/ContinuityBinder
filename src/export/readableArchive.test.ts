import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { buildBinderDocument } from '../rendering/binderDocument';
import { exportReadableArchive } from './readableArchive';

describe('readable archive export', () => {
  it('creates an offline ZIP with sanitized HTML, Markdown, and manifest files', async () => {
    const document = buildBinderDocument({ start: '<Start/>' }, { identifier: 'last4', balances: 'omit', letters: true, medical: true, digital: true });
    const blob = await exportReadableArchive(document, 'en', 'Household/../name');
    const zip = await JSZip.loadAsync(blob);
    const names = Object.keys(zip.files);
    expect(names.some((name) => name.endsWith('/index.html'))).toBe(true);
    expect(names.some((name) => name.endsWith('/manifest.json'))).toBe(true);
    expect(names.some((name) => name.includes('..'))).toBe(false);
    const index = await zip.file(names.find((name) => name.endsWith('/index.html'))!)!.async('string');
    expect(index).toContain('Household/../name');
    expect(index).not.toContain('https://');
    expect(index).toContain('Privacy warning');
  });
});
