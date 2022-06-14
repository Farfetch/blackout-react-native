import {
  trackTypes as analyticsTrackTypes,
  utils,
} from '@farfetch/blackout-core/analytics';
import { buildCustomEventsMapper } from './utils';
import {
  MESSAGE_PREFIX,
  OPTION_EVENTS_MAPPER,
  OPTION_ON_SET_USER_HANDLER,
  OPTION_SCREEN_VIEWS_MAPPER,
  OPTION_SET_CUSTOM_USER_ID_PROPERTY,
} from './constants';
import {
  defaultEventsMapper,
  defaultScreenViewsMapper,
  getVirtualEventsFromEvent,
} from './defaultMappers';
import get from 'lodash/get';
import Integration from '../integration';
import screenTypes from '../../screenTypes';

let firebaseAnalytics;

try {
  firebaseAnalytics = require('@react-native-firebase/analytics').default;
} catch (er) {
  firebaseAnalytics = null;
}

function checkRNFirebaseAnalyticsInstalled() {
  if (!firebaseAnalytics) {
    throw new Error(
      `${MESSAGE_PREFIX} "@react-native-firebase/analytics" package is not installed. Please, make sure you have this dependency installed before using this integration.`,
    );
  }
}

/**
 * Firebase integration which allows tracking events to Google Analytics 4 properties through Google Analytics for Firebase.
 */
class FirebaseAnalytics extends Integration {
  /**
   * Creates an instance of FirebaseAnalytics integration.
   * Will throw an error if the peer dependency @react-native-firebase/analytics
   * is not installed.
   *
   * @throws
   *
   * @param {object} options - User configured options.
   * @param {object} loadData - Analytics' load event data.
   */
  constructor(options, loadData) {
    super(options, loadData);

    checkRNFirebaseAnalyticsInstalled();

    this.initialize(options);
    this.onSetUser(loadData, options);
  }

  /**
   * Method to check if the integration is ready to be loaded.
   *
   * @static
   *
   * @param {object} consent - The consent object representing the user preferences.
   *
   * @returns {boolean} - If the integration is ready to be loaded.
   */
  static shouldLoad(consent) {
    return !!consent && !!consent.statistics;
  }

  /**
   * Method used to create a new FirebaseAnalytics instance by analytics.
   *
   * @static
   *
   * @param {object} options - Integration options.
   * @param {object} loadData - Analytics' load event data.
   *
   * @returns {object} - An instance of FirebaseAnalytics class.
   */
  static createInstance(options, loadData) {
    return new FirebaseAnalytics(options, loadData);
  }

  /**
   * Initializes the integration.
   *
   * @param {object} options - Options object passed to the integration by analytics.
   */
  initialize(options) {
    this.customEventsMapper = buildCustomEventsMapper(
      options,
      OPTION_EVENTS_MAPPER,
    );

    this.customScreenViewsMapper = buildCustomEventsMapper(
      options,
      OPTION_SCREEN_VIEWS_MAPPER,
    );

    this.setCustomUserIdProperty = get(
      options,
      OPTION_SET_CUSTOM_USER_ID_PROPERTY,
      true,
    );
  }

  /**
   * Handles when the onSetUser is called on the analytics side.
   * By default, it will set the user id and "is_guest" and "crm_id" user properties.
   * If a custom 'onSetUser' handler is specified by the user, it will be called after
   * the default user properties are set by this method, which allows the user to override them
   * if it is necessary to.
   *
   * @async
   * @param {object} data - Event data provided by analytics.
   *
   * @returns {Promise<FirebaseAnalytics>} - Promise that will be resolved when the method finishes.
   */
  async onSetUser(data) {
    try {
      const userId = get(data, 'user.id', null);
      const isGuest = get(data, 'user.traits.isGuest', true);

      const firebaseAnalyticsInstance = firebaseAnalytics();

      const customOnSetUser = get(this.options, OPTION_ON_SET_USER_HANDLER);

      if (customOnSetUser && typeof customOnSetUser !== 'function') {
        utils.logger.error(
          `${MESSAGE_PREFIX} TypeError: "${OPTION_ON_SET_USER_HANDLER}" is not a function. If you are passing a custom "${OPTION_ON_SET_USER_HANDLER}" property to the integration, make sure you are passing a valid function.`,
        );

        return this;
      }

      if (customOnSetUser) {
        await customOnSetUser(data, firebaseAnalyticsInstance);

        return this;
      }

      await firebaseAnalyticsInstance.setUserId(
        isGuest ? null : userId.toString(),
      );
      await firebaseAnalyticsInstance.setUserProperties({
        is_guest: isGuest.toString(),
        crm_id:
          isGuest || !this.setCustomUserIdProperty ? null : userId.toString(),
      });
    } catch (error) {
      utils.logger.error(
        `${MESSAGE_PREFIX} An error occurred when trying to process a user changed event: ${error}`,
      );
    }

    return this;
  }

  /**
   * Extension of the track method to handle both screen and event trackings.
   *
   * @async
   *
   * @param {object} data - Event data provided by analytics.
   *
   * @returns {Promise<FirebaseAnalytics>} - Promise to be solved by the caller.
   */
  async track(data) {
    switch (data.type) {
      case analyticsTrackTypes.SCREEN:
        return await this.processScreenEvent(data);

      case analyticsTrackTypes.TRACK:
        return await this.processTrackEvent(data);

      default:
        return this;
    }
  }

