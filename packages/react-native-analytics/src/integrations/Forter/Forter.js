import { Platform } from 'react-native';

import defaultTo from 'lodash/defaultTo';
import get from 'lodash/get';
import merge from 'lodash/merge';

import {
  eventTypes,
  integrations,
  trackTypes as analyticsTrackTypes,
  trackTypes,
  utils,
} from '@farfetch/blackout-core/analytics';

import { formatTrackEvent } from '@farfetch/blackout-core/analytics/integrations/Omnitracking/omnitracking-helper';
import { postTrackings } from '@farfetch/blackout-core/analytics/integrations/Omnitracking/client';

import defaultNavigationCommandBuilder from './utils/defaultNavigationCommandBuilder';
import defaultActionCommandBuilder from './utils/defaultActionCommandBuilder';

import {
  FORTER_TOKEN_ID,
  FORTER_TOKEN_LOADED_ANALYTICS_EVENT,
  OPTION_ACTION_EVENT_HANDLERS,
  OPTION_ON_SET_USER_HANDLER,
  OPTION_ORIGIN,
  OPTION_NAVIGATION_EVENT_HANDLERS,
  OPTION_SITE_ID,
  USER_AGENT,
} from './constants';

let forterSDK;
let ForterAccountType;

try {
  const reactNativeForter = require('react-native-forter');
  forterSDK = reactNativeForter.forterSDK;
  ForterAccountType = reactNativeForter.ForterAccountType;
} catch (er) {
  forterSDK = null;
  ForterAccountType = null;
}

function checkRNForterInstalled() {
  if (!forterSDK) {
    throw new Error(
      '[Forter]: "react-native-forter" package is not installed. Please, make sure you have this dependency installed before using this integration.',
    );
  }
}

/**
 * Forter integration for analytics that uses react-native-forter to communicate
 * events to Forter servers.
 *
 * @example <caption>Adding Forter integration to analytics</caption>
 *
 * import analytics, { integrations } from '@farfetch/blackout-react-native-analytics';
 *
 * analytics.addIntegration('forter', integrations.Forter, {
 *   siteId: '<site_id>', //required
 *   origin: '<domain>'   //optional, but helps in debugging issues
 * });
 *
 * @module Forter
 * @category Analytics
 * @subcategory Integrations
 */
class Forter extends integrations.Integration {
  /**
   * Creates an instance of Forter integration.
   * Will throw an error if the peer dependency react-native-forter
   * is not installed.
   *
   * @throws
   *
   * @param {object} options - User configured options.
   * @param {object} loadData - analytics's load event data.
   * @param {object} analytics - Stripped down analytics instance with helper methods.
   */
  constructor(options, loadData, analytics) {
    checkRNForterInstalled();

    const safeOptions = defaultTo(options, {});

    super(safeOptions, loadData, analytics);

    this.currentUserData = null;

    this.initialize(options);

    const userId = get(loadData, 'user.id');

    //We just want to call onSetUser on the constructor if we
    //have user info available
    if (userId) {
      this.onSetUser(loadData);
    }
  }

  /**
   * Method to check if the integration is ready to be loaded.
   *
   * @returns {boolean} - Will always return true as this integration will be required.
   */
  static shouldLoad() {
    return true;
  }

  /**
   * Method used to create a new Forter instance by analytics.
   *
   * @param {object} options - Integration options.
   * @param {object} loadData - analytics's load event data.
   * @param {object} analytics - Stripped down analytics instance with helper methods.
   *
   * @returns {Forter} - An instance of Forter class.
   */
  static createInstance(options, loadData, analytics) {
    return new Forter(options, loadData, analytics);
  }

  /**
   * Extension of the track method to handle both screens and events trackings.
   *
   * @param {object} data - Event data provided by analytics.
   *
   * @returns {Promise<Forter>} - Promise that will be resolved with the instance on which it was called.
   */
  async track(data) {
    await this.onForterSdkLoadedPromise;

    switch (data.type) {
      case analyticsTrackTypes.SCREEN:
        return this.trackScreen(data);

      case analyticsTrackTypes.TRACK:
        return this.trackAction(data);

      default:
        break;
    }

    return this;
  }

