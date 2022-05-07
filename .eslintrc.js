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
    rules: {
        "@typescript-eslint/quotes": [
            "error",
            "single",
            {
            "avoidEscape": true,
            "allowTemplateLiterals": true
            }
        ]
    }
  };