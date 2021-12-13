# @farfetch/blackout-react-native-payments

Payments solutions for react-native apps

## Installation

**yarn**

```sh
yarn add @farfetch/blackout-react-native-payments
```

**npm**

```sh
npm i @farfetch/blackout-react-native-payments
```

### Peer dependencies

Make sure that you have installed the correct peer dependencies of this package:

- [`@farfetch/blackout-react`](https://www.npmjs.com/package/@farfetch/blackout-react)
- [`react-native-webview`](https://www.npmjs.com/package/react-native-webview)

## Usage

```js
import {
  CreditCard,
  creditCardinitialState,
  creditCardreducer,
  OPERATION_TYPE,
} from '@farfetch/blackout-react-native-payments';
// ...
// ... other imports
// ...

const FOLDER_NAME = '';
const LOCALE = '';
const STATIC_NAME = '';
const PAYMENT_GATEWAY_URL = '';

const OPERATION = JSON.stringify({
  action: OPERATION_TYPE.ADD_CREDIT_CARD_INSTRUMENT,
});

const CREATE_INSTRUMENT_JS = `window.postMessage(${OPERATION}, "${PAYMENT_GATEWAY_URL}")`;

const Checkout: React.FC = () => {
  const webViewRef = useRef();

  const [creditCardState, creditCardDispatch] = useReducer(
    creditCardreducer,
    creditCardinitialState,
  );

  const handleCharge = (): void => {
    if (creditCardState.isFormValid) {
      webViewRef.current?.injectJavaScript(CREATE_INSTRUMENT_JS);
    }
  };

  return (
      <CreditCard
        additionalProperies={{
          folderName: FOLDER_NAME,
          locale: LOCALE,
          staticName: STATIC_NAME,
          url: PAYMENT_GATEWAY_URL,
        }}
        creditCardDispatch={creditCardDispatch}
        paymentIntentId={checkoutOrder.paymentIntentId}
        webViewRef={webViewRef}
      />
      <S.ButtonView>
        <Button fullwidth primary onPress={handleCharge}>
          submit
        </Button>
      </S.ButtonView>
    </S.ViewContainer>
  );
};
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Please read the [CONTRIBUTING](../../CONTRIBUTING.md) file to know what we expect from your contribution and the guidelines you should follow.

## License

[MIT](../../LICENSE) @ Farfetch
