import { eventTypes } from '@farfetch/blackout-core/analytics';

/**
 * Extend the core eventTypes with app specific ones
 */
export default {
  ...eventTypes,
  APP_OPENED: 'App Opened',
  APP_CLOSED: 'App Closed',
};
