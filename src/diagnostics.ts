/* global navigator */
import { APP_VERSION, DATA_SCHEMA_VERSION, VAULT_FORMAT_VERSION } from './constants';

export function buildDiagnosticInfo(includeEnvironment = false) {
  const info: Record<string, string | number> = { appVersion: APP_VERSION, dataSchemaVersion: DATA_SCHEMA_VERSION, vaultFormatVersion: VAULT_FORMAT_VERSION, backupFormatVersion: 1 };
  if (includeEnvironment) {
    info.browser = navigator.userAgent;
    info.osFamily = navigator.platform;
  }
  return Object.entries(info).map(([key, value]) => `${key}: ${value}`).join('\n');
}