  /**
   * Tracks a screen view.
   *
   * @param {object} data - Event data provided by analytics.
   */
  trackScreen(data) {
    const eventHandledByUser = this.tryCustomEventHandlerForEvent(data);

    if (!eventHandledByUser) {
      this.defaultEventHandler(data);
    }
  }

  /**
   * Tracks an action.
   *
   * @param {object} data - Event data provided by analytics.
   */
  trackAction(data) {
    const eventHandledByUser = this.tryCustomEventHandlerForEvent(data);

    if (!eventHandledByUser) {
      this.defaultEventHandler(data);
    }
  }

  /**
   * Checks if there is a custom event handler that can handle the event and
   * executes the handler if available.
   *
   * @param {object} data - Event data provided by analytics.
   *
   * @returns {boolean} - True if a custom handler was found and invoked, false otherwise.
   */
  tryCustomEventHandlerForEvent(data) {
    const { type: trackType, event } = data;

    const eventTypeDescription =
      trackType === analyticsTrackTypes.SCREEN ? 'screen' : 'event';

    const customEventHandlersOption =
      trackType === trackTypes.SCREEN
        ? OPTION_NAVIGATION_EVENT_HANDLERS
        : OPTION_ACTION_EVENT_HANDLERS;

    const customEventHandlers = get(
      this.options,
      `${customEventHandlersOption}`,
    );

    let customEventHandler = get(customEventHandlers, `${event}`);

    if (!customEventHandler) {
      return false;
    }

    if (typeof customEventHandler !== 'function') {
      utils.logger.error(
        `[ForterIntegration] - Invalid event handler value received for ${eventTypeDescription} '${event}'. It must be a function but received '${typeof customEventHandler}'`,
      );

      return true;
    }

    try {
      customEventHandler(data, forterSDK);
    } catch (e) {
      utils.logger.error(
        `[ForterIntegration] - An error occurred when trying to execute custom event handler for ${eventTypeDescription} '${event}': ${e}`,
      );
    }

    return true;
  }

  /**
   * Default event handler for both screen and track types of events.
   * Will only be called if there is not a custom event handler available.
   *
   * @param {object} data - Event data provided by analytics.
   */
  defaultEventHandler(data) {
    const { type: trackType, event } = data;

    const defaultCommandBuilder =
      trackType === trackTypes.SCREEN
        ? defaultNavigationCommandBuilder
        : defaultActionCommandBuilder;

    const command = defaultCommandBuilder(data);

    this.dispatchCommand(command, event, trackType);
  }

  /**
   * Dispatches the passed in command structure to the forterSDK instance.
   * If the method specified by the command is not found on the forterSDK instance,
   * an error will be logged.
   *
   * @param {object} command - Command description to execute.
   * @param {string} command.method - The name of the method of the forterSDK instance to invoke.
   * @param {string} command.args - Additional arguments to pass to the method.
   * @param {string} eventName - The name of the event being processed (data.event property).
   * @param {string} trackType - The type of the event that was tracked.
   */
  dispatchCommand(command, eventName, trackType) {
    const eventTypeDescription =
      trackType === analyticsTrackTypes.SCREEN ? 'screen' : 'event';

    if (!command) {
      utils.logger.warn(
        `[ForterIntegration] - No action taken for ${eventTypeDescription} '${eventName}'`,
      );

      return;
    }

    const forterMethod = forterSDK[command.method];

    if (!forterMethod || typeof forterMethod !== 'function') {
      utils.logger.error(
        `[ForterIntegration] - Invalid forter method '${command.method}' specified from command builder for ${eventTypeDescription} '${eventName}'.`,
      );

      return;
    }

    forterMethod.apply(forterSDK, [...command.args]);
  }

  /**
   * Initializes this instance.
   * First, it will perform a validation of the user configured options
   * and then will start the forterSDK instance.
   */
  initialize() {
    this.validateOptions();

    this.initializeForterSdk();
  }

