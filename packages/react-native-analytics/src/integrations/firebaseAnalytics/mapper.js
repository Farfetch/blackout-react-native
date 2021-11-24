import eventTypes from '../../eventTypes';
import screenTypes from '../../screenTypes';
import get from 'lodash/get';
import pick from 'lodash/pick';

/**
 * Events mapper that will return a known method from Firebase Analytics package.
 * If Firebase Analytics provides a high-level method like `firebaseAnalytics().logAppOpen()`, then we can map this event with "method" property, along with its properties.
 * If it does not provide a high-level method for a supported event, we can extend this default mapper with the supported event and tell which properties will it send.
 * This event will be sent with `firebaseAnalytics().logEvent(event, properties)`.
 */
export const eventsMapper = {
  // App
  [eventTypes.APP_OPENED]: () => {
    return {
      method: 'logAppOpen',
      properties: undefined,
    };
  },
  // User
  [eventTypes.SIGNUP_FORM_COMPLETED]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logSignUp',
      properties: pick(properties, ['method']),
    };
  },

  // Cart
  [eventTypes.PRODUCT_ADDED_TO_CART]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logAddToCart',
      properties: pick(properties, ['currency', 'items', 'value']),
    };
  },
  [eventTypes.PRODUCT_REMOVED_FROM_CART]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logRemoveFromCart',
      properties: pick(properties, ['currency', 'items', 'value']),
    };
  },
  [screenTypes.BAG]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logViewCart',
      properties: pick(properties, ['currency', 'value', 'items']),
    };
  },

  // Wishlist
  [eventTypes.PRODUCT_ADDED_TO_WISHLIST]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logAddToWishlist',
      properties: pick(properties, ['currency', 'items', 'value']),
    };
  },

  // Product
  [eventTypes.PRODUCT_VIEWED]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logViewItem',
      properties: pick(properties, ['currency', 'value', 'items']),
    };
  },
  [eventTypes.PRODUCT_LIST_VIEWED]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logViewItemList',
      properties: pick(properties, ['item_list_id', 'item_list_name', 'items']),
    };
  },
  [eventTypes.PRODUCT_CLICKED]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logSelectItem',
      properties: pick(properties, [
        'content_type',
        'item_list_id',
        'item_list_name',
        'items',
      ]),
    };
  },

  // Checkout
  [eventTypes.CHECKOUT_STARTED]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logBeginCheckout',
      properties: pick(properties, ['currency', 'value', 'coupon', 'items']),
    };
  },
  [eventTypes.CHECKOUT_STEP_COMPLETED]: data => {
    const properties = get(data, 'properties', {});
    const step = get(properties, 'step', 0);

    switch (Number(step)) {
      case 1:
        return {
          method: 'logAddShippingInfo',
          properties: pick(properties, [
            'currency',
            'value',
            'coupon',
            'shipping_tier',
            'items',
          ]),
        };
      case 2:
        return {
          method: 'logSetCheckoutOption',
          properties: pick(properties, ['checkout_option', 'checkout_step']),
        };
      case 3:
        return {
          method: 'logAddPaymentInfo',
          properties: pick(properties, [
            'currency',
            'value',
            'coupon',
            'payment_type',
            'items',
          ]),
        };
      default:
        return undefined;
    }
  },
  [eventTypes.ORDER_COMPLETED]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logPurchase',
      properties: pick(properties, [
        'transaction_id',
        'affiliation',
        'currency',
        'value',
        'tax',
        'shipping',
        'coupon',
        'items',
      ]),
    };
  },
  [eventTypes.ORDER_REFUNDED]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logRefund',
      properties: pick(properties, [
        'transaction_id',
        'affiliation',
        'currency',
        'value',
        'coupon',
        'shipping',
        'tax',
        'items',
      ]),
    };
  },
  [eventTypes.VIEWED_PROMOTION]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logViewPromotion',
      properties: pick(properties, [
        'creative_name',
        'creative_slot',
        'items',
        'location_id',
        'promotion_id',
        'promotion_name',
      ]),
    };
  },
  [eventTypes.SELECTED_PROMOTION]: data => {
    const properties = get(data, 'properties', {});

    return {
      method: 'logViewPromotion',
      properties: pick(properties, [
        'creative_name',
        'creative_slot',
        'items',
        'location_id',
        'promotion_id',
        'promotion_name',
      ]),
    };
  },
};
