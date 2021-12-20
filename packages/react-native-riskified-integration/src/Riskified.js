import {
  eventTypes,
  integrations,
  trackTypes,
  utils,
} from '@farfetch/blackout-react-native-analytics';
import { NativeModules, Platform } from 'react-native';
import get from 'lodash/get';

const { RiskifiedIntegration } = NativeModules;
export default class Riskified extends integrations.Integration {
  /**
   * Returns true due to being a required integration - No need to check for consent.
   *
   * @static
   *
   * @returns {Boolean} - Will return true to force loading of the integration.
   *
   * @memberof Riskified
   */
  static shouldLoad() {
    return true;
  }

  /**
   * Method used to create a new Riskified instance by analytics.
   *
   * @static
   *
   * @param {Object} options  - Integration options.
   * @param {Object} loadData - Analytics' load event data.
   *
   * @returns {Object}        - An instance of Riskified class.
   *
   * @memberof Riskified
   */
  static createInstance(options, loadData) {
    return new Riskified(options, loadData);
  }

  /**
   * Creates an instance of Riskified and starts the beacon if the
   * necessary data is provided.
   *
   * @param {Object} options - Custom options for the integration.
   * @param {Object} loadData - Analytics' load event data.
   *
   * @memberof Riskified#
   */
  constructor(options, loadData) {
    super(options, loadData);

    this.initialize(loadData);
  }

  /**
   * Validates options passed to the integration and call startBeacon of the
   * native module RiskifiedIntegration with the correct parameters
   *
   * @param {Object} loadData - Load data provided by analytics
   *
   * @memberof Riskified#
   */
  initialize(loadData) {
    const { shopName, token, eventsToLog, screensToLog } = this.options;

    if (!shopName || typeof shopName !== 'string') {
      throw new Error(
        'Failed to initialize riskified integration: `shopName` option was not provided with a valid value',
      );
    }

    const eventsToLogLength =
      typeof eventsToLog === 'object' ? Object.keys(eventsToLog).length : 0;
    const screensToLogLength =
      typeof screensToLog === 'object' ? Object.keys(screensToLog).length : 0;

    if (!eventsToLogLength && !screensToLogLength) {
      throw new Error(
        'Failed to initialize riskified integration: no events or screen views were registered to be logged. Please, use the `eventsToLog` option to register the events that need to be logged and the `screensToLog` option to register the screen views that need to be logged',
      );
    }

    let finalToken = token;

    //If a session token is not provided, use user.localId
    //as the token
    if (!finalToken) {
      const localId = get(loadData, 'user.localId');
      finalToken = localId;
    }

    RiskifiedIntegration.startBeacon(shopName, finalToken, true);
  }

  /**
   * Overrides Integration.track method
   *
   * @param {Object} data - Track data provided by analytics.
   *
   * @memberof Riskified#
   */
  track(data) {
    switch (data.type) {
      case trackTypes.SCREEN: {
        this.handleScreenView(data);
        break;
      }
      case trackTypes.TRACK: {
        this.handleEvent(data);
      }
    }
  }

  /**
   * Handles tracks of type "screen". If the screen tracked has a
   * URL configured to be logged, we log the url with riskified. Else,
   * we bail out.
   *
   * @param {Object} data - Track data provided by analytics.
   *
   * @memberof Riskified#
   */
  handleScreenView(data) {
    const { event } = data;

    const { screensToLog } = this.options;

    if (!screensToLog || !screensToLog[event]) {
      return;
    }

    const requestUrlToLog = screensToLog[event];

    if (typeof requestUrlToLog !== 'string') {
      utils.logger.error(
        `[Riskified] - Value specified for screensToLog[${event}] is not a string: ${typeof requestUrlToLog}. Aborting logRequest call.`,
      );
      return;
    }

    RiskifiedIntegration.logRequest(requestUrlToLog);
  }

  /**
   * Handles tracks of type "track". If the event tracked is an order completed
   * event and the platform is android, we will call the native module
   * logSensitiveDeviceInfo method as recommended by riskified android sdk documentation.
   * Also, if there is a url configured to be logged, we log the url with riskified.
   * Else, we bail out.
   *
   * @param {Object} data - Track data provided by analytics
   *
   * @memberof Riskified#
   */
  handleEvent(data) {
    const { event } = data;

    //If an order completed event is tracked
    //we need to call logSensitiveDeviceInfo
    //as the SDK documentation recommends only for Android
    if (event === eventTypes.ORDER_COMPLETED && Platform.OS === 'android') {
      RiskifiedIntegration.logSensitiveDeviceInfo();
    }

    const { eventsToLog } = this.options;

    if (!eventsToLog || !eventsToLog[event]) {
      return;
    }

    const requestUrlToLog = eventsToLog[event];

    if (typeof requestUrlToLog !== 'string') {
      utils.logger.error(
        `[Riskified] - Value specified for eventsToLog[${event}] is not a string: ${typeof requestUrlToLog}. Aborting logRequest call.`,
      );
      return;
    }

    RiskifiedIntegration.logRequest(requestUrlToLog);
  }
}
