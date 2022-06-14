import { MAX_PRODUCT_CATEGORIES, MESSAGE_PREFIX } from '../constants';
import { SignupNewsletterGenderMappings } from '../../shared/dataMappings';
import { utils } from '@farfetch/blackout-core/analytics';
import eventTypes from '../../../eventTypes';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import screenTypes from '../../../screenTypes';
import snakeCase from 'lodash/snakeCase';
import VirtualEventTypes from './virtualEventTypes';

/**
 * Formats product categories as required from Firebase/GA4 ecommerce events.
 *
 * @param {string} productCategoryString - Product category raw string.
 *
 * @returns {object} An object containing all product's categories in a dedicated `item_category` property as determined by Firebase/GA4 api.
 */
const getProductCategories = productCategoryString => {
  if (typeof productCategoryString !== 'string') {
    return {};
  }

  let productCategories = productCategoryString
    .split('/')
    .filter(category => category);

  if (productCategories.length > MAX_PRODUCT_CATEGORIES) {
    utils.logger.warn(
      `${MESSAGE_PREFIX} Product category hierarchy exceeded maximum of ${MAX_PRODUCT_CATEGORIES}. Firebase only allows up to ${MAX_PRODUCT_CATEGORIES} levels.`,
    );

    // Use the first and the last four categories
    productCategories = [
      // @ts-ignore when length are higher then max categories defined, then has at least one category.
      productCategories[0],
      ...productCategories.slice(-MAX_PRODUCT_CATEGORIES + 1),
    ];
  }

  // Firebase/GA4 only supports 5 level of categories
  return productCategories.reduce((acc, category, index) => {
    const itemCategoryId = `item_category${index === 0 ? '' : index + 1}`;
    acc[itemCategoryId] = category;

    return acc;
  }, {});
};

/**
 * Returns the total event value for Firebase/GA4 ecommerce events.
 *
 * @param {object} eventProperties - Properties from a track event.
 * @param {object} items           - Items contained on event tracking.
 *
 * @returns {number} Event total value calculated.
 */
const getEventTotalValue = (eventProperties, items) => {
  // There could be cases where the client is not using the bag middleware and wants to pass a value.
  if (typeof eventProperties.value === 'number') {
    return eventProperties.value;
  }

  return items?.reduce((acc, item) => {
    const price = get(item, 'price', 0);
    const discount = get(item, 'discount', 0);
    const quantity = get(item, 'quantity', 1);
    const value = (price - discount) * quantity;

    return acc + value;
  }, 0);
};

/**
 * Returns product properties formatted to Firebase/GA4 ecommerce events.
 *
 * @param {object}  properties        - Properties from a track event.
 * @param {boolean} addListParameters - Boolean flag to indicate if list properties should be added to the
 *                            resulting mapped product object.
 *
 * @returns {object} Product properties formatted to Firebase/GA4 ecommerce events.
 */
const getProductParametersFromEvent = (
  properties,
  addListParameters = true,
) => {
  const result = {
    ...getProductCategories(properties.category),
    affiliation: properties.affiliation,
    coupon: properties.coupon,
    currency: properties.currency,
    discount: properties.discountValue,
    index: properties.position,
    item_brand: properties.brand,
    item_id: properties.id,
    item_name: properties.name,
    item_variant: properties.variant,
    location_id: properties.locationId,
    price: properties.priceWithoutDiscount,
    quantity: properties.quantity,
    size: properties.size,
  };

  // addListParameters will be false for events that are single
  // product (like PRODUCT_ADDED_TO_CART or PRODUCT_REMOVED_FROM_CART).
  // This is an optimization to avoid having set item_list_id and item_list_name
  // inside the items array and outside the items array as it is wasteful, because
  // Firebase/GA4 will use the item_list_id and item_list_name properties if they are
  // defined outside the items array and are not defined inside it.
  if (addListParameters) {
    result.item_list_id = properties.listId;
    result.item_list_name = properties.list;
  }

  return result;
};

