module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false },
    ],
  },
  overrides: [
    {
      files: ['jest/**/*.js'],
      env: {
        jest: true,
      },
    },
  ],
};
