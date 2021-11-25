import {
  forterSDK,
  ForterAccountType,
  ForterActionType,
  ForterNavigationType,
} from 'react-native-forter';

import merge from 'lodash/merge';
import Forter from '../Forter';

import {
  FORTER_TOKEN_ID,
  OPTION_ACTION_EVENT_HANDLERS,
  OPTION_NAVIGATION_EVENT_HANDLERS,
  OPTION_ON_SET_USER_HANDLER,
  OPTION_ORIGIN,
  OPTION_SITE_ID,
} from '../constants';

import { postTrackings } from '@farfetch/blackout-core/analytics/integrations/Omnitracking/client';
import { trackTypes, utils } from '@farfetch/blackout-core/analytics';

import screenTypes from '../../../screenTypes';

import generateAnalyticsEventData from '../../__fixtures__/generateAnalyticsEventData.fixtures';
import eventTypes from '../../../eventTypes';

utils.logger.error = jest.fn();
utils.logger.warn = jest.fn();
utils.logger.info = jest.fn();

const mockSiteId = 'c3f674e6511e';
const mockOrigin = 'Browns Native App';
const mockDeviceId = '813582D1-60CD-4698-B5D5-F35F226BE74C';

jest.mock(
  '@farfetch/blackout-core/analytics/integrations/Omnitracking/client',
  () => ({
    postTrackings: jest.fn(async () => {
      return await Promise.resolve();
    }),
  }),
);

forterSDK.getDeviceUniqueID.mockImplementation(callback =>
  callback(mockDeviceId),
);

const defaultOptions = {
  [OPTION_SITE_ID]: mockSiteId,
  [OPTION_ORIGIN]: mockOrigin,
};

