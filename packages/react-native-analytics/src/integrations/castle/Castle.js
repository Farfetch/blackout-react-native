import CastleReactNative from '@castleio/react-native-castle';
import utils from '@farfetch/blackout-core/analytics/utils';
import { trackTypes } from '@farfetch/blackout-core/analytics';
import { Integration } from '@farfetch/blackout-core/analytics/integrations';
import coreClient from '@farfetch/blackout-core/helpers/client';

export const LOGGER_MESSAGE_PREFIX = 'Castle:';
export const HTTP_CLIENT_ERROR_MESSAGE = `${LOGGER_MESSAGE_PREFIX} Make sure you are passing your HTTP client with the correct header. We strongly advise to use an interceptor to correctly set the Castle.io header as it should be treated as a token instead of a static value.`;

class Castle extends Integration {
  /**
   * Method to check if the integration is ready to be loaded.
   * Since this is a mandatory integration, it will always return true and will not depend on user consent.
   * @static
   *
   * @returns {Boolean} - If the integration is ready to be loaded.
   */
  static shouldLoad() {
    return true;
  }

  /**
   * Method used to create a new Castle instance by analytics.
   *
   * @static
   *
   * @param {object} options - Integration options.
   * @param {object} loadData - analytics' load event data.
   * @param {object} strippedAnalytics - analytics' stripped instance methods.
   *
   * @returns {object} - An instance of Castle class.
   */
  static createInstance(options, loadData, strippedAnalytics) {
    return new Castle(options, loadData, strippedAnalytics);
  }

  /**
   * Creates an instance of Castle.
   *
   * @param {object} options - User configured options.
   * @param {object} loadData - analytics' load event data.
   * @param {object} strippedAnalytics - analytics' stripped instance methods.
   */
  constructor(options, loadData, strippedAnalytics) {
    super(options, loadData, strippedAnalytics);

    // This will allow users to have access to the Castle.io module and perform any project-specific operations with it,
    // by accessing the integration instance via `analytics.integration('castle').castleIO;`
    this.castleIO = CastleReactNative;

    this.lastUserId = null;
    this.isInterceptorAttached = false;
    this.httpClientInterceptor = null;
    this.httpClient = options?.httpClient || coreClient;

    this.initializePromiseResolve = null;
    this.initializePromise = new Promise(initializePromiseResolve => {
      this.initializePromiseResolve = initializePromiseResolve;
    });

    this.initialize(options);
  }

  /**
   * Initialization method that will configure the Castle instance with the options provided to the integration.
   * Calls the configureHttpClient to configure the HTTP client to be used on the project that will be profiled by this integration.
   *
   * @async
   *
   * @param {object} options - User configured options.
   */
  async initialize(options) {
    await this.configureHttpClient(options);

    try {
      await this.castleIO.configure(options?.configureOptions).then(() => {
        if (this.initializePromiseResolve) {
          this.initializePromiseResolve();
          this.initializePromiseResolve = null;
        }
      });
    } catch (error) {
      utils.logger.error(
        `${LOGGER_MESSAGE_PREFIX} Failed to initialize the Castle.io SDK. ${error}`,
      );
    }
  }

  /**
   * Method responsible for setting the correct clientId header to be sent to our services.
   * If passed a custom function to do this job, call it instead of performing the default operation to our core client.
   *
   * @param {object} options - User configured options.
   *
   * @async
   */
  async configureHttpClient(options) {
    // Custom configuration
    const configureHttpClientCustomFn = options?.configureHttpClient;

    if (
      configureHttpClientCustomFn &&
      typeof configureHttpClientCustomFn !== 'function'
    ) {
      utils.logger.error(
        `${LOGGER_MESSAGE_PREFIX} TypeError: "configureHttpClient" is not a function. Make sure you are passing a valid function via the integration's options.`,
      );

      return;
    }

    if (configureHttpClientCustomFn) {
      try {
        await configureHttpClientCustomFn(this.castleIO);

        this.isInterceptorAttached = true;
      } catch (error) {
        utils.logger.error(
          `${LOGGER_MESSAGE_PREFIX} There was an error trying to execute the "configureHttpClient" custom function. ${error}`,
        );

        this.isInterceptorAttached = false;
      }

      return;
    }

    // Default configuration of our @farfetch/blackout-core client (axios) using an interceptor.
    // Store the interceptor on the instance in case the user wants to remove it.
    this.httpClientInterceptor = this.httpClient?.interceptors?.request?.use(
      this.onBeforeRequestFullfil,
      null,
    );
  }

  /**
   * Method that will enable screen tracking.
   *
   * @param {object} data - Event data provided by analytics.
   *
   * @async
   */
  async track(data) {
    if (data.type === trackTypes.SCREEN) {
      await this.castleIO.screen(data.event);
    }
  }

  /**
   * Callback that is used on the Axios interceptor to add the correct Castle.io token header.
   *
   * @async
   *
   * @param {object} config - Axios config object.
   *
   * @returns {Promise<AxiosConfig>} - The modified Axios config object.
   */
  onBeforeRequestFullfil = async config => {
    await this.initializePromise;

    let headerName = '';
    let headerValue = '';

    // @TODO: remove this option when we no longer support the clientId header on our backend.
    if (this.options?.useLegacyHeader) {
      headerName = await this.castleIO.clientIdHeaderName();
      headerValue = await this.castleIO.clientId();
    } else {
      headerName = await this.castleIO.requestTokenHeaderName();
      headerValue = await this.castleIO.createRequestToken();
    }

    config.headers[headerName] = headerValue;

    this.isInterceptorAttached = true;

    return config;
  };

  /**
   * Handles when the onSetUser is called on the analytics side. Logs when a login occurs and sets both the ID and user traits.
   *
   * @async
   *
   * @param {object} data - Event data provided by analytics.
   */
  async onSetUser(data) {
    await this.initializePromise;

    if (!this.httpClient || !this.isInterceptorAttached) {
      utils.logger.error(HTTP_CLIENT_ERROR_MESSAGE);

      return;
    }

    const userData = data?.user || {};
    const userId = userData.id;
    const traits = userData.traits;
    const isGuest = traits?.isGuest;

    // If for some reason there was a call to `analytics.onSetUser()` that receives the same user id, ignore it.
    if (userId === this.lastUserId) {
      return;
    }

    try {
      // Login - Let Castle identify the user.
      if (userId && !isGuest) {
        await this.castleIO.identify(userId, traits);
        await this.castleIO.secure(userId);
      } else {
        // Logout
        await this.castleIO.reset();
      }
    } catch (error) {
      utils.logger.error(
        `${LOGGER_MESSAGE_PREFIX} Failed to track the user login/logout with the Castle.io SDK. ${error}`,
      );
    }

    this.lastUserId = userId;
  }
}

export default Castle;
