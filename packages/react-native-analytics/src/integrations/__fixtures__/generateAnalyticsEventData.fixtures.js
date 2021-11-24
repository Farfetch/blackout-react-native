import { trackTypes as analyticsTrackTypes } from '@farfetch/blackout-core/analytics';

export default function generateAnalyticsEventData(
  trackType = analyticsTrackTypes.TRACK,
  event,
  properties = {},
) {
  return {
    consent: { marketing: true, preferences: true, statistics: true },
    context: {
      app: { clientInstallId: '7c9d09a8-0b32-4293-9817-e0b17f8830db' },
      clientId: 16000,
      device: 'iPhone13,2',
      deviceLanguage: 'en',
      deviceOS: 'iOS 14.3',
      event: null,
      library: {
        version: '1.15.0-chore-FPSCH-625-add-support-for-site-features.0',
        name: '@farfetch/blackout-core/analytics',
      },
      screenHeight: 844,
      screenWidth: 390,
      tenantId: 16000,
    },
    event,
    platform: 'mobile',
    properties,
    timestamp: 1610532249124,
    type: trackType,
    user: {
      id: 5000003260042599,
      localId: '9c48bea6-53fa-483a-b0a7-50408c2c1e4e',
      traits: { isGuest: false, name: 'John Doe', email: 'john@email.com' },
    },
  };
}
