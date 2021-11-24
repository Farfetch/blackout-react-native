module.exports = {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['./packages/**/src/**/*.{js,jsx}'],
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/', '__tests__/'],
  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@farfetch/blackout-core(.*)$': '@farfetch/blackout-core/src$1',
  },
  // A preset that is used as a base for Jest's configuration
  preset: 'react-native',
  // The regexp pattern or array of patterns that Jest uses to detect test files
  testRegex: '.+\\.test.js$',
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-navigation|@react-navigation|@react-native-community|@farfetch|@react-native-firebase/*))',
  ],
};
