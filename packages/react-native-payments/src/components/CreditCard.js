import { OPERATION_SOURCE, OPERATION_TYPE } from './constants';
import { useAuthentication } from '@farfetch/blackout-react/authentication/hooks';
import { WebView } from 'react-native-webview';
import React, { useCallback, useMemo } from 'react';

const ADD_LISTENER_JS =
  "window.addEventListener('message', listener => { window.ReactNativeWebView.postMessage(JSON.stringify(listener.data)); });";

const CreditCard = ({
  additionalProperies,
  creditCardDispatch,
  paymentIntentId,
  webViewRef,
}) => {
  const {
    activeTokenData: {
      data: { accessToken },
    },
  } = useAuthentication();
  const webViewSource = useMemo(
    () => ({
      uri: `${additionalProperies?.url}?paymentIntentId=${paymentIntentId}&staticName=${additionalProperies?.staticName}&folderName=${additionalProperies?.folderName}&locale=${additionalProperies?.locale}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Referer: 'http://dev.blackandwhite-ff.com', // TODO - For testing purpuses only
      },
    }),
    [accessToken, additionalProperies, paymentIntentId],
  );
  const updateStateWithOperationResult = useCallback(
    event => {
      const data = JSON.parse(event?.nativeEvent?.data);
      const source = data?.source;

      if (source !== OPERATION_SOURCE) {
        return;
      }

      const operation = data?.operation;

      if (operation === OPERATION_TYPE.VALIDATION) {
        creditCardDispatch({ isFormValid: data?.isFormValid });
      }

      const payload = data?.payload;
      const payloadStatus = payload?.info?.status;
      const payloadData = payload?.data;
      const paymentData = payloadData?.paymentData;

      if (operation === OPERATION_TYPE.ADD_CREDIT_CARD_INSTRUMENT) {
        if (payloadStatus && payloadData) {
          const instrumentId = JSON.parse(paymentData)?.createdAt.match(
            'instruments/(.*)',
          )[1];

          creditCardDispatch({
            instrumentId: instrumentId,
            instrumentAdded: true,
          });
        }
      }
    },
    [creditCardDispatch],
  );
  const attachEventListener = useCallback(() => {
    webViewRef.current?.injectJavaScript(ADD_LISTENER_JS);
  }, [webViewRef]);

  return (
    <WebView
      onLoad={attachEventListener}
      onMessage={updateStateWithOperationResult}
      originWhitelist={['*']}
      ref={webViewRef}
      startInLoadingState
      source={webViewSource}
    />
  );
};

export default CreditCard;
