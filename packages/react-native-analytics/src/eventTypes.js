import { eventTypes } from '@farfetch/blackout-core/analytics';

/**
 * Extend the core eventTypes with app specific ones
 */
export default {
  ...eventTypes,
  APP_OPENED: 'App Opened',
  APP_CLOSED: 'App Closed',
  VIEWED_PROMOTION: 'Viewed Promotion',
  SELECTED_PROMOTION: 'Selected Promotion',
};
