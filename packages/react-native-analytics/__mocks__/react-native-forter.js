export const forterSDK = {
  getDeviceUniqueID: jest.fn(),
  init: jest.fn((siteId, mobileUid, successCallback) => {
    successCallback();
  }),
  setAccountIdentifier: jest.fn(),
  trackNavigation: jest.fn(),
  trackNavigationWithExtraData: jest.fn(),
  trackActionWithJSON: jest.fn(),
  trackAction: jest.fn(),
};

export const ForterNavigationType = {
  PRODUCT: 'PRODUCT',
  ACCOUNT: 'ACCOUNT',
  SEARCH: 'SEARCH',
  CHECKOUT: 'CHECKOUT',
  CART: 'CART',
  HELP: 'HELP',
  APP: 'APP',
};

export const ForterActionType = {
  TAP: 'TAP',
  CLIPBOARD: 'CLIPBOARD',
  TYPING: 'TYPING',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  ACCEPTED_PROMOTION: 'ACCEPTED_PROMOTION',
  ACCEPTED_TOS: 'ACCEPTED_TOS',
  ACCOUNT_LOGIN: 'ACCOUNT_LOGIN',
  ACCOUNT_LOGOUT: 'ACCOUNT_LOGOUT',
  ACCOUNT_ID_ADDED: 'ACCOUNT_ID_ADDED',
  PAYMENT_INFO: 'PAYMENT_INFO',
  SHARE: 'SHARE',
  CONFIGURATION_UPDATE: 'CONFIGURATION_UPDATE',
  APP_ACTIVE: 'APP_ACTIVE',
  APP_PAUSE: 'APP_PAUSE',
  RATE: 'RATE',
  IS_JAILBROKEN: 'IS_JAILBROKEN',
  SEARCH_QUERY: 'SEARCH_QUERY',
  REFERRER: 'REFERRER',
  WEBVIEW_TOKEN: 'WEBVIEW_TOKEN',
  OTHER: 'OTHER',
};

export const ForterAccountType = {
  MERCHANT: 'MERCHANT',
  FACEBOOK: 'FACEBOOK',
  GOOGLE: 'GOOGLE',
  TWITTER: 'TWITTER',
  APPLE_IDFA: 'APPLE_IDFA',
  OTHER: 'OTHER',
};
