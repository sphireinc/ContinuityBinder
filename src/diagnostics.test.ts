import { describe, expect, it } from 'vitest';
import { buildDiagnosticInfo } from './diagnostics';

describe('diagnostic info', () => {
  it('contains only version metadata by default', () => {
    const info = buildDiagnosticInfo();
    expect(info).toContain('appVersion: 0.1.0');
    expect(info).toContain('dataSchemaVersion: 1');
    expect(info).not.toMatch(/browser|osFamily|entity|household|contact|account/i);
  });

  it('includes environment details only after explicit approval', () => {
    expect(buildDiagnosticInfo(true)).toContain('browser:');
    expect(buildDiagnosticInfo(true)).toContain('osFamily:');
  });
});
