import {
  eventTypes,
  trackTypes as analyticsTrackTypes,
  utils,
} from '@farfetch/blackout-core/analytics';
import cloneDeep from 'lodash/cloneDeep';
import {
  defaultEventsMapper,
  defaultScreenViewsMapper,
  firebaseEventNameMappings,
} from '../defaultMappers';
import eventSamples, {
  onSetUserEventData,
} from '../../__fixtures__/eventSamples.fixtures';
import firebaseAnalytics from '@react-native-firebase/analytics';
import FirebaseAnalyticsIntegration from '../';
import get from 'lodash/get';
import Integration from '../../integration';
import screenTypes from '../../../screenTypes';
import {
  MAX_PRODUCT_CATEGORIES,
  OPTION_EVENTS_MAPPER,
  OPTION_SCREEN_VIEWS_MAPPER,
  OPTION_SET_CUSTOM_USER_ID_PROPERTY,
} from '../constants';

const mockFirebaseAnalyticsReturn = {
  logScreenView: jest.fn(),
  logLogin: jest.fn(),
  setUserId: jest.fn(),
  setUserProperties: jest.fn(),
  logEvent: jest.fn(),
  logSelectItem: jest.fn(),
};

jest.mock('@react-native-firebase/analytics', () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockFirebaseAnalyticsReturn),
  };
});

jest.mock('@farfetch/blackout-core/analytics', () => ({
  ...jest.requireActual('@farfetch/blackout-core/analytics'),
  utils: {
    logger: {
      error: jest.fn(),
      warn: jest.fn(),
    },
  },
}));

function createInstance(options, loadData) {
  const instance = FirebaseAnalyticsIntegration.createInstance(
    options,
    loadData,
  );

  return instance;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FirebaseAnalyticsIntegration integration', () => {
  it('Should extend the abstract class `Integration`', () => {
    expect(FirebaseAnalyticsIntegration.prototype).toBeInstanceOf(Integration);
  });

  it('`shouldLoad` should return false if there is no user consent', () => {
    expect(FirebaseAnalyticsIntegration.shouldLoad({ statistics: false })).toBe(
      false,
    );
    expect(FirebaseAnalyticsIntegration.shouldLoad()).toBe(false);
    expect(FirebaseAnalyticsIntegration.shouldLoad({})).toBe(false);
  });

  it('`shouldLoad` should return true if there is user consent', () => {
    expect(FirebaseAnalyticsIntegration.shouldLoad({ statistics: true })).toBe(
      true,
    );
  });

  it('Should return a FirebaseAnalyticsIntegration instance from createInstance', () => {
    expect(FirebaseAnalyticsIntegration.createInstance({})).toBeInstanceOf(
      FirebaseAnalyticsIntegration,
    );
  });

  it('Should throw an error if "@react-native-firebase/analytics" is not installed', () => {
    jest.resetModules();

    jest.doMock('@react-native-firebase/analytics', () => undefined);

    const FreshFirebaseAnalyticsIntegration = require('..').default;

    expect(() => FreshFirebaseAnalyticsIntegration.createInstance()).toThrow(
      '[FirebaseAnalytics] "@react-native-firebase/analytics" package is not installed. Please, make sure you have this dependency installed before using this integration.',
    );
  });
});