/**
 * Retrieves the product (or products) from the eventProperties in an Array.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {Array<object>} Product list with properties formatted for Firebase/GA4 ecommerce events.
 */
const getProductItemsFromEvent = eventProperties => {
  return Array.isArray(eventProperties.products)
    ? eventProperties.products.map(product =>
        getProductParametersFromEvent(product),
      )
    : new Array(getProductParametersFromEvent(eventProperties, false));
};

/**
 * Returns product updated event parameters for Firebase/GA4 custom events (change_size,
 * change_colour, change_quantity).
 *
 * @param {string} event           - Event name.
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Parameters for Firebase/GA4's custom product updated events.
 */
const getProductUpdatedParametersFromEvent = (event, eventProperties) => {
  const parameters = {
    from: eventProperties.from,
    item_id: eventProperties.id,
    item_name: eventProperties.name,
  };

  switch (event) {
    case VirtualEventTypes.PRODUCT_UPDATED.CHANGE_QUANTITY:
      parameters.quantity = eventProperties.quantity;
      parameters.old_quantity = eventProperties.oldQuantity;
      break;
    case VirtualEventTypes.PRODUCT_UPDATED.CHANGE_SIZE:
      parameters.size = eventProperties.size;
      parameters.old_size = eventProperties.oldSize;
      break;
    case VirtualEventTypes.PRODUCT_UPDATED.CHANGE_COLOUR:
      parameters.colour = eventProperties.colour;
      parameters.old_colour = eventProperties.oldColour;
      break;

    default:
      break;
  }

  return parameters;
};

/**
 * Returns pre-purchased event properties formatted to Firebase/GA4 ecommerce events.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#pre-purchase_interactions}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Common properties formatted to Firebase/GA4's pre-purchased ecommerce events.
 */
const getPrePurchaseParametersFromEvent = eventProperties => {
  const items = getProductItemsFromEvent(eventProperties);

  return {
    currency: eventProperties.currency,
    from: eventProperties.from,
    item_list_id: eventProperties.listId,
    item_list_name: eventProperties.list,
    wishlist_name: eventProperties.wishlist,
    wishlist_id: eventProperties.wishlistId,
    items,
    value: getEventTotalValue(eventProperties, items),
  };
};

/**
 * Returns view wishlist event parameters formatted for Firebase/GA4 event.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Parameters for Firebase/GA4's view wishlist custom event.
 */
const getViewWishlistParametersFromEvent = eventProperties => {
  return {
    wishlist_id: eventProperties.wishlistId,
  };
};

/**
 * Returns product removed from wishlist parameters formatted for Firebase/GA4 event.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Parameters for Firebase/GA4's remove_from_wishlist event.
 */
const getProductRemovedFromWishlist = eventProperties => {
  const productParameters = getProductParametersFromEvent(
    eventProperties,
    false,
  );

  return {
    from: eventProperties.from,
    item_list_id: eventProperties.listId,
    item_list_name: eventProperties.list,
    wishlist_name: eventProperties.wishlist,
    wishlist_id: eventProperties.wishlistId,
    value: getEventTotalValue(eventProperties, new Array(productParameters)),
    ...productParameters,
  };
};

/**
 * Returns checkout event properties formatted to Firebase/GA4 ecommerce events.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#purchases_checkouts_and_refunds}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Common properties formatted to Firebase/GA4's checkout ecommerce events.
 */
const getCheckoutParametersFromEvent = eventProperties => {
  const items = getProductItemsFromEvent(eventProperties);

  return {
    currency: eventProperties.currency,
    coupon: eventProperties.coupon,
    items,
    value: eventProperties.total,
  };
};

/**
 * Returns checkout event properties formatted to Firebase/GA4 ecommerce events.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#purchases_checkouts_and_refunds}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Common properties formatted to Firebase/GA4's checkout ecommerce events.
 */
const getCheckoutPaymentStepParametersFromEvent = eventProperties => {
  return {
    ...getCheckoutParametersFromEvent(eventProperties),
    payment_type: eventProperties.paymentType,
  };
};

