import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  { ignores: ['dist', 'coverage'] },
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      globals: { atob: 'readonly', btoa: 'readonly', BufferSource: 'readonly', CryptoKey: 'readonly', crypto: 'readonly', document: 'readonly', DOMException: 'readonly', TextDecoder: 'readonly', TextEncoder: 'readonly', window: 'readonly' },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: tsPlugin.configs.recommended.rules,
  },
];
