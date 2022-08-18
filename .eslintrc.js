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
      "linebreak-style": 0,
"global-require": 0,
"eslint linebreak-style": [0, "error", "windows"],
"no-else-return": "error",
    "no-multi-spaces": "error",
    "no-whitespace-before-property": "error",
    "camelcase": "error",
    "new-cap": "error",
    "no-console": "error",
    "comma-dangle": "error",
    "no-var": "error",
    "indent": "off",
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ]
    }
  };