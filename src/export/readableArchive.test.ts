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

  it('escapes active markup and keeps generated paths safe', async () => {
    const document = buildBinderDocument(
      { start: '<Start & [details]>' },
      { identifier: 'last4', balances: 'omit', letters: true, medical: true, digital: true },
      { cover: false },
      { start: ['<script>alert("x")</script> *private* `text`'] },
    );
    const blob = await exportReadableArchive(document, 'en', 'Family <record>');
    const zip = await JSZip.loadAsync(blob);
    const htmlName = Object.keys(zip.files).find((name) => name.endsWith('/html/01-start.html'));
    const markdownName = Object.keys(zip.files).find((name) => name.endsWith('/markdown/01-start.md'));
    expect(htmlName).toBeDefined();
    expect(markdownName).toBeDefined();
    const html = await zip.file(htmlName!)!.async('string');
    const markdown = await zip.file(markdownName!)!.async('string');
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(markdown).toContain('\\*private\\*');
    expect(markdown).toContain('\\`text\\`');
    expect(Object.keys(zip.files).every((name) => !name.includes('..'))).toBe(true);
  });

  it('exports canonical page breaks to HTML and Markdown', async () => {
    const document = buildBinderDocument({}, { identifier: 'last4', balances: 'omit', letters: true, medical: true, digital: true }, {}, { start: ['first page', '[PAGE_BREAK]', 'second page'] });
    const zip = await JSZip.loadAsync(await exportReadableArchive(document, 'en'));
    const htmlName = Object.keys(zip.files).find((name) => name.endsWith('/html/02-start.html'))!;
    const markdownName = Object.keys(zip.files).find((name) => name.endsWith('/markdown/02-start.md'))!;
    expect(await zip.file(htmlName)!.async('string')).toContain('class="page-break"');
    expect(await zip.file(markdownName)!.async('string')).toContain('\\pagebreak');
  });
});
