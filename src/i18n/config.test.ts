import { describe, expect, it } from 'vitest';
import { resources } from './config';

const keys = (value: object) => Object.keys(value).sort();

describe('i18n resources', () => {
  it('keeps English and Spanish namespaces structurally aligned', () => {
    expect(Object.keys(resources.en).sort()).toEqual(Object.keys(resources.es).sort());
    for (const namespace of Object.keys(resources.en) as Array<keyof typeof resources.en>) {
      expect(keys(resources.en[namespace])).toEqual(keys(resources.es[namespace]));
    }
  });

  it('keeps translation keys semantic rather than sentence-shaped', () => {
    for (const namespace of Object.values(resources.en)) {
      expect(Object.keys(namespace).every((key) => /^[a-z][A-Za-z0-9]*$/.test(key))).toBe(true);
    }
  });
});