  /**
   * Entry point for screen view events processing. Will handle special screen views
   * which need to generate events as well to Firebase instead of only simple screen view events.
   *
   * @param data - Event data provided by analytics.
   *
   * @returns {Promise} Promise that will resolve when the method finishes.
   */
  async processScreenEvent(data) {
    const eventName = get(data, 'event');

    switch (eventName) {
      case screenTypes.BAG:
      case screenTypes.SEARCH:
      case screenTypes.WISHLIST:
        return await Promise.all([
          this.processTrackEvent({ ...data, type: analyticsTrackTypes.TRACK }),
          this.trackScreen(data),
        ]);
      default:
        return await this.trackScreen(data);
    }
  }

  /**
   * Logs a screen view event with Firebase.
   *
   * @async
   *
   * @param {object} data - Event data provided by analytics.
   *
   * @returns {Promise<FirebaseAnalytics>} - Promise that will be resolved with this integration instance.
   */
  async trackScreen(data) {
    const eventMapperFn = this.getEventMapper(data);

    await this.executeEventMapperAndSendEvent(
      data,
      eventMapperFn,
      defaultScreenViewsMapper,
    );

    return this;
  }

  /**
   * Entry point for events processing. Will handle the case of some special events
   * which will generate more than one event for Firebase. For example, a single "PRODUCT_UPDATED"
   * event might generate up to 3 (virtual) events for Firebase depending on the event payload.
   *
   * @param {object} data - Event data provided by analytics.
   *
   * @returns {Promise} Promise that will resolve when the events associated with the event data is resolved.
   */
  async processTrackEvent(data) {
    // Check if event generates virtual events
    const virtualEvents = getVirtualEventsFromEvent(data);

    const hasVirtualEvents =
      Array.isArray(virtualEvents) && virtualEvents.length > 0;

    // If virtual events exist for this event, track them and abort the tracking of the original event
    if (hasVirtualEvents) {
      return await Promise.all(
        virtualEvents.map(virtualEventData =>
          this.trackEvent(virtualEventData),
        ),
      );
    }

    // If no virtual events exist for this event, track the original event
    return await this.trackEvent(data);
  }

  /**
   * Tracks an event by invoking the configured event mapper for the event and using its output
   * to determine the event to be tracked with the @react-native-firebase/analytics instance.
   * If the mapper returns a "method" property from the invocation, it will be used to determine the
   * high-level method of the firebase instance to use to track the event. If "method" is not specified,
   * 'logEvent' method will be used instead and an "event" property must be returned from the mapper.
   *
   * @async
   *
   * @param {object} data - Event data provided by analytics.
   *
   * @returns {Promise<FirebaseAnalytics>} - Promise that will be resolved with this integration instance.
   */
  async trackEvent(data) {
    const eventMapperFn = this.getEventMapper(data);

    await this.executeEventMapperAndSendEvent(
      data,
      eventMapperFn,
      defaultEventsMapper,
    );

    return this;
  }

  /**
   * Gets the event mapper that will map the received event from analytics.
   * Will return either a custom mapper if there is one defined by the user or
   * a default mapper for the event type.
   *
   * @param {object} data - Event data provided by analytics.
   *
   * @returns {*} A custom wrapper for the event if defined or the default mapper otherwise.
   */
  getEventMapper(data) {
    const type = get(data, 'type');
    const event = get(data, 'event');

    const customMapperDefinitions =
      type === analyticsTrackTypes.SCREEN
        ? this.customScreenViewsMapper
        : this.customEventsMapper;

    if (Object.prototype.hasOwnProperty.call(customMapperDefinitions, event)) {
      return customMapperDefinitions[event];
    }

    return type === analyticsTrackTypes.SCREEN
      ? defaultScreenViewsMapper
      : defaultEventsMapper;
  }

  /**
   * Executes event mapper for the tracked event/screen and apply the output
   * to firebase analytics instance.
   *
   * @param {object}          data           - Event data provided by analytics.
   * @param {function}        eventMapperFn  - Event mapper function.
   * @param {function}        defaultMapper  - Default event mapper function.
   * @returns {Promise<void>} Promise that will return when firebase analytics instance method is executed.
   */
  async executeEventMapperAndSendEvent(data, eventMapperFn, defaultMapper) {
    const event = get(data, 'event');
    const type = get(data, 'type');
    const eventTypeDescription =
      type === analyticsTrackTypes.SCREEN ? 'screen view' : 'event';

    if (eventMapperFn) {
      if (typeof eventMapperFn !== 'function') {
        utils.logger.error(
          `${MESSAGE_PREFIX} TypeError: Mapper for ${eventTypeDescription} "${event}" is not a function. If you're passing a custom mapper for this ${eventTypeDescription}, make sure a function is passed.`,
        );

        return;
      }
    }

    const { method, event: firebaseEvent, properties } =
      eventMapperFn(data, defaultMapper) || {};

    if (properties && typeof properties !== 'object') {
      utils.logger.error(
        `${MESSAGE_PREFIX} TypeError: The properties passed for ${eventTypeDescription} "${event}" is not an object. If you are passing a custom mapper for this ${eventTypeDescription}, make sure you return a valid object under "properties" key.`,
      );

      return;
    }

    if (method && method !== 'logEvent') {
      const firebaseAnalyticsMethod = firebaseAnalytics()[method];

      if (!firebaseAnalyticsMethod) {
        utils.logger.error(
          `${MESSAGE_PREFIX} Received invalid method "${method}" for ${eventTypeDescription} "${event}". If you are passing a custom mapper, make sure you return a supported Firebase Analytics method.`,
        );

        return;
      }

      await firebaseAnalytics()[method](properties);

      return this;
    } else if (firebaseEvent) {
      // 'logEvent' will be used by default only if there is a corresponding event to track
      await firebaseAnalytics().logEvent(firebaseEvent, properties);
    }
  }
}

export default FirebaseAnalytics;
