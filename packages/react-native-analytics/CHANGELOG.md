# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.9.0](https://github.com/Farfetch/blackout-react-native/compare/@farfetch/blackout-react-native-analytics@0.8.0...@farfetch/blackout-react-native-analytics@0.9.0) (2022-06-22)

### Features

- **react-native-analytics:** update firebase mappings ([e2f6814](https://github.com/Farfetch/blackout-react-native/commit/e2f68146a735ca9b3637c7d46e5dd85c7df99729))

### BREAKING CHANGES

- **react-native-analytics:** Now all integrations will use the same events API
  that is being used by web applications. This means it is now possible
  to use the bag and wishlist redux middlewares as they will
  now be compatible with this implementation.
  Also, AnalyticsService integration was removed as it
  will not be supported in the future.

# [0.8.0](https://github.com/Farfetch/blackout-react-native/compare/@farfetch/blackout-react-native-analytics@0.7.0...@farfetch/blackout-react-native-analytics@0.8.0) (2022-04-13)

### Features

- **react-native-analytics:** update Castle.io version ([431e5bf](https://github.com/Farfetch/blackout-react-native/commit/431e5bf7bb602edf8faa2763321fa4053dc9ec93))

# [0.7.0](https://github.com/Farfetch/blackout-react-native/compare/@farfetch/blackout-react-native-analytics@0.6.3...@farfetch/blackout-react-native-analytics@0.7.0) (2022-02-25)

### Features

- **react-native-analytics:** add react-native castle.io integration ([b76d92c](https://github.com/Farfetch/blackout-react-native/commit/b76d92c8fbb279860d96144766ac6d101aae6609))

## [0.6.3](https://github.com/Farfetch/blackout-react-native/compare/@farfetch/blackout-react-native-analytics@0.6.2...@farfetch/blackout-react-native-analytics@0.6.3) (2022-02-22)

### Bug Fixes

- fix android crash and update async-storage package ([c7e14cb](https://github.com/Farfetch/blackout-react-native/commit/c7e14cb0c3f881dc3149cd75398bfc48886e78c8))

## [0.6.2](https://github.com/Farfetch/blackout-react-native/compare/@farfetch/blackout-react-native-analytics@0.6.1...@farfetch/blackout-react-native-analytics@0.6.2) (2021-11-25)

### Bug Fixes

- **react-native-analytics:** fix integration imports ([ae565c7](https://github.com/Farfetch/blackout-react-native/commit/ae565c76ebe6e1441bc706672ce547b6ddbae670))

## [0.6.1](https://github.com/Farfetch/blackout-react-native/compare/@farfetch/blackout-react-native-analytics@0.6.0...@farfetch/blackout-react-native-analytics@0.6.1) (2021-11-25)

**Note:** Version bump only for package @farfetch/blackout-react-native-analytics

# 0.6.0 (2021-11-25)

### Features

- migrate packages ([5a64fc5](https://github.com/Farfetch/blackout-react-native/commit/5a64fc58cb5f9cbdf600100f1c6315fa30889845))
