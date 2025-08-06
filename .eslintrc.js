/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['next', 'next/core-web-vitals', 'eslint:recommended'],
  rules: {
    // ✅ Allow `any` type
    '@typescript-eslint/no-explicit-any': 'off',

    // ✅ Only warn on unused variables instead of blocking the build
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
