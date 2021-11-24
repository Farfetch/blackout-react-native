import ReactNativeAnalyticsService from '../AnalyticsService';
import { integrations, trackTypes } from '@farfetch/blackout-core/analytics';
import { INACTIVE_APP_STATE, BACKGROUND_APP_STATE } from '../constants';

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
  },
}));

describe('ReactNativeAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  describe('createInstance method', () => {
    it('Should create an instance of this integration', () => {
      const instance = ReactNativeAnalyticsService.createInstance();

      expect(instance).toBeInstanceOf(ReactNativeAnalyticsService);
      expect(instance).toBeInstanceOf(integrations.AnalyticsService);
    });
  });

  describe('AppState changes', () => {
    it('Should flush the queue when the app goes to the background or gets inactive', () => {
      const instance = ReactNativeAnalyticsService.createInstance();
      const flushQueueSpy = jest.spyOn(instance, 'flushQueue');

      instance.handleAppStateChange(INACTIVE_APP_STATE);

      expect(flushQueueSpy).toHaveBeenCalled();

      flushQueueSpy.mockClear();

      instance.handleAppStateChange(BACKGROUND_APP_STATE);

      expect(flushQueueSpy).toHaveBeenCalled();

      flushQueueSpy.mockClear();

      instance.handleAppStateChange('foo');

      expect(flushQueueSpy).not.toHaveBeenCalled();
    });
  });

  describe('track method', () => {
    it('Should flush the queue immediately when a screen change occurs', () => {
      const instance = ReactNativeAnalyticsService.createInstance();
      const flushQueueSpy = jest.spyOn(instance, 'flushQueue');

      instance.track({ type: trackTypes.SCREEN });

      expect(flushQueueSpy).toHaveBeenCalled();
    });
  });

  describe('clearInterval method', () => {
    it('Should be able to clear the interval', () => {
      const instance = ReactNativeAnalyticsService.createInstance();
      const flushQueueSpy = jest.spyOn(instance, 'flushQueue');
      const setupSpy = jest.spyOn(instance, 'setup');

      expect(instance.clearInterval).toBeDefined();

      instance.track({ foo: 'bar' });

      jest.runOnlyPendingTimers();

      expect(flushQueueSpy).toHaveBeenCalled();
      expect(setupSpy).toHaveBeenCalled();
      expect(instance.interval).toBeDefined();

      instance.clearInterval();

      expect(instance.interval).not.toBeDefined();
    });
  });
});
