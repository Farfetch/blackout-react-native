import get from 'lodash/get';
import pick from 'lodash/pick';
import {
  trackTypes as analyticsTrackTypes,
  utils,
} from '@farfetch/blackout-core/analytics';
import Integration from '../integration';
import { buildMapper, formatEvent, formatUserTraits } from './utils';
import { eventsMapper } from './mapper';
import { LOGIN_METHOD, USER_PROPERTIES } from './constants';

let firebaseAnalytics;

try {
  firebaseAnalytics = require('@react-native-firebase/analytics').default;
} catch (er) {
  firebaseAnalytics = null;
}

function checkRNFirebaseAnalyticsInstalled() {
  if (!firebaseAnalytics) {
    throw new Error(
      '[FirebaseAnalytics]: "@react-native-firebase/analytics" package is not installed. Please, make sure you have this dependency installed before using this integration.',
    );
  }
}
class FirebaseAnalytics extends Integration {
  /**
   * Creates an instance of firebase Analytics integration (Google Analytics).
   * Will throw an error if the peer dependency @react-native-firebase/analytics
   * is not installed.
   *
   * @throws
   *
   * @param {Object} options - User configured options.
   * @param {Object} loadData - Analytics' load event data.
   *
   * @memberof FirebaseAnalytics#
   */
  constructor(options, loadData) {
    checkRNFirebaseAnalyticsInstalled();

    super(options, loadData);

    this.lastUserId = null;

    this.eventsMapper = buildMapper(options, eventsMapper, 'eventsMapper');

    this.onSetUser(loadData, options);
  }

  /**
   * Method to check if the integration is ready to be loaded.
   *
   * @static
   *
   * @param {Object} consent - The consent object representing the user preferences.
   *
   * @returns {Boolean} - If the integration is ready to be loaded.
   *
   * @memberof FirebaseAnalytics
   */
  static shouldLoad(consent) {
    return !!consent && !!consent.statistics;
  }

  /**
   * Method used to create a new FirebaseAnalytics instance by analytics.
   *
   * @static
   *
   * @param {Object} options - Integration options.
   * @param {Object} loadData - Analytics' load event data.
   *
   *
   * @returns {Object} - An instance of FirebaseAnalytics class.
   *
   * @memberof FirebaseAnalytics
   */
  static createInstance(options, loadData) {
    return new FirebaseAnalytics(options, loadData);
  }

  /**
   * Handles when the onSetUser is called on the analytics side. Logs when a login occurs and sets both the ID and user traits.
   * If a custom "onSetUser" function is passed via the integrations's options, call it instead.
   *
   * @async
   *
   * @param {Object} data - Event data provided by analytics.
   *
   * @returns {Promise<FirebaseAnalytics>} - Promise to be solved by the caller.
   *
   * @memberof FirebaseAnalytics#
   */
  async onSetUser(data, options) {
    const customOnSetUser = get(options, 'onSetUser');

    if (customOnSetUser && typeof customOnSetUser !== 'function') {
      utils.logger.error(
        '[FirebaseAnalytics] TypeError: "onSetUser" is not a function. If you are passing a custom "onSetUser" property to the integration, make sure you are passing a valid function.',
      );

      return this;
    }

    if (customOnSetUser) {
      await customOnSetUser(data);

      return this;
    }

    const user = get(data, 'user', { traits: {} });
    const userId = get(user, 'id', '');
    const traits = user.traits;
    const isGuest = user.traits.isGuest;

    // Handle cases where the `onSetUser` is called multiple times with the same user ID - skip when it happens.
    if (this.lastUserId === userId) {
      return this;
    }

    if (userId && !isGuest) {
      await firebaseAnalytics().logLogin({ method: LOGIN_METHOD });
      await firebaseAnalytics().setUserId(userId.toString());
      await firebaseAnalytics().setUserProperties(
        formatUserTraits(pick(traits, USER_PROPERTIES)),
      );
    } else if (isGuest) {
      await firebaseAnalytics().setUserId(null);
      await firebaseAnalytics().setUserProperties({});
    }

    this.lastUserId = userId;

    return this;
  }

  /**
   * Extension of the track method to handle both screens and events trackings.
   *
   * @async
   *
   * @param {Object} data - Event data provided by analytics.
   *
   * @memberof FirebaseAnalytics#
   *
   * @returns {Promise<FirebaseAnalytics>} - Promise to be solved by the caller.
   */
  async track(data) {
    switch (data.type) {
      case analyticsTrackTypes.SCREEN:
        return await this.trackScreen(data);

      case analyticsTrackTypes.TRACK:
        return await this.trackEvent(data);

      default:
        break;
    }

    return this;
  }

  /**
   * Sets the current screen name.
   *
   * @async
   *
   * @param {Object} data - Event data provided by analytics.
   *
   * @memberof FirebaseAnalytics#
   */
  async trackScreen(data) {
    const screenName = data.event;

    await firebaseAnalytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  }

  /**
   * Tracks an event. Tries to get the method from the `eventsMapper`. If not available, uses the .logEvent() method.
   *
   * @async
   *
   * @param {Object} data - Event data provided by analytics.
   *
   * @memberof FirebaseAnalytics#
   *
   * @returns {Promise<FirebaseAnalytics>} - Promise to be solved by the caller.
   */
  async trackEvent(data) {
    const event = get(data, 'event');
    const eventMapperFn = this.eventsMapper[event];

    if (!eventMapperFn) {
      return this;
    }

    if (typeof eventMapperFn !== 'function') {
      utils.logger.error(
        `[FirebaseAnalytics] TypeError: Event mapping for event "${event}" is not a function. If you're passing a custom event mapping for this event, make sure a function is passed.`,
      );

      return this;
    }

    const { method, properties } = eventMapperFn(data) || {};

    if (properties && typeof properties !== 'object') {
      utils.logger.error(
        `[FirebaseAnalytics] TypeError: The properties passed for event ${event} is not an object. If you are passing a custom event mapping for this event, make sure you return a valid object under "properties" key.`,
      );

      return this;
    }

    if (method) {
      const firebaseAnalyticsMethod = firebaseAnalytics()[method];

      if (!firebaseAnalyticsMethod) {
        utils.logger.error(
          `[FirebaseAnalytics] Method "${method}" is not defined. If you are passing a custom event mapping, make sure you return a supported Firebase Analytics event.`,
        );

        return this;
      }

      await firebaseAnalytics()[method](properties);

      return this;
    }

    await firebaseAnalytics().logEvent(formatEvent(event), properties);

    return this;
  }
}

export default FirebaseAnalytics;
