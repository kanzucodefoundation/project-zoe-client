module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
    },
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      'airbnb-base',
      'airbnb-typescript',
    ],
    ignorePatterns: ['.eslintrc.js'],
    rules: {
      "react/jsx-filename-extension": 'off'
    }
  };