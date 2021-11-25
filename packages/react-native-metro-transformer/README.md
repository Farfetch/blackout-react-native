# @farfetch/blackout-react-native-metro-transformer

Custom transformer for `metro` to be used by FPS react-native apps.

Imported `package.json` files will have all their fields removed from the bundle, except for the `name` and `version` fields. This reduces final bundle size.

## Installation

**yarn**

```sh
yarn add @farfetch/blackout-react-native-metro-transformer
```

**npm**

```sh
npm i @farfetch/blackout-react-native-metro-transformer
```

## Usage

> This was tested for `metro` versions 0.59 and higher but it is possible that it works in lower versions of `metro` if they support the `transformerPath` configuration key in `metro.config.js`.
> Make sure the version of `metro` you are using satisfies this constraint.

Configure the transformer for your app:

- Create a `metro.config.js` file in the root directory of your react-native project.
- Edit the file to include a `transformerPath` pointing to this module.
  ```js
  module.exports = {
    transformerPath: require.resolve(
      '@farfetch/blackout-react-native-metro-transformer',
    ),
  };
  ```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Please read the [CONTRIBUTING](../../CONTRIBUTING.md) file to know what we expect from your contribution and the guidelines you should follow.

## License

[MIT](../../LICENSE) @ Farfetch
