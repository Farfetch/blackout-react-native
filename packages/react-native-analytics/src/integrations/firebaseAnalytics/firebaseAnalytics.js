import get from 'lodash/get';
import pick from 'lodash/pick';
import firebaseAnalytics from '@react-native-firebase/analytics';
import {
  integrations,
  trackTypes as analyticsTrackTypes,
  utils,
} from '@farfetch/blackout-core/analytics';
import { buildMapper, formatEvent, formatUserTraits } from './utils';
import { eventsMapper } from './mapper';
import { LOGIN_METHOD, USER_PROPERTIES } from './constants';

class FirebaseAnalytics extends integrations.Integration {
  /**
   * Creates an instance of firebase Analytics integration (Google Analytics).
   *
   * @param {Object} options - User configured options.
   * @param {Object} loadData - analytics's load event data.
   *
   * @memberof FirebaseAnalytics#
   */
  constructor(options, loadData) {
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
   * @param {Object} loadData - analytics's load event data.
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
        'Firebase Analytics - TypeError: "onSetUser" is not a function. If you are passing a custom "onSetUser" property to the integration, make sure you are passing a valid function.',
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
        `Firebase Analytics - TypeError: Event mapping for event "${event}" is not a function.
        If you're passing a custom event mapping for this event, make sure a function is passed.`,
      );

      return this;
    }

    const { method, properties } = eventMapperFn(data) || {};

    if (properties && typeof properties !== 'object') {
      utils.logger.error(
        `Firebase Analytics - TypeError: The properties passed for event ${event} is not an object. If you are passing a custom event mapping for this event,
        make sure you return a valid object under "properties" key.`,
      );

      return this;
    }

    if (method) {
      const firebaseAnalyticsMethod = firebaseAnalytics()[method];

      if (!firebaseAnalyticsMethod) {
        utils.logger.error(
          `Firebase analytics method "${firebaseAnalyticsMethod}" it not defined. If you are passing a custom event mapping, make sure you return a supported Firebase Analytics event.`,
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
