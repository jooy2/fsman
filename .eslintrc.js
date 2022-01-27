module.exports = {
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: {
    node: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb/base',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'linebreak-style': ['error', 'windows'],
    'arrow-parens': 0,
  },
  overrides: [
    {
      files: ['test/*.spec.js'],
      rules: {
        'no-undef': 0,
      },
    },
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.js'],
    },
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.ts'],
      },
    },
  },
};
