/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // ...tu config actual (next, typescript-eslint, react, etc.)
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