  /**
   * Validates the user defined options.
   * It will throw an error if siteId is not specified.
   * Other configuration errors will only log an error to the console.
   *
   * @throws
   */
  validateOptions() {
    const {
      [OPTION_ORIGIN]: origin,
      [OPTION_SITE_ID]: siteId,
      [OPTION_NAVIGATION_EVENT_HANDLERS]: navigationEventHandlers,
      [OPTION_ACTION_EVENT_HANDLERS]: actionEventHandlers,
      [OPTION_ON_SET_USER_HANDLER]: customOnSetUserHandler,
    } = this.options;

    if (!siteId) {
      throw new Error(
        `[ForterIntegration] - Missing required '${OPTION_SITE_ID}' parameter in options.`,
      );
    }

    if (!origin) {
      utils.logger.warn(
        `[ForterIntegration] - '${OPTION_ORIGIN}' parameter was not provided in options. It's advisable to provide an ${OPTION_ORIGIN} option to aid in debugging`,
      );
    }

    if (origin && typeof origin !== 'string') {
      throw new TypeError(
        `[ForterIntegration] - '${OPTION_ORIGIN}' parameter must be a string but received '${typeof origin}'`,
      );
    }

    if (
      navigationEventHandlers &&
      typeof navigationEventHandlers !== 'object'
    ) {
      throw new TypeError(
        `[ForterIntegration] - '${OPTION_NAVIGATION_EVENT_HANDLERS}' parameter must be an object but received '${typeof navigationEventHandlers}'`,
      );
    }

    if (actionEventHandlers && typeof actionEventHandlers !== 'object') {
      throw new TypeError(
        `[ForterIntegration] - '${OPTION_ACTION_EVENT_HANDLERS}' parameter must be an object but received '${typeof actionEventHandlers}'`,
      );
    }

    if (
      customOnSetUserHandler &&
      typeof customOnSetUserHandler !== 'function'
    ) {
      throw new TypeError(
        `[ForterIntegration] - '${OPTION_ON_SET_USER_HANDLER}' parameter must be a function but received '${typeof customOnSetUserHandler}'`,
      );
    }
  }

  /**
   * Initializes the forterSDK instance.
   * First, it will obtain a device unique id and then use it to call
   * the forterSDK's init method.
   *
   * @returns {Promise} Promise that will be resolved when the forterSDK is initialised.
   */
  async initializeForterSdk() {
    this.onForterSdkLoadedPromise = new Promise(resolve => {
      this.resolveOnForterSdkLoadedPromise = resolve;
    });

    //Gets the device unique id
    //That is what will be used as the forter token
    forterSDK.getDeviceUniqueID(deviceID => {
      this.currentDeviceId = deviceID;

      forterSDK.init(
        this.options.siteId,
        deviceID,
        async () => {
          utils.logger.info(
            '[ForterIntegration] - forterSDK initialization was successfull. Mobile DeviceId: ',
            deviceID,
          );

          this.resolveOnForterSdkLoadedPromise();
          this.resolveOnForterSdkLoadedPromise = null;
        },
        errorResult => {
          utils.logger.error(
            '[ForterIntegration] - forterSDK initialization failed. Error: ' +
              errorResult,
          );
        },
      );
    });
  }

  /**
   * Responsible for sending the loaded forter token to Omnitracking.
   * Needs to wait for a user to be set in analytics by analytics.setUser method
   * in order to have the `customerId` parameter filled as it is a required
   * parameter by Omnitracking.
   *
   * @param {string} forterToken - String representing the loaded forter token.
   *
   * @returns {Promise} Promise that will be resolved when the user is set in analytics and the Omnitracking message is built.
   */
  async sendForterTokenLoadedEventForOmnitracking(forterToken) {
    const omnitrackingMessage = await this.getForterTokenLoadedEventPayload(
      forterToken,
    );

    await postTrackings(omnitrackingMessage);
  }

  /**
   * Generates an Omnitracking message as specified by the documentation
   * in order to be posted to Omnitracking and thus, obtain the reference
   * to the forter token for this session.
   *
   * @param {string} forterToken - String representing the loaded forter token.
   *
   * @returns {Promise} Promise that will be resolved when the Omnitracking message is built.
   */
  async getForterTokenLoadedEventPayload(forterToken) {
    const forterTokenLoadedEventData = await this.createSyntheticForterTokenLoadedEvent();

    const additionalParameters = {
      tid: FORTER_TOKEN_ID,
      val: JSON.stringify({
        forterTokenCookie: forterToken,
        origin: get(this.options, OPTION_ORIGIN, 'NOT_DEFINED'),
        userAgent: `${USER_AGENT} - ${Platform.OS}`, // User agent does not make sense in mobile apps, so just send 'React Native' plus OS
      }),
    };

    const payload = formatTrackEvent(
      forterTokenLoadedEventData,
      additionalParameters,
    );

    return payload;
  }

