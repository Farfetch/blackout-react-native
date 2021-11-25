# @farfetch/blackout-react-native-analytics

Analytics solution for react-native apps

## Installation

**yarn**

```sh
yarn add @farfetch/blackout-react-native-analytics
```

**npm**

```sh
npm i @farfetch/blackout-react-native-analytics
```

### Peer dependencies

Make sure that you have installed the correct Farfetch's peer dependencies:

- [`@farfetch/blackout-core`](https://www.npmjs.com/package/@farfetch/blackout-core)

## Usage

Set the storage in analytics by calling `analytics.setStorage` with an instance that support the `getItem(key)`, `setItem(key, value)` and `removeItem(key)` methods:

```js
import analytics from '@farfetch/blackout-react-native-analytics';

// `AsyncStorage` implements `getItem(key)`, `setItem(key, value)` and `removeItem(key)` used by analytics.
// `Analytics` will await these calls if they are async.
import AsyncStorage from '@react-native-community/async-storage';

analytics.setStorage(AsyncStorage);
```

Add integrations to analytics that will enable your tracking information to be sent to other providers.
There are some integrations that are provided by this package and are ready to be used:

```js
import analytics, {
  integrations,
} from '@farfetch/blackout-react-native-analytics';

// This will add the `Omnitracking` integration to analytics that will
// enable your tracking data to be sent to the `Omnitracking` service.
analytics.addIntegration('omnitracking', integrations.Omnitracking);
```

Add contexts that are required by the integrations. There are some contexts that are provided by this package and are ready to be used:

```js
import analytics, { contexts } from '@farfetch/blackout-react-native-analytics';

// This context will add a GUID to the storage that will persist while the app is installed on the device.
// This GUID will be available to all integrations configured on the `context.app.clientInstallId` key of the event payload.
analytics.useContext(contexts.getClientInstallIdContext());
```

Call the `analytics.ready` method after finishing analytics configuration:

```js
// `ready` returns a promise that can be awaited if you need to wait until the method finishes.
await analytics.ready();
```

After this point you can start using the methods `analytics.screen` and `analytics.track` to register screen views and events respectively with analytics:

```js
import {
  eventTypes,
  screenTypes,
} from '@farfetch/blackout-react-native-analytics';

// Tracks a screen view. You can send additional properties to the events that will be available to use by all integrations.
analytics.screen(screenTypes.PRODUCT_DETAILS, { productId: 100000 });

// Tracks an event. You can send additional properties to the events that will be available to use by all integrations.
analytics.track(eventTypes.PRODUCT_VIEWED, {
  cartId: '787f1f77b87453d799430941',
  id: '507f1f77bcf86cd799439011',
  sku: 'G-32',
  category: 'Clothing/Tops/T-shirts',
  name: 'Gareth McConnell Dreamscape T-Shirt',
  brand: 'Just A T-Shirt',
  variant: 'Black',
  size: 'L',
  price: 18.99,
  quantity: 1,
  currency: 'USD',
});
```

Lastly, you will need to make sure that a user is set in analytics by calling the `analytics.setUser` in order for your previous `analytics.track` or `analytics.screen` to be dispatched to the integrations.
Analytics needs a user to be set in order to be able to associate a user to these events.

```js
// `setUser` returns a promise that can be awaited if you need to wait until the method finishes.
await analytics.setUser(680968743, {
  username: 'George',
  email: 'george@company.com',
  isGuest: false,
  membership: [],
  segments: [],
  gender: 1,
  bagId: '1ff36cd1-0dac-497f-8f32-4f2f7bdd2eaf',
});
```

### Consent

Some integrations need consent from the user to be loaded by analytics.
To manage the consent in analytics, you can use the `analytics.setConsent` method.
This method accepts an object with the keys `statistics`, `preferences` and `marketing` whose values indicate the consent the user has given to each category.

```js
// User has given consent to marketing and statistics tracking and not preferences.
await analytics.setConsent({
  marketing: true,
  statistics: true,
  preferences: false,
});
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Please read the [CONTRIBUTING](../../CONTRIBUTING.md) file to know what we expect from your contribution and the guidelines you should follow.

## License

[MIT](../../LICENSE) @ Farfetch