/**
 * Returns the checkout shipping step event properties formatted for the Firebase/GA4
 * ecommerce event.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#purchases_checkouts_and_refunds}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Properties formatted for the Firebase/GA4's shipping step checkout ecommerce event.
 */
const getCheckoutShippingStepParametersFromEvent = eventProperties => {
  return {
    currency: eventProperties.currency,
    coupon: eventProperties.coupon,
    value: eventProperties.total,
    shipping_tier: eventProperties.shippingTier,
    address_finder: eventProperties.addressFinder,
    delivery_type: eventProperties.deliveryType,
    packaging_type: eventProperties.packagingType,
  };
};

/**
 * Returns the shipping info added event parameters for the Firebase/GA4 ecommerce event.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtag#add_shipping_info}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Parameters for the Firebase/GA4's add_shipping_info event.
 */
const getShippingInfoAddedParametersFromEvent = eventProperties => {
  return {
    ...getCheckoutParametersFromEvent(eventProperties),
    shipping_tier: eventProperties.shippingTier,
    address_finder: eventProperties.addressFinder,
    delivery_type: eventProperties.deliveryType,
    packaging_type: eventProperties.packagingType,
  };
};

/**
 * Returns the checkout abandoned custom event parameters formatted for the Firebase/GA4
 * event.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Parameters for the Firebase/GA4's checkout abandoned custom event.
 */
const getCheckoutAbandonedParametersFromEvent = eventProperties => {
  return {
    currency: eventProperties.currency,
    coupon: eventProperties.coupon,
    value: eventProperties.total,
  };
};

/**
 * Returns the Interact Content parameters for the (custom) event.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Properties formatted from camelCase to snake_case for Firebase/GA4's event.
 */
const getInteractContentParametersFromEvent = eventProperties => {
  return Object.keys(eventProperties)
    .filter(key => !isObject(eventProperties[key]))
    .reduce((acc, key) => {
      return { ...acc, [snakeCase(key)]: eventProperties[key] };
    }, {});
};

/**
 * Returns login and sign up event properties formatted to Firebase/GA4 recommended events.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events#login}
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events#sign_up}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Common properties formatted to Firebase/GA4's recommended events, login and signup.
 */
const getLoginAndSignupParametersFromEvent = eventProperties => {
  return {
    method: eventProperties.method,
  };
};

/**
 * Returns the checkout order completed/refunded event properties formatted for the
 * Firebase/GA4 ecommerce events.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#purchases_checkouts_and_refunds}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Properties formatted for the Firebase/GA4's order completed/refunded ecommerce events.
 */
const getOrderPurchaseOrRefundParametersFromEvent = eventProperties => {
  return {
    ...getCheckoutParametersFromEvent(eventProperties),
    transaction_id: eventProperties.orderId,
    affiliation: eventProperties.affiliation,
    shipping: eventProperties.shipping,
    tax: eventProperties.tax,
  };
};

/**
 * Returns the place order started custom event properties formatted for the Firebase/GA4
 * ecommerce events. As it returns the same properties of a purchase event, it uses
 * the same mapping function for that event.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Properties formatted for the Firebase/GA4's place order started custom event.
 */
const getPlaceOrderStartedParametersFromEvent = eventProperties => {
  return {
    currency: eventProperties.currency,
    coupon: eventProperties.coupon,
    value: eventProperties.total,
    transaction_id: eventProperties.orderId,
    affiliation: eventProperties.affiliation,
    shipping: eventProperties.shipping,
    tax: eventProperties.tax,
  };
};

/**
 * Returns the search event properties formatted for the Firebase/GA4 search event.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events#search}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @throws
 * @returns {object} Properties formatted for the Firebase/GA4's search event.
 */
