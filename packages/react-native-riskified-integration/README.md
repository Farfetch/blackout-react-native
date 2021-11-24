# @farfetch/blackout-react-native-riskified-integration

Riskified integration for @farfetch/blackout-react-native-analytics.

## Installation

**yarn**

```sh
yarn add @farfetch/blackout-react-native-riskified-integration
```

**npm**

```sh
npm i @farfetch/blackout-react-native-riskified-integration
```

### Peer dependencies

Make sure that you have installed the correct Farfetch's peer dependencies:

- [`@farfetch/blackout-react-native-analytics`](https://www.npmjs.com/package/@farfetch/blackout-react-native-analytics)
- [`@farfetch/blackout-core`](https://www.npmjs.com/package/@farfetch/blackout-core)

### Autolinking

Due to a [bug](https://github.com/react-native-community/cli/issues/938) on the `@react-native-community/cli` package, you will need to add a `react-native.config.js` file to the root of your react native project and declare the `packageName` for `android` project there, so that the cli can detect the correct package name for compilation:

```javascript
// react-native.config.js
module.exports = {
  project: {
    android: {
      packageName: 'package name of your android app',
    },
  },
};
```

## Usage

You will need to add the `Omnitracking` integration from `@farfetch/blackout-react-native-analytics` to your analytics instance.

```javascript
import analytics, {
  integrations,
} from '@farfetch/blackout-react-native-analytics';
import Riskified from '@farfetch/blackout-react-native-riskified-integration';

// Add the integration to analytics instance
analytics.addIntegration('riskified', Riskified, {
  shopName: 'my shop name', // Required: The name of your Riskified account.
  token: '00000000-aaaa-0000-aaaa-000000000000', // Optional: The associated session token
  // A valid entry must exist in either `eventsToLog` or `screensToLog` options in order to the integration be correctly configured
  eventsToLog: {
    [eventTypes.PRODUCT_VIEWED]:
      'URL that will be logged when a PRODUCT_VIEWED event is tracked in analytics',
  },
  screensToLog: {
    [screenTypes.HOMEPAGE]:
      'URL that will be logged when the HOMEPAGE screen is tracked in analytics',
  },
});

// Add `Omnitracking` integration is required for this integration to work correctly
analytics.addIntegration('omnitracking', integrations.Omnitracking);
```

### Options

| Option name    | Type   | Required | Description                                                                                                                               |
| -------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `shopName`     | string | yes      | The name of your Riskified account.                                                                                                       |
| `token`        | string | no       | A unique identifier that is generated for the user’s current browsing session. If not provided, then `user.localId` will be used instead. |
| `eventsToLog`  | object | yes¹     | An object that contains a map of an event type to a URL string                                                                            |
| `screensToLog` | object | yes¹     | An object that contains a map of a screen type to a URL string                                                                            |

¹ - Either eventsToLog or screensToLog must be passed with an object containing at least one entry.

### Session token

If you provide a session token through the `token` option, make sure you are using the same token in `Omnitracking` integration through the `correlationId` context value so that order data that is sent to Riskified service contain the same session identifier in its `cart_token` property.
If no session token is provided, `user.localId` is used instead and this value will be the same value that will be used in `Omnitracking` integration's `correlationId` field.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Please read the [CONTRIBUTING](../../CONTRIBUTING) file to know what we expect from your contribution and the guidelines you should follow.

## License

[MIT](../../LICENSE) @ Farfetch