describe('Forter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultCreateEventMock = function (trackType, event, properties) {
    return Promise.resolve(
      generateAnalyticsEventData(trackType, event, properties),
    );
  };

  function createForterInstance(
    options,
    loadEventData = generateAnalyticsEventData(
      'loadIntegration',
      'loadIntegration',
    ),
    createEventMock = defaultCreateEventMock,
  ) {
    const finalOptions = {
      ...defaultOptions,
      ...options,
    };

    return Forter.createInstance(finalOptions, loadEventData, {
      createEvent: createEventMock,
    });
  }

  it('Should return true on its shouldLoad method', () => {
    expect(Forter.shouldLoad()).toBe(true);
  });

  it('Should return an instance of Forter class from its createInstance method', () => {
    expect(
      Forter.createInstance({ [OPTION_SITE_ID]: mockSiteId }),
    ).toBeInstanceOf(Forter);
  });

  it('Should throw an error if "react-native-forter" is not installed', () => {
    jest.resetModules();

    jest.doMock('react-native-forter', () => undefined);

    const FreshForterIntegration = require('../Forter').default;

    expect(() => FreshForterIntegration.createInstance()).toThrow(
      '[Forter]: "react-native-forter" package is not installed. Please, make sure you have this dependency installed before using this integration.',
    );
  });

  describe('Options Validations', () => {
    it(`Should throw an error if '${OPTION_SITE_ID}' is not specified in options`, () => {
      expect(() =>
        createForterInstance({ [OPTION_SITE_ID]: undefined }),
      ).toThrow(
        new Error(
          `[ForterIntegration] - Missing required '${OPTION_SITE_ID}' parameter in options.`,
        ),
      );
    });

    it(`Should log a warn message if '${OPTION_ORIGIN}' is not specified in options`, () => {
      createForterInstance({ [OPTION_ORIGIN]: undefined });

      expect(utils.logger.warn).toHaveBeenCalledWith(
        `[ForterIntegration] - '${OPTION_ORIGIN}' parameter was not provided in options. It's advisable to provide an origin option to aid in debugging`,
      );
    });

    it(`Should log an error message if '${OPTION_ORIGIN}' is not a string`, () => {
      const mockInvalidOrigin = () => {};

      expect(() => {
        createForterInstance({
          [OPTION_ORIGIN]: mockInvalidOrigin,
        });
      }).toThrow(
        new TypeError(
          `[ForterIntegration] - '${OPTION_ORIGIN}' parameter must be a string but received '${typeof mockInvalidOrigin}'`,
        ),
      );
    });

    it(`Should log an error message if '${OPTION_NAVIGATION_EVENT_HANDLERS}' is not an object`, () => {
      const mockInvalidNavigationEventHandlers = () => {};

      expect(() => {
        createForterInstance({
          [OPTION_NAVIGATION_EVENT_HANDLERS]: mockInvalidNavigationEventHandlers,
        });
      }).toThrow(
        new TypeError(
          `[ForterIntegration] - '${OPTION_NAVIGATION_EVENT_HANDLERS}' parameter must be an object but received '${typeof mockInvalidNavigationEventHandlers}'`,
        ),
      );
    });

    it(`Should log an error message if '${OPTION_ACTION_EVENT_HANDLERS}' is not an object`, () => {
      const mockInvalidActionEventHandlers = () => {};

      expect(() => {
        createForterInstance({
          [OPTION_ACTION_EVENT_HANDLERS]: mockInvalidActionEventHandlers,
        });
      }).toThrow(
        new TypeError(
          `[ForterIntegration] - '${OPTION_ACTION_EVENT_HANDLERS}' parameter must be an object but received '${typeof mockInvalidActionEventHandlers}'`,
        ),
      );
    });

    it(`Should log an error message if '${OPTION_ON_SET_USER_HANDLER}' is not a function`, () => {
      const mockInvalidOnSetUserHandler = {};

      expect(() => {
        createForterInstance({
          [OPTION_ON_SET_USER_HANDLER]: mockInvalidOnSetUserHandler,
        });
      }).toThrow(
        new TypeError(
          `[ForterIntegration] - '${OPTION_ON_SET_USER_HANDLER}' parameter must be a function but received '${typeof mockInvalidOnSetUserHandler}'`,
        ),
      );
    });
  });

  describe('Behaviour', () => {
    describe('Initialization', () => {
      it('Should call forterSDK.init with the right parameters', () => {
        createForterInstance();

        expect(forterSDK.init).toHaveBeenCalledWith(
          mockSiteId,
          mockDeviceId,
          expect.any(Function),
          expect.any(Function),
        );
      });

      it('Should log an error if the call to forterSDK.init method is not successful', () => {
        const mockErrorMessage = 'Unknown error';

        forterSDK.init.mockImplementationOnce(
          (siteId, mobileUid, successCallback, errorCallback) => {
            errorCallback(mockErrorMessage);
          },
        );

        createForterInstance();

        expect(utils.logger.error).toHaveBeenCalledWith(
          `[ForterIntegration] - forterSDK initialization failed. Error: ${mockErrorMessage}`,
        );
      });
    });

    describe('onSetUser', () => {
      describe('Handle localId changes', () => {
        it('Should post a message to Omnitracking with the device unique id and the new localId', async () => {
          const mockFirstUserEventData = generateAnalyticsEventData(
            'onSetUser',
            'onSetUser',
          );

          const forterInstance = createForterInstance(null, null);

          forterInstance.strippedDownAnalytics = {
            createEvent: async () => mockFirstUserEventData,
          };

          await forterInstance.onSetUser(mockFirstUserEventData);

          expect(postTrackings).toHaveBeenCalledWith(
            expect.objectContaining({
              tenantId: mockFirstUserEventData.context.tenantId,
              clientId: mockFirstUserEventData.context.clientId,
              correlationId: mockFirstUserEventData.user.localId,
              customerId: mockFirstUserEventData.user.id,
              event: 'PageAction',
              parameters: expect.objectContaining({
                clientTimestamp: expect.any(String),
                tid: FORTER_TOKEN_ID,
                uuid: expect.any(String),
                val: JSON.stringify({
                  forterTokenCookie: mockDeviceId,
                  origin: mockOrigin,
                  userAgent: 'React Native - ios',
                }),
              }),
            }),
          );

          const mockSecondUserEventData = generateAnalyticsEventData(
            'onSetUser',
            'onSetUser',
          );

          mockSecondUserEventData.user.localId =
            '2c56bcda6-35ed-84a3-0b7a-052532d3ca87';

          forterInstance.strippedDownAnalytics = {
            createEvent: async () => mockSecondUserEventData,
          };

          await forterInstance.onSetUser(mockSecondUserEventData);

          expect(postTrackings).toHaveBeenCalledWith(
            expect.objectContaining({
              tenantId: mockSecondUserEventData.context.tenantId,
              clientId: mockSecondUserEventData.context.clientId,
              correlationId: mockSecondUserEventData.user.localId,
              customerId: mockSecondUserEventData.user.id,
              event: 'PageAction',
              parameters: expect.objectContaining({
                clientTimestamp: expect.any(String),
                tid: FORTER_TOKEN_ID,
                uuid: expect.any(String),
                val: JSON.stringify({
                  forterTokenCookie: mockDeviceId,
                  origin: mockOrigin,
                  userAgent: 'React Native - ios',
                }),
              }),
            }),
          );
        });

        it('Should log an error if the sending Omnitracking message fails', async () => {
          const mockOnSetUserEventData = generateAnalyticsEventData(
            'onSetUser',
            'onSetUser',
          );

          const mockErrorMessage = 'Unknown error';

          const forterInstance = createForterInstance(null, null);

          postTrackings.mockImplementationOnce(() => {
            return Promise.reject(mockErrorMessage);
          });

          expect(async () => {
            await forterInstance.onSetUser(mockOnSetUserEventData);

            expect(utils.logger.error).toHaveBeenCalledWith(
              `[ForterIntegration] - An error occurred when trying to send forter token to Omnitracking for userId '${mockOnSetUserEventData.user.id}': ${mockErrorMessage}`,
            );
          }).not.toThrow();
        });
      });

      describe('Default handler', () => {
        it('Should call forterSDK.setAccountIdentifier and track a login event with forterSDK if the user has logged in', async () => {
          const forterInstance = createForterInstance(null, null);

          const onSetUserEventData = generateAnalyticsEventData(
            'onSetUser',
            'onSetUser',
          );

          const userId = onSetUserEventData.user.id;
          const localId = onSetUserEventData.user.localId;

          await forterInstance.onSetUser(onSetUserEventData);

          expect(forterSDK.setAccountIdentifier).toHaveBeenCalledWith(
            `${userId}`,
            ForterAccountType.MERCHANT,
          );

          expect(forterSDK.trackActionWithJSON).toHaveBeenCalledWith(
            ForterActionType.ACCOUNT_LOGIN,
            {
              userId,
              localId,
            },
          );
        });

        it('Should call forterSDK.setAccountIdentifier and track a logout event with forterSDK if the user has logged out', async () => {
          const mockNewGuestUserId = '4000005980042772';
          const mockNewLocalId = '2c56bcda6-35ed-84a3-0b7a-052532d3ca87';

          const forterInstance = createForterInstance(null, null);

          const onSetUserEventData = generateAnalyticsEventData(
            'onSetUser',
            'onSetUser',
          );

          //Make sure user is loggedIn
          onSetUserEventData.user.traits.isGuest = false;

          //Call onSetUser with a logged in user
          await forterInstance.onSetUser(onSetUserEventData);

          jest.clearAllMocks();

          const previousUserId = onSetUserEventData.user.id;
          const previousLocalId = onSetUserEventData.user.localId;

          const loggedOutSetUserEventData = merge({}, onSetUserEventData);

          loggedOutSetUserEventData.user.localId = mockNewLocalId;
          loggedOutSetUserEventData.user.id = mockNewGuestUserId;
          loggedOutSetUserEventData.user.traits.isGuest = true;

          //Call onSetUser again now with the user logged out, i.e., as guest
          await forterInstance.onSetUser(loggedOutSetUserEventData);

          expect(forterSDK.setAccountIdentifier).toHaveBeenCalledWith(
            '',
            ForterAccountType.MERCHANT,
          );

          expect(forterSDK.trackActionWithJSON).toHaveBeenCalledWith(
            ForterActionType.ACCOUNT_LOGOUT,
            {
              userId: previousUserId,
              localId: previousLocalId,
            },
          );
        });

        it('Should not call forterSDK.setAccountIdentifier and not track any event with forterSDK if there has not been a login or a logout', async () => {
          const forterInstance = createForterInstance(null, null);

          const onSetUserEventData = generateAnalyticsEventData(
            'onSetUser',
            'onSetUser',
          );

          //Call onSetUser with a logged in user
          await forterInstance.onSetUser(onSetUserEventData);

          jest.clearAllMocks();

          //Call onSetUser again with same data, so there has not been a change
          //in user's logged in status
          await forterInstance.onSetUser(onSetUserEventData);

          expect(forterSDK.setAccountIdentifier).not.toHaveBeenCalled();

          expect(forterSDK.trackActionWithJSON).not.toHaveBeenCalled();
        });
      });

      describe('Custom handler', () => {
        it('Should delegate onSetUser event handling to user specified handler if defined', async () => {
          const onSetUserHandler = jest.fn();

          const forterInstance = createForterInstance(
            {
              [OPTION_ON_SET_USER_HANDLER]: onSetUserHandler,
            },
            null,
          );

          const onSetUserEventData = generateAnalyticsEventData(
            'onSetUser',
            'onSetUser',
          );

          await forterInstance.onSetUser(onSetUserEventData);

          expect(onSetUserHandler).toHaveBeenCalledWith(
            onSetUserEventData,
            forterSDK,
          );

          expect(forterSDK.setAccountIdentifier).not.toHaveBeenCalled();

          expect(forterSDK.trackActionWithJSON).not.toHaveBeenCalled();
        });
      });
    });

    describe('Tracking', () => {
      describe('Screen views', () => {
        describe('Default handler', () => {
          it('Should call forterSDK.trackNavigation for screens that are registered and are not related to a product view', async () => {
            const forterInstance = createForterInstance();

            const screenViewEvent = generateAnalyticsEventData(
              trackTypes.SCREEN,
              screenTypes.BAG,
            );

            await forterInstance.track(screenViewEvent);

            expect(forterSDK.trackNavigation).toHaveBeenCalledWith(
              screenTypes.BAG,
              ForterNavigationType.CART,
            );
          });

          it('Should call forterSDK.trackNavigationWithExtraData for screens that are registered and are related to a product view', async () => {
            const mockProductId = 12913174;
            const mockProductCategory = 'Clothing';
            const forterInstance = createForterInstance();

            const screenViewEvent = generateAnalyticsEventData(
              trackTypes.SCREEN,
              screenTypes.PRODUCT_DETAILS,
              {
                productId: mockProductId,
                productCategory: mockProductCategory,
              },
            );

            await forterInstance.track(screenViewEvent);

            expect(forterSDK.trackNavigationWithExtraData).toHaveBeenCalledWith(
              screenTypes.PRODUCT_DETAILS,
              ForterNavigationType.PRODUCT,
              `${mockProductId}`,
              `${mockProductCategory}`,
            );
          });

          it('Should warn if a screen view event for a product screen does not contain the product id or category in its properties', async () => {
            const forterInstance = createForterInstance();

            const screenViewEvent = generateAnalyticsEventData(
              trackTypes.SCREEN,
              screenTypes.PRODUCT_DETAILS,
            );

            await forterInstance.track(screenViewEvent);

            expect(utils.logger.warn).toHaveBeenCalledWith(
              `[ForterIntegration] - The screen view event '${screenTypes.PRODUCT_DETAILS}' is categorised as a Product navigation type by default but productId, productCategory or both were missing from event properties. A navigation event will be sent to forter instance anyway but please review the code tracking this screen view event to add the missing values to the properties payload if possible. productId was 'undefined', productCategory was 'undefined'`,
            );

            expect(forterSDK.trackNavigationWithExtraData).toHaveBeenCalledWith(
              screenTypes.PRODUCT_DETAILS,
              ForterNavigationType.PRODUCT,
              null,
              null,
            );
          });

          it('Should _NOT_ call forterSDK.trackNavigation for screens that are _NOT_ registered', async () => {
            const forterInstance = createForterInstance();

            const screenViewEvent = generateAnalyticsEventData(
              trackTypes.SCREEN,
              'UNKNOW_SCREEN_TYPE',
            );

            await forterInstance.track(screenViewEvent);

            expect(forterSDK.trackNavigation).not.toHaveBeenCalled();
          });

          it('Should log an error if the computed method of the forterSDK instance does not exist', async () => {
            //Reset all loaded modules
            jest.resetModules();

            //Add specific mock to this test for the react-native-forter
            //without trackNavigation method in forterSDK object
            jest.doMock('react-native-forter', () => {
              return {
                forterSDK: {
                  getDeviceUniqueID: callback => {
                    callback(mockDeviceId);
                  },
                  init: jest.fn((siteId, mobileUid, successCallback) => {
                    successCallback();
                  }),
                  setAccountIdentifier: jest.fn(),
                  trackActionWithJSON: jest.fn(),
                  trackAction: jest.fn(),
                },
                ForterAccountType,
                ForterActionType,
                ForterNavigationType,
              };
            });

            const reloadedUtilsModule = require('@farfetch/blackout-core/analytics')
              .utils;
            reloadedUtilsModule.logger.error = jest.fn();
            reloadedUtilsModule.logger.info = jest.fn();
            reloadedUtilsModule.logger.warn = jest.fn();

            const ForterClassReloadedWithStrippedDownForterSDK = require('../Forter')
              .default;

            const forterInstance = ForterClassReloadedWithStrippedDownForterSDK.createInstance(
              defaultOptions,
              generateAnalyticsEventData(),
              {
                createEvent: (trackType, event) =>
                  Promise.resolve(generateAnalyticsEventData(trackType, event)),
              },
            );

            const screenViewEvent = generateAnalyticsEventData(
              trackTypes.SCREEN,
              screenTypes.BAG,
            );

            await forterInstance.track(screenViewEvent);

            expect(reloadedUtilsModule.logger.error).toHaveBeenCalledWith(
              `[ForterIntegration] - Invalid forter method 'trackNavigation' specified from command builder for screen '${screenTypes.BAG}'.`,
            );
          });
        });

        describe('Custom handler', () => {
          it('Should delegate screen view event handling to the handler specified by the user', async () => {
            const mockUserScreenEventHandler = jest.fn(
              (data, forterSDKInstance) => {
                forterSDKInstance.trackNavigationWithExtraData(
                  data.event,
                  ForterNavigationType.CHECKOUT,
                  'dummy arg',
                );
              },
            );

            const forterInstance = createForterInstance({
              [OPTION_NAVIGATION_EVENT_HANDLERS]: {
                [screenTypes.BAG]: mockUserScreenEventHandler,
              },
            });

            const screenViewEvent = generateAnalyticsEventData(
              trackTypes.SCREEN,
              screenTypes.BAG,
            );

            await forterInstance.track(screenViewEvent);

            expect(mockUserScreenEventHandler).toHaveBeenCalledWith(
              screenViewEvent,
              forterSDK,
            );

            expect(forterSDK.trackNavigation).not.toHaveBeenCalled();

            expect(forterSDK.trackNavigationWithExtraData).toHaveBeenCalledWith(
              screenTypes.BAG,
              ForterNavigationType.CHECKOUT,
              'dummy arg',
            );
          });

          it('Should log an error if the handler specified by the user for a screen event is not a function', async () => {
            const mockInvalidUserScreenEventHandler = {};

            const forterInstance = createForterInstance({
              [OPTION_NAVIGATION_EVENT_HANDLERS]: {
                [screenTypes.BAG]: mockInvalidUserScreenEventHandler,
              },
            });

            const screenViewEvent = generateAnalyticsEventData(
              trackTypes.SCREEN,
              screenTypes.BAG,
            );

            await forterInstance.track(screenViewEvent);

            expect(utils.logger.error).toHaveBeenCalledWith(
              `[ForterIntegration] - Invalid event handler value received for screen '${
                screenTypes.BAG
              }'. It must be a function but received '${typeof mockInvalidUserScreenEventHandler}'`,
            );

            expect(forterSDK.trackNavigation).not.toHaveBeenCalled();
          });

          it('Should log an error if the handler specified by the user for a screen event throws', async () => {
            const mockErrorMessage = 'Dummy error message';

            const mockInvalidUserScreenEventHandler = () => {
              throw new Error(mockErrorMessage);
            };

            const forterInstance = createForterInstance({
              [OPTION_NAVIGATION_EVENT_HANDLERS]: {
                [screenTypes.BAG]: mockInvalidUserScreenEventHandler,
              },
            });

            const screenViewEvent = generateAnalyticsEventData(
              trackTypes.SCREEN,
              screenTypes.BAG,
            );

            await forterInstance.track(screenViewEvent);

            expect(utils.logger.error).toHaveBeenCalledWith(
              `[ForterIntegration] - An error occurred when trying to execute custom event handler for screen '${screenTypes.BAG}': Error: ${mockErrorMessage}`,
            );

            expect(forterSDK.trackNavigation).not.toHaveBeenCalled();
          });
        });
      });

      describe('Events', () => {
        describe('Default handler', () => {
          it('Should call forterSDK.trackActionWithJSON for events that are registered', async () => {
            const mockProductAddedToCartProperties = {
              cartId: 'skdjsidjsdkdj29j',
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
            };

            const forterInstance = createForterInstance();

            //Clear default calls to mocks provoked by the constructor call to onSetUser
            jest.clearAllMocks();

            const event = generateAnalyticsEventData(
              trackTypes.TRACK,
              eventTypes.PRODUCT_ADDED_TO_CART,
              mockProductAddedToCartProperties,
            );

            await forterInstance.track(event);

            expect(forterSDK.trackActionWithJSON).toHaveBeenCalledWith(
              ForterActionType.ADD_TO_CART,
              mockProductAddedToCartProperties,
            );
          });

          it('Should _NOT_ call forterSDK.trackActionWithJSON for events that are _NOT_ registered', async () => {
            const forterInstance = createForterInstance();

            //Clear default calls to mocks provoked by the constructor call to onSetUser
            jest.clearAllMocks();

            const event = generateAnalyticsEventData(
              trackTypes.TRACK,
              'UNKNOWN_EVENT_TYPE',
              { dummyProp: 'dummy' },
            );

            await forterInstance.track(event);

            expect(forterSDK.trackActionWithJSON).not.toHaveBeenCalledWith();
          });

          it('Should log an error if the computed method of the forterSDK instance does not exist', async () => {
            //Reset all loaded modules
            jest.resetModules();

            //Add specific mock to this test for the react-native-forter
            //without trackActionWithJSON method in forterSDK object
            jest.doMock('react-native-forter', () => {
              return {
                forterSDK: {
                  getDeviceUniqueID: callback => {
                    callback(mockDeviceId);
                  },
                  init: jest.fn((siteId, mobileUid, successCallback) => {
                    successCallback();
                  }),
                  setAccountIdentifier: jest.fn(),
                },
                ForterAccountType,
                ForterActionType,
                ForterNavigationType,
              };
            });

            const reloadedUtilsModule = require('@farfetch/blackout-core/analytics')
              .utils;
            reloadedUtilsModule.logger.error = jest.fn();
            reloadedUtilsModule.logger.info = jest.fn();
            reloadedUtilsModule.logger.warn = jest.fn();

            const ForterClassReloadedWithStrippedDownForterSDK = require('../Forter')
              .default;

            const forterInstance = ForterClassReloadedWithStrippedDownForterSDK.createInstance(
              defaultOptions,
              generateAnalyticsEventData(),
              {
                createEvent: (trackType, event) =>
                  Promise.resolve(generateAnalyticsEventData(trackType, event)),
              },
            );

            const event = generateAnalyticsEventData(
              trackTypes.TRACK,
              eventTypes.PRODUCT_ADDED_TO_CART,
            );

            await forterInstance.track(event);

            expect(reloadedUtilsModule.logger.error).toHaveBeenCalledWith(
              `[ForterIntegration] - Invalid forter method 'trackActionWithJSON' specified from command builder for event '${eventTypes.PRODUCT_ADDED_TO_CART}'.`,
            );
          });
        });

        describe('Custom handler', () => {
          it('Should delegate event handling to the handler specified by the user', async () => {
            const mockUserEventHandler = jest.fn((data, forterSDKInstance) => {
              forterSDKInstance.trackAction(ForterActionType.OTHER);
            });

            const forterInstance = createForterInstance({
              [OPTION_ACTION_EVENT_HANDLERS]: {
                [eventTypes.PRODUCT_ADDED_TO_CART]: mockUserEventHandler,
              },
            });

            //Clear default calls to mocks provoked by the constructor call to onSetUser
            jest.clearAllMocks();

            const event = generateAnalyticsEventData(
              trackTypes.TRACK,
              eventTypes.PRODUCT_ADDED_TO_CART,
            );

            await forterInstance.track(event);

            expect(mockUserEventHandler).toHaveBeenCalledWith(event, forterSDK);

            expect(forterSDK.trackActionWithJSON).not.toHaveBeenCalled();

            expect(forterSDK.trackAction).toHaveBeenCalledWith(
              ForterActionType.OTHER,
            );
          });

          it('Should log an error if the handler specified by the user for an event is not a function', async () => {
            const mockInvalidUserEventHandler = {};

            const forterInstance = createForterInstance({
              [OPTION_ACTION_EVENT_HANDLERS]: {
                [eventTypes.PRODUCT_ADDED_TO_CART]: mockInvalidUserEventHandler,
              },
            });

            const event = generateAnalyticsEventData(
              trackTypes.TRACK,
              eventTypes.PRODUCT_ADDED_TO_CART,
            );

            await forterInstance.track(event);

            expect(utils.logger.error).toHaveBeenCalledWith(
              `[ForterIntegration] - Invalid event handler value received for event '${
                eventTypes.PRODUCT_ADDED_TO_CART
              }'. It must be a function but received '${typeof mockInvalidUserEventHandler}'`,
            );

            expect(forterSDK.trackActionWithJSON).not.toHaveBeenCalled();
          });

          it('Should log an error if the handler specified by the user for an event throws', async () => {
            const mockErrorMessage = 'Dummy error message';

            const mockInvalidUserEventHandler = () => {
              throw new Error(mockErrorMessage);
            };

            const forterInstance = createForterInstance({
              [OPTION_ACTION_EVENT_HANDLERS]: {
                [eventTypes.PRODUCT_ADDED_TO_CART]: mockInvalidUserEventHandler,
              },
            });

            const event = generateAnalyticsEventData(
              trackTypes.TRACK,
              eventTypes.PRODUCT_ADDED_TO_CART,
            );

            await forterInstance.track(event);

            expect(utils.logger.error).toHaveBeenCalledWith(
              `[ForterIntegration] - An error occurred when trying to execute custom event handler for event '${eventTypes.PRODUCT_ADDED_TO_CART}': Error: ${mockErrorMessage}`,
            );

            expect(forterSDK.trackActionWithJSON).not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});
