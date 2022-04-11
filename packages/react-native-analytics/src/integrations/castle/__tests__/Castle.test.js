import CastleReactNativeIntegration, {
  LOGGER_MESSAGE_PREFIX,
  HTTP_CLIENT_ERROR_MESSAGE,
} from '../';
import Integration from '../../integration';
import CastleIO from '@castleio/react-native-castle';
import coreClient from '@farfetch/blackout-core/helpers/client';
import utils from '@farfetch/blackout-core/analytics/utils';

const mockRequestHeaderName = 'castle-header-foo';
const mockRequestHeaderValue = '12342342345241342423424';
jest.mock('@castleio/react-native-castle', () => {
  return {
    ...jest.requireActual('@castleio/react-native-castle'),
    configure: jest.fn(() => Promise.resolve()),
    requestTokenHeaderName: async () => Promise.resolve(mockRequestHeaderName),
    createRequestToken: async () => Promise.resolve(mockRequestHeaderValue),
    identify: jest.fn(() => Promise.resolve()),
    reset: jest.fn(() => Promise.resolve()),
  };
});

jest.mock('@farfetch/blackout-core/analytics/utils', () => ({
  ...jest.requireActual('@farfetch/blackout-core/analytics/utils'),
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockIntegrationOptions = {
  httpClient: {
    defaults: {
      headers: {
        common: {},
      },
    },
  },
  configureHttpClient: jest.fn(),
};
const getIntegrationInstance = async customOptions => {
  const instance = CastleReactNativeIntegration.createInstance(
    customOptions || mockIntegrationOptions,
  );

  await instance.initialize();

  return instance;
};

describe('Castle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Integration', () => {
    it('should extend the default Integration class', async () => {
      const instance = await getIntegrationInstance();

      expect(instance).toBeInstanceOf(CastleReactNativeIntegration);
      expect(instance).toBeInstanceOf(Integration);
    });

    it('should not depend on the consent to be loaded (required)', () => {
      expect(CastleReactNativeIntegration.shouldLoad()).toBe(true);
      expect(CastleReactNativeIntegration.shouldLoad(null)).toBe(true);
      expect(
        CastleReactNativeIntegration.shouldLoad({
          statistics: false,
          marketing: false,
          preferences: false,
        }),
      ).toBe(true);
    });
  });

  describe('Instance', () => {
    it('should have a property referring the Castle.io instance', async () => {
      const instance = await getIntegrationInstance();

      expect(instance.castleIO).toBe(CastleIO);
    });

    describe('HTTP client', () => {
      it('should have the default one assigned if none passed', async () => {
        const instance = CastleReactNativeIntegration.createInstance({});

        await instance.initialize();

        expect(instance.httpClient).toEqual(coreClient);
      });

      it('should allow to pass a custom "httpClient" and "configureHttpClient" function', async () => {
        const instance = await getIntegrationInstance(); // already called with custom options, no need to create custom ones

        expect(mockIntegrationOptions.configureHttpClient).toHaveBeenCalledWith(
          instance.castleIO,
        );
      });

      it('should log an error if a invalid "configureHttpClient" option is passed', async () => {
        await getIntegrationInstance({
          configureHttpClient: 'foo',
        });

        expect(utils.logger.error).toHaveBeenCalledWith(
          `${LOGGER_MESSAGE_PREFIX} TypeError: "configureHttpClient" is not a function. Make sure you are passing a valid function via the integration's options.`,
        );
      });

      it('should log an error if an error occurs on "configureHttpClient" custom function', async () => {
        const error = 'this is an error';
        await getIntegrationInstance({
          configureHttpClient: () => {
            throw new Error(error);
          },
        });

        expect(utils.logger.error).toHaveBeenCalledWith(
          `${LOGGER_MESSAGE_PREFIX} There was an error trying to execute the "configureHttpClient" custom function. Error: ${error}`,
        );
      });

      it('should set the correct header with the correct name to the HTTP client (axios interceptor fullfil callback)', async () => {
        const instance = await getIntegrationInstance({});

        expect(instance.httpClientInterceptor).toBeDefined();

        const config = await instance.onBeforeRequestFullfil({ headers: {} });

        expect(config).toEqual({
          headers: {
            [mockRequestHeaderName]: mockRequestHeaderValue,
          },
        });

        expect(instance.isInterceptorAttached).toBe(true);
      });
    });

    describe('Initialization', () => {
      it('should call the .configure method of castle with the provided options', async () => {
        const castleOptions = {
          configureOptions: {
            publishableKey: '123123',
            debugLoggingEnabled: true,
            flushLimit: 1,
            maxQueueLimit: 1,
            baseURLAllowList: [],
          },
        };
        const instance = await getIntegrationInstance({
          ...mockIntegrationOptions,
          ...castleOptions,
        });

        expect(instance.castleIO.configure).toHaveBeenCalledWith(
          castleOptions.configureOptions,
        );
      });

      it('should handle any errors that may occur when trying to initialize the SDK', async () => {
        const errorMessage = 'this is an error';

        CastleIO.configure.mockImplementationOnce(() => {
          throw new Error(errorMessage);
        });

        await getIntegrationInstance();

        expect(utils.logger.error).toHaveBeenCalledWith(
          `${LOGGER_MESSAGE_PREFIX} Failed to initialize the Castle.io SDK. Error: ${errorMessage}`,
        );
      });
    });

    describe('OnSetUser', () => {
      it('should log an error if there is no httpClient setted nor the interceptor attached', async () => {
        const instance = await getIntegrationInstance();
        instance.httpClient = null;

        await instance.onSetUser();

        expect(utils.logger.error).toHaveBeenCalledWith(
          HTTP_CLIENT_ERROR_MESSAGE,
        );

        utils.logger.error.mockClear();

        instance.isInterceptorAttached = false;

        await instance.onSetUser();

        expect(utils.logger.error).toHaveBeenCalledWith(
          HTTP_CLIENT_ERROR_MESSAGE,
        );
      });

      it('should not call the .identify method if the userId is the same as the last one', async () => {
        const instance = await getIntegrationInstance();
        const userId = 123123;
        const traits = {
          email: 'foo@bar.com',
        };

        await instance.onSetUser({
          user: {
            id: userId,
            traits,
          },
        });

        expect(instance.castleIO.identify).toHaveBeenCalledWith(userId, traits);

        instance.castleIO.identify.mockClear();

        await instance.onSetUser({
          user: {
            id: userId,
            traits,
          },
        });

        expect(instance.castleIO.identify).not.toHaveBeenCalled();
      });

      it('should log an error if the castle.io SDK throws an error while trying to identify the user', async () => {
        const errorMessage = 'this is an error';

        CastleIO.identify.mockImplementationOnce(() => {
          throw new Error(errorMessage);
        });

        const instance = await getIntegrationInstance();

        await instance.onSetUser({
          user: {
            id: 123,
          },
        });

        expect(utils.logger.error).toHaveBeenCalledWith(
          `${LOGGER_MESSAGE_PREFIX} Failed to track the user login/logout with the Castle.io SDK. Error: ${errorMessage}`,
        );
      });

      it('should call .reset method if the user is logging out', async () => {
        const instance = await getIntegrationInstance();
        const userId = 1231;
        const traits = {
          isGuest: true,
        };

        await instance.onSetUser({
          id: userId,
          traits,
        });

        expect(instance.castleIO.reset).toHaveBeenCalled();
      });
    });
  });
});
