import React from 'react';

export const WebView = props => {
  const event = {
    nativeEvent: {
      data:
        '{"source":"payment-gateway","operation":"add-creditCard-instrument","payload":{"data":{"paymentData":"{\\"createdAt\\":\\"/payment/v1/intents/055608ad-16f0-431c-8e6c-63be05956514/instruments/48f9cd72-7fcb-42e6-b610-b870ec5343ec\\"}"},"info":{"status":1}}}',
    },
  };

  if (props.onMessage) {
    props.onMessage(event);
  }

  if (props.onLoad) {
    props.onLoad();
  }

  return <div>{props.source.uri}</div>;
};
