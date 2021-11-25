# Blackout-react-native

[![Pipeline](https://github.com/Farfetch/blackout-react-native/actions/workflows/CI.yml/badge.svg)](https://github.com/Farfetch/blackout-react-native/actions/workflows/CI.yml)
[![MIT License](https://img.shields.io/apm/l/atomic-design-ui)](https://github.com/Farfetch/blackout-react-native/blob/main/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/Farfetch/blackout)](https://github.com/Farfetch/blackout-react-native/graphs/commit-activity)

Blackout-react-native is the codename for the Farfetch Platform Solutions (FPS) react-native projects. It's a monorepo with Yarn workspaces and Lerna.

Useful to build e-commerce native apps using the FPS APIs and integrating business logic.

## What's inside

Each package has its own `package.json` file and defines its dependencies, having full autonomy to publish a new version into the registry when needed.

[**@farfetch/blackout-react-native-analytics**](packages/react-native-analytics)

- Analytics solution for react-native apps
- Depends on [`@farfetch/blackout-core`](https://www.npmjs.com/package/@farfetch/blackout-core)

[**@farfetch/blackout-react-native-metro-transformer**](packages/react-native-metro-transformer)

- Custom transformer for `metro` to be used by FPS react-native apps

[**@farfetch/blackout-react-native-riskified-integration**](packages/react-native-riskified-integration)

- Riskified integration for @farfetch/blackout-react-native-analytics
- Depends on
  - [`@farfetch/blackout-core`](https://www.npmjs.com/package/@farfetch/blackout-core)
  - [`@farfetch/blackout-react-native-analytics`](https://www.npmjs.com/package/@farfetch/blackout-react-native-analytics)

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Please read the [CONTRIBUTING](CONTRIBUTING.md) file to know what we expect from your contribution and the guidelines you should follow.

## About

Blackout-react-native is a project maintained by some awesome [contributors](https://github.com/Farfetch/blackout-react-native/graphs/contributors) from [Farfetch Platform Solutions](https://www.farfetchplatformsolutions.com/).

## Maintainers

- [Bruno Oliveira](https://github.com/boliveira)
- [Gabriel Pires](https://github.com/gabrielfmp)
- [Helder Burato Berto](https://github.com/helderburato)
- [Nelson Leite](https://github.com/nelsonleite)
- [Pedro Barreiro](https://github.com/pedro-gbf)

## License

[MIT](LICENSE) @ Farfetch
