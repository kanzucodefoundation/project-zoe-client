module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'airbnb-base',
    'airbnb-typescript',
  ],
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'react/jsx-filename-extension': 'off',
    'no-unused-vars': 'off',
    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': 'error',
    'linebreak-style': ['error', 'windows'],
    'max-len': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};
