import { getMappedEventPropertiesForEvent } from './getMappedEventPropertiesForEvent';
import { utils } from '@farfetch/blackout-core/analytics';
import eventTypes from '../../../eventTypes';
import screenTypes from '../../../screenTypes';
import VirtualEventTypes from './virtualEventTypes';
import { MESSAGE_PREFIX } from '../constants';

export const firebaseEventNameMappings = {
  [eventTypes.APP_OPENED]: 'app_open',
  [eventTypes.PRODUCT_ADDED_TO_CART]: 'add_to_cart',
  [eventTypes.PRODUCT_REMOVED_FROM_CART]: 'remove_from_cart',
  [eventTypes.PAYMENT_INFO_ADDED]: 'add_payment_info',
  [eventTypes.PRODUCT_ADDED_TO_WISHLIST]: 'add_to_wishlist',
  [eventTypes.PRODUCT_REMOVED_FROM_WISHLIST]: 'remove_from_wishlist',
  [eventTypes.SHIPPING_INFO_ADDED]: 'add_shipping_info',
  [eventTypes.CHECKOUT_STARTED]: 'begin_checkout',
  [eventTypes.ORDER_COMPLETED]: 'purchase',
  [eventTypes.ORDER_REFUNDED]: 'refund',
  [eventTypes.SELECT_CONTENT]: 'select_content',
  [eventTypes.PRODUCT_CLICKED]: 'select_item',
  [eventTypes.PRODUCT_VIEWED]: 'view_item',
  [eventTypes.PRODUCT_LIST_VIEWED]: 'view_item_list',
  [eventTypes.LOGIN]: 'login',
  [eventTypes.SIGNUP_FORM_COMPLETED]: 'sign_up',
  [eventTypes.FILTERS_APPLIED]: 'apply_filters',
  [eventTypes.FILTERS_CLEARED]: 'clear_filters',
  [eventTypes.SHARE]: 'share',
  [eventTypes.CHECKOUT_ABANDONED]: 'abandon_confirmation_checkout',
  [eventTypes.PLACE_ORDER_STARTED]: 'place_order',
  [eventTypes.PROMOCODE_APPLIED]: 'apply_promo_code',
  [eventTypes.CHECKOUT_STEP_EDITING]: 'edit_checkout_step',
  [eventTypes.ADDRESS_INFO_ADDED]: 'add_address_info',
  [eventTypes.SHIPPING_METHOD_ADDED]: 'add_shipping_method',
  [eventTypes.INTERACT_CONTENT]: 'interact_content',
  [eventTypes.SIGNUP_NEWSLETTER]: 'sign_up_newsletter',
  [screenTypes.SEARCH]: 'search',
  [screenTypes.BAG]: 'view_cart',
  [screenTypes.WISHLIST]: 'view_wishlist',
  // virtual events
  [VirtualEventTypes.PRODUCT_UPDATED.CHANGE_QUANTITY]:
    VirtualEventTypes.PRODUCT_UPDATED.CHANGE_QUANTITY,
  [VirtualEventTypes.PRODUCT_UPDATED.CHANGE_SIZE]:
    VirtualEventTypes.PRODUCT_UPDATED.CHANGE_SIZE,
  [VirtualEventTypes.PRODUCT_UPDATED.CHANGE_COLOUR]:
    VirtualEventTypes.PRODUCT_UPDATED.CHANGE_COLOUR,
};

/**
 * Default events mapper for Firebase.
 *
 * @param {object} data          - Event data provided by analytics.
 * @returns {(object|undefined)} - Mapped event object for Firebase if the event is in the supported list.
 */
export default function defaultEventsMapper(data) {
  const event = data.event;
  const firebaseEvent = firebaseEventNameMappings[event];

  if (!firebaseEvent) {
    return;
  }

  try {
    const firebaseEventProperties = getMappedEventPropertiesForEvent(
      event,
      data,
    );

    return {
      event: firebaseEvent,
      properties: firebaseEventProperties,
    };
  } catch (e) {
    utils.logger.error(
      `${MESSAGE_PREFIX} An error occurred when trying to map event "${event}": ${e}`,
    );
  }
}
