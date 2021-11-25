import FirebaseAnalyticsIntegration from '../';
import { eventsMapper } from '../mapper';
import {
  eventTypes,
  integrations,
  trackTypes as analyticsTrackTypes,
  utils,
} from '@farfetch/blackout-core/analytics';
import firebaseAnalytics from '@react-native-firebase/analytics';
import { LOGIN_METHOD } from '../constants';

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
    expect(FirebaseAnalyticsIntegration.prototype).toBeInstanceOf(
      integrations.Integration,
    );
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
      '[FirebaseAnalytics]: "@react-native-firebase/analytics" package is not installed. Please, make sure you have this dependency installed before using this integration.',
    );
  });
});

describe('FirebaseAnalyticsIntegration instance', () => {
  it('Should allow to extend the eventsMapper', () => {
    const customEventsMapper = {
      myEvent: () => 'myEvent',
    };

    const instance = createInstance({ eventsMapper: customEventsMapper });

    expect(instance.eventsMapper).toEqual({
      ...eventsMapper,
      ...customEventsMapper,
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

    it('Should call custom `onSetUser` if passed via the integration options', () => {
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

      expect(customOnSetUserSpy).toHaveBeenCalledWith(loadData);
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

      await instance.onSetUser(userData);

      expect(firebaseAnalytics().logLogin).toHaveBeenCalledWith({
        method: LOGIN_METHOD,
      });
      expect(firebaseAnalytics().setUserId).toHaveBeenCalledWith(
        userData.user.id.toString(),
      );
      expect(firebaseAnalytics().setUserProperties).toHaveBeenCalledWith({
        ...userData.user.traits,
        isGuest: userData.user.traits.isGuest.toString(),
      });

      firebaseAnalytics().logLogin.mockClear();
      firebaseAnalytics().setUserId.mockClear();
      firebaseAnalytics().setUserProperties.mockClear();

      // Test when a user is guest - should not call any method
      await instance.onSetUser({ id: 123, traits: { isGuest: true } });

      expect(firebaseAnalytics().logLogin).not.toHaveBeenCalled();
      expect(firebaseAnalytics().setUserId).not.toHaveBeenCalled();
      expect(firebaseAnalytics().setUserProperties).not.toHaveBeenCalled();

      // Force onSetUser with the same id for the next test
      await instance.onSetUser(userData);

      firebaseAnalytics().logLogin.mockClear();
      firebaseAnalytics().setUserId.mockClear();
      firebaseAnalytics().setUserProperties.mockClear();

      // Force onSetUser with the same id, it should not call the methods again
      await instance.onSetUser(userData);

      expect(firebaseAnalytics().logLogin).not.toHaveBeenCalled();
      expect(firebaseAnalytics().setUserId).not.toHaveBeenCalled();
      expect(firebaseAnalytics().setUserProperties).not.toHaveBeenCalled();

      // Test logout
      await instance.onSetUser({
        user: {
          id: 12321123123123,
          traits: {
            isGuest: true,
          },
        },
      });

      expect(firebaseAnalytics().setUserId).toHaveBeenCalledWith(null);
      expect(firebaseAnalytics().setUserProperties).toHaveBeenCalledWith({});
    });
  });

  describe('track', () => {
    it('Should track a screen', async () => {
      const trackScreenData = {
        type: analyticsTrackTypes.SCREEN,
        event: 'foo',
      };
      const instance = createInstance();

      await instance.track(trackScreenData);

      expect(firebaseAnalytics().logScreenView).toHaveBeenCalledWith({
        screen_class: 'foo',
        screen_name: 'foo',
      });
    });

    it('Should track an event', async () => {
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

      // Test a mapped event that do not return a valid function
      instance = createInstance({
        eventsMapper: {
          [eventTypes.PRODUCT_CLICKED]: 'foo',
        },
      });

      await instance.track(analyticsTrackEventData);

      expect(utils.logger.error).toHaveBeenCalledWith(
        '[FirebaseAnalytics] TypeError: Event mapping for event "Product Clicked" is not a function. If you\'re passing a custom event mapping for this event, make sure a function is passed.',
      );

      utils.logger.error.mockClear();

      // Test a mapped event that returns a valid function with invalid `properties`
      instance = createInstance({
        eventsMapper: {
          [eventTypes.PRODUCT_CLICKED]: () => ({
            method: 'logSelectItem',
            properties: 'foo',
          }),
        },
      });

      await instance.track(analyticsTrackEventData);

      expect(utils.logger.error).toHaveBeenCalledWith(
        '[FirebaseAnalytics] TypeError: The properties passed for event Product Clicked is not an object. If you are passing a custom event mapping for this event, make sure you return a valid object under "properties" key.',
      );

      utils.logger.error.mockClear();

      // Test a mapped event that returns a valid function with valid `properties`
      instance = createInstance({
        eventsMapper: {
          [eventTypes.PRODUCT_CLICKED]: () => ({
            method: validFirebaseAnalyticsMethod,
            properties: analyticsTrackEventData.properties,
          }),
        },
      });

      await instance.track(analyticsTrackEventData);

      expect(
        firebaseAnalytics()[validFirebaseAnalyticsMethod],
      ).toHaveBeenCalledWith(analyticsTrackEventData.properties);

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
        '[FirebaseAnalytics] Method "unknownMethodOfFirebase" is not defined. If you are passing a custom event mapping, make sure you return a supported Firebase Analytics event.',
      );

      firebaseAnalytics().logEvent.mockClear();
      // Test a mapped event that returns a valid function with valid `properties` without a high-level method
      const customEvent = 'my custom event';
      const formattedCustomEvent = 'my_custom_event';

      instance = createInstance({
        eventsMapper: {
          [customEvent]: () => ({
            method: undefined,
            properties: analyticsTrackEventData.properties,
          }),
        },
      });

      await instance.track({ ...analyticsTrackEventData, event: customEvent });

      expect(firebaseAnalytics().logEvent).toHaveBeenCalledWith(
        formattedCustomEvent,
        analyticsTrackEventData.properties,
      );
    });
  });
});