  /**
   * Creates a synthetic analytics event representing a track of
   * the forter loaded event in order to be used
   * in calls to omnitracking-helper functions.
   *
   * @returns {Promise} Promise that will be resolved when analytics creates an event.
   */
  async createSyntheticForterTokenLoadedEvent() {
    const syntheticEventData = await this.strippedDownAnalytics.createEvent(
      trackTypes.TRACK,
      FORTER_TOKEN_LOADED_ANALYTICS_EVENT,
    );

    return syntheticEventData;
  }

  /**
   * Handles onSetUser event from analytics.
   * First it will await for the forterSDK to be initialised, so it is safe
   * to access the forterSDK methods. Then, it checks if the localId of the user
   * has changed. If it does, an Omnitracking message is dispatched to associate
   * the localId (aka correlationId) with the device unique id obtained from
   * forterSDK.getDeviceUniqueID. This is necessary so that when an order is
   * performed by the user and the order's processing system needs to check the
   * order with Forter for fraud purposes, it can associate the forter events
   * generated by the user when using the app with the order being sent.
   * This will allow Forter to make a better decision if the order is fraudulent or not.
   *
   * After that, if the user specifies a custom onSetUser handler, it will delegate to that handler.
   * If not, it will first call the forterSDK's setAccountIdentifier method to set the userId with Forter
   * and then try to register a login/logout event if the user logged in status changes.
   * It is safe to execute this function multiple times.
   *
   * @returns {Promise} Promise that will be resolved when the event is handled.
   */
  async onSetUser(data) {
    const previousUserData = this.currentUserData;

    this.currentUserData = merge({}, data);

    await this.onForterSdkLoadedPromise;

    const localId = get(data, 'user.localId', null);
    const previousLocalId = get(previousUserData, 'user.localId', null);
    const userId = get(data, 'user.id', null);

    if (previousLocalId !== localId) {
      try {
        await this.sendForterTokenLoadedEventForOmnitracking(
          this.currentDeviceId,
        );
      } catch (e) {
        utils.logger.error(
          `[ForterIntegration] - An error occurred when trying to send forter token to Omnitracking for userId '${userId}': ${e}`,
        );
      }
    }

    const customOnSetUserHandler = this.options[OPTION_ON_SET_USER_HANDLER];

    if (customOnSetUserHandler) {
      customOnSetUserHandler(data, forterSDK);
      return;
    }

    const isGuest = get(data, 'user.traits.isGuest', true);

    let accountIdentifier;

    const previousUserId = get(previousUserData, 'user.id', null);
    const previousIsGuest = get(previousUserData, 'user.traits.isGuest', true);

    let actionTypeToTrigger = null;

    if (previousIsGuest && !isGuest) {
      // Account identifiers must be a string in Forter SDK
      // and userId is a number
      accountIdentifier = `${userId}`;
      actionTypeToTrigger = eventTypes.LOGIN;
    } else if (!previousIsGuest && isGuest) {
      // Account identifier must be an empty string on user logout
      // as specified here
      // https://portal.forter.com/docs/android/android_content/unique_identifiers/unique_identifiers
      accountIdentifier = '';
      actionTypeToTrigger = eventTypes.LOGOUT;
    }

    if (!actionTypeToTrigger) {
      return;
    }

    //
    forterSDK.setAccountIdentifier(
      accountIdentifier,
      ForterAccountType.MERCHANT,
    );

    const actionEventData = await this.strippedDownAnalytics.createEvent(
      trackTypes.TRACK,
      actionTypeToTrigger,
      actionTypeToTrigger === eventTypes.LOGIN
        ? { userId, localId }
        : { userId: previousUserId, localId: previousLocalId },
    );

    this.defaultEventHandler(actionEventData);
  }
}

export default Forter;