describe('FirebaseAnalyticsIntegration instance', () => {
  describe(`${OPTION_SCREEN_VIEWS_MAPPER} option`, () => {
    it('Should allow to add/override custom screen view mappers', () => {
      const mockCustomScreenViewMapperFunction = jest.fn();
      const mockExistingScreenViewMapperFunction = jest.fn();

      const customScreenViewsMapper = {
        myScreenView: mockCustomScreenViewMapperFunction,
        [screenTypes.CHECKOUT]: mockExistingScreenViewMapperFunction,
      };

      const instance = createInstance({
        [OPTION_SCREEN_VIEWS_MAPPER]: customScreenViewsMapper,
      });

      let screenViewEventData = {
        event: 'myScreenView',
        type: analyticsTrackTypes.SCREEN,
      };

      // Track a new screen view to test support for new screen types
      instance.track(screenViewEventData);

      expect(mockCustomScreenViewMapperFunction).toHaveBeenCalledWith(
        screenViewEventData,
        defaultScreenViewsMapper,
      );
      expect(mockExistingScreenViewMapperFunction).not.toHaveBeenCalled();

      jest.clearAllMocks();

      screenViewEventData = {
        event: screenTypes.CHECKOUT,
        type: analyticsTrackTypes.SCREEN,
      };

      // Track a screen view that is handled by the default mapper
      // to test overrides
      instance.track(screenViewEventData);

      expect(mockExistingScreenViewMapperFunction).toHaveBeenCalledWith(
        screenViewEventData,
        defaultScreenViewsMapper,
      );
      expect(mockCustomScreenViewMapperFunction).not.toHaveBeenCalled();
    });

    it('Should allow to specify other high-level methods from react-native-firebase', () => {
      const validFirebaseAnalyticsMethod = 'logEvent';

      const mockMapperFunction = jest.fn(() => {
        return {
          method: validFirebaseAnalyticsMethod,
          event: 'screen_view',
        };
      });

      const customScreenViewsMapper = {
        myScreenView: mockMapperFunction,
      };

      const instance = createInstance({
        [OPTION_SCREEN_VIEWS_MAPPER]: customScreenViewsMapper,
      });

      const screenViewEventData = {
        event: 'myScreenView',
        type: analyticsTrackTypes.SCREEN,
      };

      instance.track(screenViewEventData);

      expect(mockMapperFunction).toHaveBeenCalledWith(
        screenViewEventData,
        defaultScreenViewsMapper,
      );

      expect(
        firebaseAnalytics()[validFirebaseAnalyticsMethod],
      ).toHaveBeenCalled();
      expect(firebaseAnalytics().logScreenView).not.toHaveBeenCalled();
    });
  });

  describe(`${OPTION_EVENTS_MAPPER} option`, () => {
    it('Should allow to add/override custom event mappers', () => {
      const mockCustomEventMapperFunction = jest.fn();
      const mockExistingEventMapperFunction = jest.fn();

      const customEventsMapper = {
        myEvent: mockCustomEventMapperFunction,
        [eventTypes.PRODUCT_ADDED_TO_CART]: mockExistingEventMapperFunction,
      };

      const instance = createInstance({
        [OPTION_EVENTS_MAPPER]: customEventsMapper,
      });

      let eventData = { event: 'myEvent', type: analyticsTrackTypes.TRACK };

      // Track a new event to test support for new events
      instance.track(eventData);

      expect(mockCustomEventMapperFunction).toHaveBeenCalledWith(
        eventData,
        defaultEventsMapper,
      );
      expect(mockExistingEventMapperFunction).not.toHaveBeenCalled();

      jest.clearAllMocks();

      eventData = {
        event: eventTypes.PRODUCT_ADDED_TO_CART,
        type: analyticsTrackTypes.TRACK,
      };

      // Track an event that is handled by the default mapper
      // to test overrides
      instance.track(eventData);

      expect(mockExistingEventMapperFunction).toHaveBeenCalledWith(
        eventData,
        defaultEventsMapper,
      );
      expect(mockCustomEventMapperFunction).not.toHaveBeenCalled();
    });

    it('Should allow to specify other high-level methods from react-native-firebase', () => {
      const validFirebaseAnalyticsMethod = 'logSelectItem';

      const mockMapperFunction = jest.fn(() => {
        return { method: validFirebaseAnalyticsMethod };
      });

      const customEventsMapper = {
        myEvent: mockMapperFunction,
      };

      const instance = createInstance({
        [OPTION_EVENTS_MAPPER]: customEventsMapper,
      });

      const eventData = { event: 'myEvent', type: analyticsTrackTypes.TRACK };

      instance.track(eventData);

      expect(mockMapperFunction).toHaveBeenCalledWith(
        eventData,
        defaultEventsMapper,
      );

      expect(
        firebaseAnalytics()[validFirebaseAnalyticsMethod],
      ).toHaveBeenCalled();
      expect(firebaseAnalytics().logEvent).not.toHaveBeenCalled();
    });
  });

  describe(`${OPTION_SET_CUSTOM_USER_ID_PROPERTY} option`, () => {
    const userIdLoggedIn = 10000;
    const userIdGuest = 30000;

    describe('When it is true', () => {
      it('Should set a `crm_id` user property whose value is equal to the `user_id` when the user is not guest', async () => {
        // By default OPTION_SET_CUSTOM_USER_ID_PROPERTY value is true
        const instance = createInstance();

        await instance.onSetUser({
          ...onSetUserEventData,
          user: {
            id: userIdLoggedIn,
            traits: { isGuest: false },
            localId: '123',
          },
        });

        expect(firebaseAnalytics().setUserProperties).toHaveBeenLastCalledWith({
          crm_id: userIdLoggedIn.toString(),
          is_guest: 'false',
        });

        expect(firebaseAnalytics().setUserId).toHaveBeenLastCalledWith(
          userIdLoggedIn.toString(),
        );
      });

      it('Should set a `crm_id` user property whose value is null when the user is guest', async () => {
        // By default OPTION_SET_CUSTOM_USER_ID_PROPERTY value is true
        const instance = createInstance();

        await instance.onSetUser({
          ...onSetUserEventData,
          user: {
            id: userIdGuest,
            traits: { isGuest: true },
            localId: '123',
          },
        });

        expect(firebaseAnalytics().setUserProperties).toHaveBeenLastCalledWith({
          crm_id: null,
          is_guest: 'true',
        });

        expect(firebaseAnalytics().setUserId).toHaveBeenLastCalledWith(null);
      });
    });

    describe('When it is false', () => {
      it('Should set a `crm_id` user property whose value is null when the user is not guest', async () => {
        const options = {
          [OPTION_SET_CUSTOM_USER_ID_PROPERTY]: false,
        };

        const instance = createInstance(options);

        await instance.onSetUser({
          ...onSetUserEventData,
          user: {
            id: userIdLoggedIn,
            traits: { isGuest: false },
            localId: '123',
          },
        });

        expect(firebaseAnalytics().setUserProperties).toHaveBeenLastCalledWith({
          crm_id: null,
          is_guest: 'false',
        });

        expect(firebaseAnalytics().setUserId).toHaveBeenLastCalledWith(
          userIdLoggedIn.toString(),
        );
      });

      it('Should set a `crm_id` user property whose value is null when the user is guest', async () => {
        const options = {
          [OPTION_SET_CUSTOM_USER_ID_PROPERTY]: false,
        };

        const instance = createInstance(options);

        await instance.onSetUser({
          ...onSetUserEventData,
          user: {
            id: userIdGuest,
            traits: { isGuest: true },
            localId: '123',
          },
        });

        expect(firebaseAnalytics().setUserProperties).toHaveBeenLastCalledWith({
          crm_id: null,
          is_guest: 'true',
        });

        expect(firebaseAnalytics().setUserId).toHaveBeenLastCalledWith(null);
      });
    });
  });

  describe('User', () => {
    it('Should call `onSetUser` when the instance is created', () => {
      const spy = jest.spyOn(
        FirebaseAnalyticsIntegration.prototype,
        'onSetUser',
      );
      const loadData = {
        user: {
          id: 123,
          traits: {},
        },
      };

      createInstance(null, loadData);

      expect(spy).toHaveBeenCalledWith(loadData, null);
    });

    it('Should call custom `onSetUser` function if passed via the integration options', () => {
      const customOnSetUserSpy = jest.fn();
      const loadData = {
        foo: 'bar',
        biz: 1,
      };
      const options = {
        onSetUser: 'foo',
      };
      createInstance(options, loadData);

      expect(utils.logger.error).toHaveBeenCalledWith(
        '[FirebaseAnalytics] TypeError: "onSetUser" is not a function. If you are passing a custom "onSetUser" property to the integration, make sure you are passing a valid function.',
      );

      options.onSetUser = customOnSetUserSpy;

      createInstance(options, loadData);

      expect(customOnSetUserSpy).toHaveBeenCalledWith(
        loadData,
        mockFirebaseAnalyticsReturn,
      );
    });

    it('Should call firebase analytics methods when `onSetUser` is called', async () => {
      const userData = {
        user: {
          id: 123,
          traits: {
            email: 'asdasd@asdasd.com',
            name: 'asd',
            isGuest: false,
          },
        },
      };
      const instance = createInstance();

      // Test when a user is registered
      await instance.onSetUser(userData);

      expect(firebaseAnalytics().setUserId).toHaveBeenLastCalledWith(
        userData.user.id.toString(),
      );
      expect(firebaseAnalytics().setUserProperties).toHaveBeenLastCalledWith({
        is_guest: userData.user.traits.isGuest.toString(),
        crm_id: userData.user.id.toString(),
      });

      jest.clearAllMocks();

      // Test when a user is guest
      await instance.onSetUser({ id: 123, traits: { isGuest: true } });

      expect(firebaseAnalytics().setUserId).toHaveBeenLastCalledWith(null);
      expect(firebaseAnalytics().setUserProperties).toHaveBeenLastCalledWith({
        is_guest: 'true',
        crm_id: null,
      });
    });
  });

  describe('Track', () => {
    describe('Validation', () => {
      it('Should not track an event that is not supported by default or whose mappings are invalid', async () => {
        const analyticsTrackEventData = {
          type: analyticsTrackTypes.TRACK,
          event: eventTypes.PRODUCT_CLICKED,
          properties: {
            foo: 'bar',
          },
        };
        const validFirebaseAnalyticsMethod = 'logSelectItem';
        let instance = createInstance();

        // Test a non mapped event - It should not be tracked
        await instance.track({
          ...analyticsTrackEventData,
          event: 'myCustomEventThatShouldBeIgnored',
        });

        expect(firebaseAnalytics().logEvent).not.toHaveBeenCalled();

        jest.clearAllMocks();

        // Test a mapped event that do not return a valid function
        instance = createInstance({
          eventsMapper: {
            [eventTypes.PRODUCT_CLICKED]: 'foo',
          },
        });

        await instance.track(analyticsTrackEventData);

        expect(utils.logger.error).toHaveBeenCalledWith(
          '[FirebaseAnalytics] TypeError: Mapper for event "Product Clicked" is not a function. If you\'re passing a custom mapper for this event, make sure a function is passed.',
        );
        expect(firebaseAnalytics().logEvent).not.toHaveBeenCalled();

        jest.clearAllMocks();

        // Test a mapped event that returns a valid function with invalid `properties`
        instance = createInstance({
          eventsMapper: {
            [eventTypes.PRODUCT_CLICKED]: () => ({
              method: validFirebaseAnalyticsMethod,
              properties: 'foo',
            }),
          },
        });

        await instance.track(analyticsTrackEventData);

        expect(utils.logger.error).toHaveBeenCalledWith(
          '[FirebaseAnalytics] TypeError: The properties passed for event "Product Clicked" is not an object. If you are passing a custom mapper for this event, make sure you return a valid object under "properties" key.',
        );
        expect(
          firebaseAnalytics()[validFirebaseAnalyticsMethod],
        ).not.toHaveBeenCalled();

        jest.clearAllMocks();

        // Test a mapped event that returns a valid function with valid `properties` without a known method for firebase
        const unknownMethodOfFirebase = 'unknownMethodOfFirebase';
        instance = createInstance({
          eventsMapper: {
            [eventTypes.PRODUCT_CLICKED]: () => ({
              method: unknownMethodOfFirebase,
              properties: analyticsTrackEventData.properties,
            }),
          },
        });

        await instance.track(analyticsTrackEventData);

        expect(utils.logger.error).toHaveBeenCalledWith(
          '[FirebaseAnalytics] Received invalid method "unknownMethodOfFirebase" for event "Product Clicked". If you are passing a custom mapper, make sure you return a supported Firebase Analytics method.',
        );

        expect(firebaseAnalytics().logEvent).not.toHaveBeenCalled();
      });
    });

    describe('Screen views', () => {
      it('Should track a screen for a screen type that does not also generate an event', async () => {
        // # Case 1: Test screen view tracking without any additional properties
        const trackScreenData = {
          type: analyticsTrackTypes.SCREEN,
          event: screenTypes.PRODUCT_DETAILS,
        };

        const instance = createInstance();

        await instance.track(trackScreenData);

        expect(firebaseAnalytics().logScreenView).toHaveBeenCalledWith({
          screen_name: screenTypes.PRODUCT_DETAILS,
          screen_class: screenTypes.PRODUCT_DETAILS,
        });

        expect(firebaseAnalytics().logEvent).not.toHaveBeenCalled();

        jest.clearAllMocks();

        // Subcase when the properties are set but to an empty object
        trackScreenData.properties = {};

        await instance.track(trackScreenData);

        expect(firebaseAnalytics().logScreenView).toHaveBeenCalledWith({
          screen_name: screenTypes.PRODUCT_DETAILS,
          screen_class: screenTypes.PRODUCT_DETAILS,
        });

        expect(firebaseAnalytics().logEvent).not.toHaveBeenCalled();

        jest.clearAllMocks();

        // # Case 2: Test screen view tracking with additional properties
        // which contain some invalid values
        const customProperties = {
          myCustomProp: 'xxx',
          anotherCustomProp: 'yyy',
          invalidProp1: [{ prop: 'dummy' }],
          invalidProp2: Symbol('x'),
          invalidProp3: function () {},
        };

        // Add custom properties to the screen view event
        trackScreenData.properties = customProperties;

        await instance.track(trackScreenData);

        expect(firebaseAnalytics().logScreenView).toHaveBeenCalledWith({
          screen_name: screenTypes.PRODUCT_DETAILS,
          screen_class: screenTypes.PRODUCT_DETAILS,
          my_custom_prop: 'xxx',
          another_custom_prop: 'yyy',
        });

        expect(firebaseAnalytics().logEvent).not.toHaveBeenCalled();
      });
    });

    describe('Default events mappings', () => {
      const screenTypesValues = Object.values(screenTypes);

      it.each(
        Object.keys(firebaseEventNameMappings).filter(
          eventType => eventType in eventSamples,
        ),
      )('Should map the %s event correctly', async eventType => {
        const eventData = eventSamples[eventType];

        const instance = createInstance();

        await instance.track(eventData);

        const { method } = defaultEventsMapper(eventData);

        const methodToInspect = method
          ? firebaseAnalytics()[method]
          : firebaseAnalytics().logEvent;

        expect(methodToInspect.mock.calls).toMatchSnapshot();

        // If event is a screen view type, it should also log a screen view
        if (screenTypesValues.includes(eventType)) {
          expect(
            firebaseAnalytics().logScreenView.mock.calls,
          ).toMatchSnapshot();
        }
      });

      describe('Pre-purchase events', () => {
        it("Should use the 'value' property if it is available on the event properties", async () => {
          const instance = createInstance();

          const expectedValue = 56;
          const expectedIndex = 4;

          const expectedPayload = [
            firebaseEventNameMappings[eventTypes.PRODUCT_REMOVED_FROM_CART],
            expect.objectContaining({
              items: [
                expect.objectContaining({
                  index: expectedIndex,
                }),
              ],
              value: expectedValue,
            }),
          ];

          const clonedEvent = {
            ...eventSamples[eventTypes.PRODUCT_REMOVED_FROM_CART],
          };

          clonedEvent.properties = {
            ...clonedEvent.properties,
            value: expectedValue,
            position: expectedIndex,
          };

          await instance.track(clonedEvent);

          expect(firebaseAnalytics().logEvent.mock.calls[0]).toEqual(
            expectedPayload,
          );
        });

        it("Should calculate the 'value' property if it is not available on the event properties", async () => {
          const instance = createInstance();

          const expectedValue =
            eventSamples[eventTypes.PRODUCT_REMOVED_FROM_CART].properties.price;

          const expectedPayload = [
            firebaseEventNameMappings[eventTypes.PRODUCT_REMOVED_FROM_CART],
            expect.objectContaining({
              value: expectedValue,
            }),
          ];

          const clonedEvent = {
            ...eventSamples[eventTypes.PRODUCT_REMOVED_FROM_CART],
          };

          delete clonedEvent.properties.value;

          await instance.track(clonedEvent);

          expect(firebaseAnalytics().logEvent.mock.calls[0]).toEqual(
            expectedPayload,
          );
        });

        it('Should obtain bag value in screenTypes.bag', async () => {
          const instance = createInstance();

          const clonedEvent = {
            ...eventSamples[screenTypes.BAG],
            properties: {
              ...eventSamples[screenTypes.BAG].properties,
              value: 10,
            },
          };

          await instance.track(clonedEvent);

          expect(firebaseAnalytics().logEvent.mock.calls[0][1].value).toEqual(
            10,
          );

          jest.clearAllMocks();

          delete clonedEvent.properties.value;

          const {
            discountValue,
            priceWithoutDiscount,
            quantity,
          } = clonedEvent.properties.products[0];

          const expectedValue =
            (priceWithoutDiscount - discountValue) * quantity;

          await instance.track(clonedEvent);

          expect(firebaseAnalytics().logEvent.mock.calls[0][1].value).toEqual(
            expectedValue,
          );
        });
      });

      describe('Newsletter events', () => {
        const defaultEvent = {
          ...eventSamples[eventTypes.SIGNUP_NEWSLETTER],
        };

        it('Should track single gender event', async () => {
          const instance = createInstance();

          const singleGenderEvent = {
            ...defaultEvent,
            properties: {
              ...defaultEvent.properties,
              gender: '0',
            },
          };

          await instance.track(singleGenderEvent);

          expect(firebaseAnalytics().logEvent.mock.calls).toMatchSnapshot();
        });

        it('Should track multiple gender event', async () => {
          const instance = createInstance();

          const getGenderData = genderData => ({
            ...defaultEvent,
            properties: {
              ...defaultEvent.properties,
              gender: genderData,
            },
          });

          await instance.track(getGenderData(['0', '1']));

          await instance.track(
            getGenderData([
              { id: '0', name: 'WOMAN' },
              { id: '1', name: 'MAN' },
            ]),
          );

          await instance.track(getGenderData([{ id: '0' }, { id: '1' }]));

          expect(firebaseAnalytics().logEvent.mock.calls).toMatchSnapshot();
        });

        it('Should not track signup_newsletter event with invalid gender data', async () => {
          const instance = createInstance();

          const multipleGenderEventWithInvalidGender = {
            ...defaultEvent,
            properties: {
              ...defaultEvent.properties,
              gender: ['10', '1'],
            },
          };

          await instance.track(multipleGenderEventWithInvalidGender);

          expect(utils.logger.error).toHaveBeenCalledWith(
            '[FirebaseAnalytics] An error occurred when trying to map event "Sign-up Newsletter": Error: Invalid payload for "Sign-up Newsletter" event: "gender" parameter contains gender ids that cannot be mapped to a description by default and a description was not provided. Gender parameter value was: "10,1".',
          );

          const singleGenderEventWithInvalidGender = {
            ...defaultEvent,
            properties: {
              ...defaultEvent.properties,
              gender: '10',
            },
          };

          jest.clearAllMocks();

          await instance.track(singleGenderEventWithInvalidGender);

          expect(utils.logger.error).toHaveBeenCalledWith(
            '[FirebaseAnalytics] An error occurred when trying to map event "Sign-up Newsletter": Error: Invalid payload for "Sign-up Newsletter" event: "gender" parameter contains gender ids that cannot be mapped to a description by default and a description was not provided. Gender parameter value was: "10".',
          );

          expect(firebaseAnalytics().logEvent).not.toHaveBeenCalled();
        });
      });

      describe('Search events', () => {
        const defaultEvent = {
          ...eventSamples[screenTypes.SEARCH],
        };
        it('Should track search event search term instead of search query.', async () => {
          const instance = createInstance();

          const data = {
            ...defaultEvent,
            properties: {
              ...defaultEvent.properties,
              searchTerm: 'term',
              searchQuery: 'query',
            },
          };

          await instance.track(data);

          expect(firebaseAnalytics().logEvent.mock.calls[0]).toMatchSnapshot();
        });

        it('Should track search event search without search term but with search query instead.', async () => {
          const instance = createInstance();

          const data = {
            ...defaultEvent,
            properties: {
              ...defaultEvent.properties,
              searchTerm: undefined,
              searchQuery: 'query',
            },
          };

          await instance.track(data);

          expect(firebaseAnalytics().logEvent.mock.calls[0]).toMatchSnapshot();
        });

        it('Should not track search event with invalid search term or query, only screen view event.', async () => {
          const instance = createInstance();

          const data = {
            ...defaultEvent,
            properties: {
              ...defaultEvent.properties,
              searchQuery: undefined,
            },
          };

          await instance.track(data);

          expect(utils.logger.error).toHaveBeenCalledWith(
            '[FirebaseAnalytics] An error occurred when trying to map event "search": Error: Invalid payload for "undefined" event: "searchQuery" parameter was not present in event payload.',
          );
        });
      });

      describe('Update Product events', () => {
        it('Should not trigger any firebase event', async () => {
          const instance = createInstance();

          const clonedEvent = cloneDeep(
            eventSamples[eventTypes.PRODUCT_UPDATED],
          );

          // delete unwanted case scenarios
          delete clonedEvent.properties.oldQuantity;
          delete clonedEvent.properties.quantity;
          delete clonedEvent.properties.oldSize;
          delete clonedEvent.properties.size;
          delete clonedEvent.properties.oldColour;
          delete clonedEvent.properties.colour;

          await instance.track(clonedEvent);
          expect(firebaseAnalytics().logEvent).not.toHaveBeenCalled();
        });

        it('Should send "change_quantity" event to firebase', async () => {
          const instance = createInstance();

          const clonedEvent = cloneDeep(
            eventSamples[eventTypes.PRODUCT_UPDATED],
          );

          // delete unwanted case scenarios
          delete clonedEvent.properties.oldSize;
          delete clonedEvent.properties.size;
          delete clonedEvent.properties.oldColour;
          delete clonedEvent.properties.colour;

          await instance.track(clonedEvent);
          expect(firebaseAnalytics().logEvent.mock.calls).toMatchSnapshot();
        });

        it('Should send "change_size" event to firebase', async () => {
          const instance = createInstance();

          const clonedEvent = cloneDeep(
            eventSamples[eventTypes.PRODUCT_UPDATED],
          );

          // delete unwanted case scenarios
          delete clonedEvent.properties.oldSize;
          delete clonedEvent.properties.size;

          await instance.track(clonedEvent);

          expect(firebaseAnalytics().logEvent.mock.calls).toMatchSnapshot();
        });

        it('Should send "change_colour" event to firebase', async () => {
          const instance = createInstance();

          const clonedEvent = cloneDeep(
            eventSamples[eventTypes.PRODUCT_UPDATED],
          );

          // delete unwanted case scenarios
          delete clonedEvent.properties.oldQuantity;
          delete clonedEvent.properties.quantity;
          delete clonedEvent.properties.oldSize;
          delete clonedEvent.properties.size;

          await instance.track(clonedEvent);

          expect(firebaseAnalytics().logEvent.mock.calls).toMatchSnapshot();
        });

        it('Should send "change_quantity", "change_size" and "change_colour" events to firebase when a product updated event contains all the necessary changes', async () => {
          const instance = createInstance();

          const clonedEvent = cloneDeep(
            eventSamples[eventTypes.PRODUCT_UPDATED],
          );

          await instance.track(clonedEvent);

          expect(firebaseAnalytics().logEvent.mock.calls).toMatchSnapshot();
        });
      });

      describe('Product categories max validation', () => {
        it(`Should display a warning and truncate the categories if the product categories exceed ${MAX_PRODUCT_CATEGORIES}`, async () => {
          const instance = createInstance();

          const clonedEvent = cloneDeep(
            eventSamples[eventTypes.PRODUCT_ADDED_TO_CART],
          );

          clonedEvent.properties.category =
            'Category_1/Category_2/Category_3/Category_4/Category_5/Category_6';

          // Make sure our dummy categories exceed the max length
          expect(
            get(clonedEvent, 'properties.category', '').split('/').length,
          ).toBeGreaterThan(MAX_PRODUCT_CATEGORIES);

          // We want the first + last 4 categories
          const expectedCategories = {
            item_category: 'Category_1',
            item_category2: 'Category_3',
            item_category3: 'Category_4',
            item_category4: 'Category_5',
            item_category5: 'Category_6',
          };

          await instance.track(clonedEvent);

          expect(utils.logger.warn).toHaveBeenCalledWith(
            '[FirebaseAnalytics] Product category hierarchy exceeded maximum of 5. Firebase only allows up to 5 levels.',
          );

          const eventPropertiesSentFirebase = firebaseAnalytics().logEvent.mock.calls[0].pop();

          expect(eventPropertiesSentFirebase).toEqual(
            expect.objectContaining({
              items: expect.arrayContaining([
                expect.objectContaining(expectedCategories),
              ]),
            }),
          );
        });
      });
    });
  });
});
