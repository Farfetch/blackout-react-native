/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { CreditCard } from '../';

jest.mock('react-native-webview');

jest.mock('@farfetch/blackout-react/authentication/hooks', () => ({
  useAuthentication: () => ({
    activeTokenData: {
      data: { accessToken: 'mock_guid' },
    },
  }),
}));

describe('CreditCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDispatch = jest.fn();

  const props = {
    additionalProperies: {
      url: 'mockurl',
      staticName: 'whitelabel',
      folderName: 'pg-12',
      locale: 'en-PT',
    },
    creditCardDispatch: mockDispatch,
    paymentIntentId: '48f9cd72-7fcb-42e6-b610-b870ec5343ec',
    webViewRef: () => ({ current: { injectJavaScript: jest.fn() } }),
  };

  it('should render the WebView with a correct source url', () => {
    const { toJSON } = render(<CreditCard {...props} />);

    expect(toJSON()).toMatchSnapshot();
  });

  it('should call dispatch', () => {
    render(<CreditCard {...props} />);

    expect(mockDispatch).toHaveBeenCalledWith({
      instrumentAdded: true,
      instrumentId: '48f9cd72-7fcb-42e6-b610-b870ec5343ec',
    });
  });
});