const getSearchParametersFromEvent = eventProperties => {
  const searchTermValue = get(
    eventProperties,
    'searchTerm',
    get(eventProperties, 'searchQuery'),
  );

  if (!searchTermValue) {
    throw new Error(
      `Invalid payload for "${eventTypes.SEARCH}" event: "searchQuery" parameter was not present in event payload.`,
    );
  }

  return {
    search_term: searchTermValue,
  };
};

/**
 * Returns the select content properties formatted for the Firebase/GA4 select content.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events#select_content}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Properties formatted for the Firebase/GA4's select content.
 */
const getSelectContentParametersFromEvent = eventProperties => ({
  content_type: eventProperties.contentType,
  item_id: eventProperties.id,
});

/**
 * Returns the select item properties formatted for the Firebase/GA4 view item.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtag#product_views_and_interactions}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Properties formatted for the Firebase/GA4's select item.
 */
const getProductClickedParametersFromEvent = eventProperties => ({
  from: eventProperties.from,
  items: getProductItemsFromEvent(eventProperties),
  item_list_id: eventProperties.listId,
  item_list_name: eventProperties.list,
});

/**
 * Returns the view item properties formatted for the Firebase/GA4 view item.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtag#product_views_and_interactions}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Properties formatted for the Firebase/GA4's view item.
 */
const getViewItemParametersFromEvent = eventProperties => {
  const items = getProductItemsFromEvent(eventProperties);

  return {
    items,
    currency: eventProperties.currency,
    from: eventProperties.from,
    image_count: eventProperties.imageCount,
    value: getEventTotalValue(eventProperties, items),
  };
};

/**
 * Returns the filter properties from an event.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Object containing the filter properties.
 */
const getFilterParametersFromEvent = eventProperties => ({
  filters: eventProperties.filters
    ? JSON.stringify(eventProperties.filters)
    : undefined,
});

/**
 * Returns the sort properties from an event.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Object containing the sort properties.
 */
const getSortParametersFromEvent = eventProperties => ({
  sort_option: eventProperties.sortOption,
});

/**
 * Returns the view item list properties formatted for the Firebase/GA4 view item list.
 *
 * @see {@link https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtag#product_views_and_interactions}
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Properties formatted for the Firebase/GA4's view item list.
 */
const getViewItemListParametersFromEvent = eventProperties => ({
  from: eventProperties.from,
  error: eventProperties.error,
  items: getProductItemsFromEvent(eventProperties),
  item_list_id: eventProperties.listId,
  item_list_name: eventProperties.list,
  ...getFilterParametersFromEvent(eventProperties),
  ...getSortParametersFromEvent(eventProperties),
});

/**
 * Returns the checkout step editing properties from an event.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Object containing the sort properties.
 */
const getCheckoutStepEditingParametersFromEvent = eventProperties => {
  return {
    checkout_step: eventProperties.step,
  };
};

/**
 * Returns the share properties formatted for the Firebase/GA4 event.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @returns {object} Properties formatted for the Firebase/GA4's share event.
 */
const getShareParametersFromEvent = eventProperties => ({
  method: eventProperties.method,
  content_type: eventProperties.contentType,
  item_id: eventProperties.id,
});

/**
 * Returns the signup newsletter parameters formatted for the Firebase/GA4 event.
 *
 * @param {object} eventProperties - Properties from a track event.
 *
 * @throws
 * @returns {object} Parameters formatted for the Firebase/GA4's sign_up_newsletter event.
 */
const getSignupNewsletterParametersFromEvent = eventProperties => {
  const genderArray = (Array.isArray(eventProperties.gender)
    ? eventProperties.gender
    : new Array(eventProperties.gender)
  ).map(gender => {
    return gender.name || SignupNewsletterGenderMappings[gender.id ?? gender];
  });

  genderArray.forEach(genderDescription => {
    if (!genderDescription) {
      throw new Error(
        `Invalid payload for "${eventTypes.SIGNUP_NEWSLETTER}" event: "gender" parameter contains gender ids that cannot be mapped to a description by default and a description was not provided. Gender parameter value was: "${eventProperties.gender}".`,
      );
    }
  });

  return {
    newsletter_gender: genderArray.reduce((acc, item) => `${acc},${item}`),
  };
};

