import AnalyticsCore, {
  trackTypes,
  platformTypes,
} from '@farfetch/blackout-core/analytics';

import * as contexts from './contexts';

class AnalyticsNative extends AnalyticsCore {
  constructor() {
    super(platformTypes.Mobile);

    // Stores the last page call
    this.currentScreenCallData = null;

    // Add default contexts for the mobile platform
    this.useContext(contexts.deviceLanguageContext);
    this.useContext(contexts.deviceModelContext);
    this.useContext(contexts.deviceOSContext);
    this.useContext(contexts.screenDimensionsContext);
  }

  /**
   * Whenever the integrations are loaded at a certain point in time, we fetch them and send the current tracked screen information.
   * This can happen whenever the user gives consent for a specific category mid session.
   *
   * @param {Array<Integration>} loadedIntegrations - An array that contains the integrations that were loaded in runtime, namely after setConsent is called.
   *
   * @async
   * @returns {Promise}                             - Promise that will resolve when the method finishes.
   *
   * @memberof AnalyticsNative#
   */
  async onLoadedIntegrations(loadedIntegrations) {
    // If there is a previous screen call data stored, send a screen event to the integrations that were loaded
    if (this.currentScreenCallData) {
      const { name, properties, eventContext } = this.currentScreenCallData;

      const screenEventData = await super.getTrackEventData(
        trackTypes.SCREEN,
        name,
        properties,
        eventContext,
      );

      super.callIntegrationsMethod(
        loadedIntegrations,
        'track',
        screenEventData,
      );
    }
  }

  /**
   * Track method for custom events.
   *
   * @param {String} event                  - Name of the event.
   * @param {Object} properties             - Properties of the event.
   * @param {Object} eventContext           - Context data that is specific for this event.
   *
   * @async
   * @returns {Promise<AnalyticsNative>}    - Promise that will resolve with the analytics instance.
   *
   * @memberof AnalyticsNative#
   */
  async track(event, properties, eventContext) {
    await super.track(trackTypes.TRACK, event, properties, eventContext);

    return this;
  }

  /**
   * Tracks a screen view and keeps the last call in case
   * there are new integrations that are loaded mid-session
   * ,i.e. the user gives consent.
   *
   * @param {String} name                   - Name of the screen that is to be tracked.
   * @param {Object} properties             - Properties associated with the screen view.
   * @param {Object} eventContext           - Context data that is specific for this event.
   *
   * @async
   * @returns {Promise<AnalyticsNative>}    - Promise that will resolve with the analytics instance.
   *
   * @memberof AnalyticsNative#
   */
  async screen(name, properties, eventContext) {
    // Override the last screen call data with the current one
    this.currentScreenCallData = {
      name,
      properties,
      eventContext,
    };

    await super.track(trackTypes.SCREEN, name, properties, eventContext);
    return this;
  }
}

export default new AnalyticsNative();
