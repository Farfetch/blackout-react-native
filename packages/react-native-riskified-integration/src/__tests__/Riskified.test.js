import Riskified from '../Riskified';
import { NativeModules, Platform } from 'react-native';
import {
  eventTypes,
  screenTypes,
  trackTypes,
  utils,
} from '@farfetch/blackout-react-native-analytics';

utils.logger.error = jest.fn();

jest.mock('react-native', () => ({
  NativeModules: {
    RiskifiedIntegration: {
      logRequest: jest.fn(),
      startBeacon: jest.fn(),
      logSensitiveDeviceInfo: jest.fn(),
    },
  },
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('@farfetch/blackout-react-native-analytics', () => {
  const original = jest.requireActual(
    '@farfetch/blackout-react-native-analytics',
  );

  return {
    ...original,
    utils: {
      logger: {
        error: jest.fn(),
      },
    },
  };
});

const { RiskifiedIntegration } = NativeModules;

const defaultOptions = {
  shopName: 'dummy_shop_name',
  eventsToLog: {
    [eventTypes.ORDER_COMPLETED]: 'http://www.example.com/order_completed',
  },
  token: 'dummy_token',
};

describe('Riskified integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Static methods', () => {
    it('should always return true when calling shouldLoad method', () => {
      expect(
        Riskified.shouldLoad({
          marketing: false,
          preferences: false,
          statistics: false,
        }),
      ).toBe(true);
    });

    it('should return a Riskified instance when calling createInstance method', () => {
      expect(Riskified.createInstance(defaultOptions, {})).toBeInstanceOf(
        Riskified,
      );
    });
  });

  describe('Options Validation', () => {
    describe('shopName option', () => {
      it('should throw if options does not contain a valid shopName property', () => {
        const options = {
          eventsToLog: defaultOptions.eventsToLog,
        };

        expect(() => new Riskified(options)).toThrowErrorMatchingInlineSnapshot(
          '"Failed to initialize riskified integration: `shopName` option was not provided with a valid value"',
        );

        options.shopName = jest.fn();

        expect(() => new Riskified(options)).toThrowErrorMatchingInlineSnapshot(
          '"Failed to initialize riskified integration: `shopName` option was not provided with a valid value"',
        );
      });
    });

    describe('eventsToLog and screensToLog options', () => {
      it('should throw if options does not contain both eventsToLog and screensToLog options', () => {
        const options = { shopName: defaultOptions.shopName };

        expect(() => new Riskified(options)).toThrowErrorMatchingInlineSnapshot(
          '"Failed to initialize riskified integration: no events or screen views were registered to be logged. Please, use the `eventsToLog` option to register the events that need to be logged and the `screensToLog` option to register the screen views that need to be logged"',
        );

        options.eventsToLog = {};

        expect(() => new Riskified(options)).toThrowErrorMatchingInlineSnapshot(
          '"Failed to initialize riskified integration: no events or screen views were registered to be logged. Please, use the `eventsToLog` option to register the events that need to be logged and the `screensToLog` option to register the screen views that need to be logged"',
        );

        options.screensToLog = {};

        expect(() => new Riskified(options)).toThrowErrorMatchingInlineSnapshot(
          '"Failed to initialize riskified integration: no events or screen views were registered to be logged. Please, use the `eventsToLog` option to register the events that need to be logged and the `screensToLog` option to register the screen views that need to be logged"',
        );

        options.eventsToLog = 'invalid_value';

        expect(() => new Riskified(options)).toThrowErrorMatchingInlineSnapshot(
          '"Failed to initialize riskified integration: no events or screen views were registered to be logged. Please, use the `eventsToLog` option to register the events that need to be logged and the `screensToLog` option to register the screen views that need to be logged"',
        );

        options.screensToLog = 'invalid_value';

        expect(() => new Riskified(options)).toThrowErrorMatchingInlineSnapshot(
          '"Failed to initialize riskified integration: no events or screen views were registered to be logged. Please, use the `eventsToLog` option to register the events that need to be logged and the `screensToLog` option to register the screen views that need to be logged"',
        );
      });
    });

    describe('token option', () => {
      it('should use user.localId as the token for startBeacon call if the token option is not provided', () => {
        const localId = '633d0be8-50bf-4dff-a1af-dd1f68214b3b';

        const loadData = {
          user: {
            localId,
          },
        };

        const optionsWithoutToken = {
          ...defaultOptions,
        };

        delete optionsWithoutToken.token;

        // eslint-disable-next-line no-new
        new Riskified(optionsWithoutToken, loadData);

        expect(RiskifiedIntegration.startBeacon).toHaveBeenCalledWith(
          defaultOptions.shopName,
          localId,
          expect.any(Boolean),
        );
      });
    });
  });

  describe('Constructor', () => {
    it('should call startBeacon when the required options are provided', async () => {
      // eslint-disable-next-line no-new
      new Riskified(defaultOptions, {});

      expect(RiskifiedIntegration.startBeacon).toHaveBeenCalledWith(
        defaultOptions.shopName,
        defaultOptions.token,
        expect.any(Boolean),
      );
    });
  });

  describe('Track', () => {
    let riskifiedInstance;

    const options = {
      ...defaultOptions,
      screensToLog: {
        [screenTypes.HOMEPAGE]: 'http://www.example.com/home',
        [screenTypes.ACCOUNT]: jest.fn(), //This property is incorrectly configured on purpose for a test case
      },
      eventsToLog: {
        [eventTypes.CHECKOUT_STARTED]:
          'http://www.example.com/checkout_started',
        [eventTypes.PRODUCT_ADDED_TO_CART]: jest.fn(), //This property is incorrectly configured on purpose for a test case
      },
    };

    beforeEach(() => {
      riskifiedInstance = new Riskified(options);
    });

    describe('Screen views', () => {
      it('should call logRequest if there is a url configured for the tracked screen', () => {
        riskifiedInstance.track({
          type: trackTypes.SCREEN,
          event: screenTypes.HOMEPAGE,
        });

        expect(RiskifiedIntegration.logRequest).toHaveBeenCalledWith(
          options.screensToLog[screenTypes.HOMEPAGE],
        );
      });

      it('should _NOT_ call logRequest if there is _NOT_ a url configured for the tracked screen', () => {
        riskifiedInstance.track({
          type: trackTypes.SCREEN,
          event: screenTypes.LOGIN,
        });

        expect(RiskifiedIntegration.logRequest).not.toHaveBeenCalled();
      });

      it('should _NOT_ call logRequest if the url configured is not a string and should display an error message', () => {
        riskifiedInstance.track({
          type: trackTypes.SCREEN,
          event: screenTypes.ACCOUNT,
        });

        expect(RiskifiedIntegration.logRequest).not.toHaveBeenCalled();

        expect(utils.logger.error).toHaveBeenCalledWith(
          `[Riskified] - Value specified for screensToLog[${
            screenTypes.ACCOUNT
          }] is not a string: ${typeof options.screensToLog[
            screenTypes.ACCOUNT
          ]}. Aborting logRequest call.`,
        );
      });
    });

    describe('Events', () => {
      it('should call logRequest if there is a url configured for the tracked event', () => {
        riskifiedInstance.track({
          type: trackTypes.TRACK,
          event: eventTypes.CHECKOUT_STARTED,
        });

        expect(RiskifiedIntegration.logRequest).toHaveBeenCalledWith(
          options.eventsToLog[eventTypes.CHECKOUT_STARTED],
        );
      });

      it('should _NOT_ call logRequest if there is _NOT_ a url configured for the tracked event', () => {
        riskifiedInstance.track({
          type: trackTypes.TRACK,
          event: eventTypes.PLACE_ORDER_STARTED,
        });

        expect(RiskifiedIntegration.logRequest).not.toHaveBeenCalled();
      });

      it('should _NOT_ call logRequest if the url configured is not a string and should display an error message', () => {
        riskifiedInstance.track({
          type: trackTypes.TRACK,
          event: eventTypes.PRODUCT_ADDED_TO_CART,
        });

        expect(RiskifiedIntegration.logRequest).not.toHaveBeenCalled();

        expect(utils.logger.error).toHaveBeenCalledWith(
          `[Riskified] - Value specified for eventsToLog[${
            eventTypes.PRODUCT_ADDED_TO_CART
          }] is not a string: ${typeof options.eventsToLog[
            eventTypes.PRODUCT_ADDED_TO_CART
          ]}. Aborting logRequest call.`,
        );
      });

      it('should call logSensitiveDeviceInfo if the event is ORDER_COMPLETED and platform is android', () => {
        Platform.OS = 'android';

        riskifiedInstance.track({
          type: trackTypes.TRACK,
          event: eventTypes.ORDER_COMPLETED,
        });

        expect(RiskifiedIntegration.logSensitiveDeviceInfo).toHaveBeenCalled();

        expect(RiskifiedIntegration.logRequest).not.toHaveBeenCalled();
      });
    });
  });
});