/**
 * Returns event properties mapping by Firebase/GA4 event name.
 *
 * @param {object} event - Event name.
 * @param {object} data  - Event data provided by analytics.
 *
 * @returns {(object|undefined)}The event property required and formatted to the desired Firebase/GA4 event.
 */
export function getMappedEventPropertiesForEvent(event, data) {
  const eventProperties = data.properties;

  switch (event) {
    case eventTypes.CHECKOUT_STARTED:
      return getCheckoutParametersFromEvent(eventProperties);

    case eventTypes.PAYMENT_INFO_ADDED:
      return getCheckoutPaymentStepParametersFromEvent(eventProperties);

    case VirtualEventTypes.PRODUCT_UPDATED.CHANGE_QUANTITY:
    case VirtualEventTypes.PRODUCT_UPDATED.CHANGE_SIZE:
    case VirtualEventTypes.PRODUCT_UPDATED.CHANGE_COLOUR:
      return getProductUpdatedParametersFromEvent(event, eventProperties);

    case screenTypes.BAG:
    case eventTypes.PRODUCT_ADDED_TO_CART:
    case eventTypes.PRODUCT_REMOVED_FROM_CART:
    case eventTypes.PRODUCT_ADDED_TO_WISHLIST:
      return getPrePurchaseParametersFromEvent(eventProperties);

    case screenTypes.WISHLIST:
      return getViewWishlistParametersFromEvent(eventProperties);

    case eventTypes.PRODUCT_REMOVED_FROM_WISHLIST:
      return getProductRemovedFromWishlist(eventProperties);

    case eventTypes.PRODUCT_CLICKED:
      return getProductClickedParametersFromEvent(eventProperties);

    case eventTypes.PRODUCT_LIST_VIEWED:
      return getViewItemListParametersFromEvent(eventProperties);

    case eventTypes.PRODUCT_VIEWED:
      return getViewItemParametersFromEvent(eventProperties);

    case eventTypes.ORDER_COMPLETED:
    case eventTypes.ORDER_REFUNDED:
      return getOrderPurchaseOrRefundParametersFromEvent(eventProperties);

    case screenTypes.SEARCH:
      return getSearchParametersFromEvent(eventProperties);

    case eventTypes.SELECT_CONTENT:
      return getSelectContentParametersFromEvent(eventProperties);

    case eventTypes.SHIPPING_INFO_ADDED:
      return getShippingInfoAddedParametersFromEvent(eventProperties);

    case eventTypes.ADDRESS_INFO_ADDED:
    case eventTypes.SHIPPING_METHOD_ADDED:
    case eventTypes.PROMOCODE_APPLIED:
      return getCheckoutShippingStepParametersFromEvent(eventProperties);

    case eventTypes.INTERACT_CONTENT:
      return getInteractContentParametersFromEvent(eventProperties);

    case eventTypes.LOGIN:
    case eventTypes.SIGNUP_FORM_COMPLETED:
      return getLoginAndSignupParametersFromEvent(eventProperties);

    case eventTypes.FILTERS_APPLIED:
    case eventTypes.FILTERS_CLEARED:
      return getFilterParametersFromEvent(eventProperties);

    case eventTypes.SHARE:
      return getShareParametersFromEvent(eventProperties);

    case eventTypes.CHECKOUT_ABANDONED:
      return getCheckoutAbandonedParametersFromEvent(eventProperties);

    case eventTypes.PLACE_ORDER_STARTED:
      return getPlaceOrderStartedParametersFromEvent(eventProperties);

    case eventTypes.CHECKOUT_STEP_EDITING:
      return getCheckoutStepEditingParametersFromEvent(eventProperties);

    case eventTypes.SIGNUP_NEWSLETTER:
      return getSignupNewsletterParametersFromEvent(eventProperties);

    default:
      /* istanbul ignore next */
      break;
  }
}
