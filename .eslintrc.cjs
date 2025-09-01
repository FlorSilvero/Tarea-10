// .eslintrc.cjs
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Reglas globales (acá podés personalizar si querés)
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off', // opcional si usás //@ts-ignore
      },
    },
  ],
};
