/**
 * Analytics service integration will send data to fps Analytics service.
 *
 * @example <caption>Adding AnalyticsService integration to analytics</caption>
 *
 * import analytics, { integrations } from '@farfetch/blackout-react-native-analytics';
 *
 * analytics.addIntegration('analyticsService', integrations.AnalyticsService);
 *
 * @module ReactNativeAnalyticsService
 * @category Analytics
 * @subcategory Integrations
 */

import { trackTypes } from '@farfetch/blackout-core/analytics';
// TODO: The folder of the integration does not contain an index.js file. Remove this when the index.js file is added.
import CoreAnalyticsService from '@farfetch/blackout-core/analytics/integrations/AnalyticsService/AnalyticsService';

import { AppState } from 'react-native';
import { BACKGROUND_APP_STATE, INACTIVE_APP_STATE } from './constants';

/**
 * Analytics service integration.
 *
 * @private
 * @augments CoreAnalyticsService
 */
class ReactNativeAnalyticsService extends CoreAnalyticsService {
  constructor(options, loadData, analytics) {
    super(options, loadData, analytics);

    AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Method used to create a new AnalyticsService instance by analytics.
   *
   * @param {object} options - Integration options.
   * @param {object} loadData - Analytics' load event data.
   * @param {object} analytics - Analytics instance stripped down with only helpers.
   *
   * @returns {ReactAnalytNativeicsService} An instance of AnalyticsService class.
   */
  static createInstance(options, loadData, analytics) {
    return new ReactNativeAnalyticsService(options, loadData, analytics);
  }

  /**
   * Function that will create and store the interval.
   * It will recursively call itself to mimic the setInterval logic.
   * This will prevent performance issues on apps.
   *
   * @param {number} interval - The interval in milliseconds for the queue flush.
   */
  setup(interval) {
    this.interval = setTimeout(() => {
      this.flushQueue();

      this.setup(interval);
    }, interval);
  }

  /**
   * Handles the nextAppState to flush the queue when the app goes to the background.
   *
   * @param {String} nextAppState - The next app state.
   */
  handleAppStateChange = nextAppState => {
    switch (nextAppState) {
      case BACKGROUND_APP_STATE:
      case INACTIVE_APP_STATE:
        this.flushQueue();
        break;
    }
  };

  /**
   * Controls the queue by flushing it when a new screen is tracked.
   * This will make sure all previously tracked events (that were not flushed yet) are persisted properly when a screen change occurs.
   *
   * @param {object} data - Event data provided by analytics.
   */
  controlQueue(data) {
    if (data.type === trackTypes.SCREEN) {
      this.flushQueue();
    }
  }

  /**
   * In case there is a valid reason to stop (or pause) this interval externally, this method is available to do so.
   * This will be possible by fetching the integration first and then calling this method, like this:
   * `analytics.integration('analyticsService').clearInterval()` (replace `analyticsService` with the name you gave when adding it with `analytics.addIntegration()`)
   * It can be initialized again later by calling the `.initialize()` method of the same instance.
   */
  clearInterval() {
    clearTimeout(this.interval);

    this.interval = undefined;
  }
}

export default ReactNativeAnalyticsService;
