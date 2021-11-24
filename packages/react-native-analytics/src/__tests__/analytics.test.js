import analytics from '../analytics';
import AnalyticsCore, {
  integrations,
  trackTypes,
} from '@farfetch/blackout-core/analytics';
import TestStorage from 'test-storage';

class MyIntegration extends integrations.Integration {
  static shouldLoad() {
    return true;
  }

  static createInstance() {
    return new MyIntegration();
  }

  track() {}
}

class IntegrationThatNeedsConsent extends integrations.Integration {
  static shouldLoad(consent) {
    return !!consent && !!consent.statistics;
  }

  static createInstance() {
    return new IntegrationThatNeedsConsent();
  }

  track = jest.fn();
}

describe('analytics react native', () => {
  it('Should extend the core analytics', () => {
    expect(analytics).toBeInstanceOf(AnalyticsCore);
  });

  describe('instance methods', () => {
    beforeEach(async () => {
      analytics.isReady = false;
      analytics.integrations.clear();
      analytics.currentScreenCallData = null;
      jest.clearAllMocks();

      await analytics.setStorage(new TestStorage());
      await analytics.setUser(123);
    });

    it('Should expose `track` and `screen` methods that will make use of the analytics core track method', async () => {
      analytics.addIntegration('myIntegration', MyIntegration);

      await analytics.ready();

      const integrationInstance = analytics.integration('myIntegration');

      expect(integrationInstance).not.toBe(null);

      const coreTrackSpy = jest.spyOn(AnalyticsCore.prototype, 'track');

      const integrationInstanceTrackSpy = jest.spyOn(
        integrationInstance,
        'track',
      );

      const event = 'myEvent';
      const properties = { prop1: 'prop1' };
      const eventContext = { culture: 'pt-PT' }; //Simulate that the event has a different culture associated with it.

      await analytics.track(event, properties, eventContext);

      expect(coreTrackSpy).toHaveBeenCalledWith(
        trackTypes.TRACK,
        event,
        properties,
        eventContext,
      );

      expect(integrationInstanceTrackSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: trackTypes.TRACK,
          event,
          properties,
          context: expect.objectContaining({ event: eventContext }),
        }),
      );

      jest.clearAllMocks();

      await analytics.screen(event, properties, eventContext);

      expect(coreTrackSpy).toHaveBeenCalledWith(
        trackTypes.SCREEN,
        event,
        properties,
        eventContext,
      );

      expect(integrationInstanceTrackSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: trackTypes.SCREEN,
          event,
          properties,
          context: expect.objectContaining({ event: eventContext }),
        }),
      );
    });

    describe('When setConsent is called', () => {
      it('If there was a screen call made, it should call the track method with this screen data of integrations that are loaded by the given consent', async () => {
        const integrationThatNeedsConsentKey = 'integrationThatNeedsConsent';

        analytics.addIntegration('myIntegration', MyIntegration);
        analytics.addIntegration(
          integrationThatNeedsConsentKey,
          IntegrationThatNeedsConsent,
        );

        await analytics.ready();

        const myIntegrationInstance = analytics.integration('myIntegration');

        jest.spyOn(myIntegrationInstance, 'track');

        let integrationThatNeedsConsentInstance = analytics.integration(
          integrationThatNeedsConsentKey,
        );

        expect(integrationThatNeedsConsentInstance).toBe(null);

        const screenCallData = {
          event: 'Home',
          properties: { prop1: 'prop1', prop2: 'prop2' },
        };

        await analytics.screen(screenCallData.event, screenCallData.properties);

        expect(myIntegrationInstance.track).toHaveBeenCalled();

        //We need to clear all mocks because the setConsent call will call the track method of the loaded integrations
        //and we need to check that the already loaded ones does not get its track method called again.
        jest.clearAllMocks();

        await analytics.setConsent({ statistics: true });

        //myIntegrationInstance was already loaded before consent was given, so it shouldn't have its track method called here
        expect(myIntegrationInstance.track).not.toHaveBeenCalled();

        integrationThatNeedsConsentInstance = analytics.integration(
          integrationThatNeedsConsentKey,
        );

        expect(integrationThatNeedsConsentInstance).not.toBe(null);

        expect(integrationThatNeedsConsentInstance.track).toHaveBeenCalledWith(
          expect.objectContaining(screenCallData),
        );
      });

      it('If there was not a screen call made, it should not call the track method of integrations that are loaded by the given consent', async () => {
        const integrationThatNeedsConsentKey = 'integrationThatNeedsConsent';

        analytics.addIntegration(
          integrationThatNeedsConsentKey,
          IntegrationThatNeedsConsent,
        );

        await analytics.ready();

        let integrationThatNeedsConsentInstance = analytics.integration(
          integrationThatNeedsConsentKey,
        );

        expect(integrationThatNeedsConsentInstance).toBe(null);

        await analytics.setConsent({ statistics: true });

        integrationThatNeedsConsentInstance = analytics.integration(
          integrationThatNeedsConsentKey,
        );

        expect(integrationThatNeedsConsentInstance).not.toBe(null);

        expect(
          integrationThatNeedsConsentInstance.track,
        ).not.toHaveBeenCalled();
      });
    });

    describe('context', () => {
      it('Should return some default values', async () => {
        const context = await analytics.context();

        expect(context).toStrictEqual({
          device: 'iPhone12,5',
          deviceLanguage: 'en',
          deviceOS: 'iOS 13.0',
          library: {
            name: '@farfetch/blackout-core/analytics',
            version: expect.any(String),
          },
          screenHeight: 1000,
          screenWidth: 800,
        });
      });
    });
  });
});
