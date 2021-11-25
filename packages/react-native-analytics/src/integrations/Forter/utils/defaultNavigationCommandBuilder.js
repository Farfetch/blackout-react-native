import { utils } from '@farfetch/blackout-core/analytics';
import get from 'lodash/get';
import screenTypes from '../../../screenTypes';

let ForterNavigationType;

try {
  ForterNavigationType = require('react-native-forter').ForterNavigationType;
} catch (e) {
  // Set it to a default object so it does not throw when importing and
  // react-native-forter is not installed.
  ForterNavigationType = {};
}

/**
 * Default screen types mappings to ForterNavigationType enumeration.
 */
const screenTypesMap = {
  [screenTypes.ABOUT]: ForterNavigationType.HELP,
  [screenTypes.ARTICLE]: ForterNavigationType.PRODUCT,
  [screenTypes.ACCOUNT]: ForterNavigationType.ACCOUNT,
  [screenTypes.BAG]: ForterNavigationType.CART,
  [screenTypes.BIOGRAPHY]: ForterNavigationType.HELP,
  [screenTypes.CHECKOUT]: ForterNavigationType.CHECKOUT,
  [screenTypes.CHECKOUT_DELIVERY_METHOD]: ForterNavigationType.CHECKOUT,
  [screenTypes.CHECKOUT_PAYMENT]: ForterNavigationType.CHECKOUT,
  [screenTypes.CHECKOUT_REVIEW]: ForterNavigationType.CHECKOUT,
  [screenTypes.CHECKOUT_SHIPPING]: ForterNavigationType.CHECKOUT,
  [screenTypes.COLLECTIONS]: ForterNavigationType.PRODUCT,
  [screenTypes.COOKIE_PREFERENCES]: ForterNavigationType.HELP,
  [screenTypes.CORPORATE]: ForterNavigationType.HELP,
  [screenTypes.CUSTOMER_SERVICE]: ForterNavigationType.HELP,
  [screenTypes.DESIGNERS]: ForterNavigationType.SEARCH,
  [screenTypes.GENDER_SELECTION]: ForterNavigationType.ACCOUNT,
  [screenTypes.GENERIC_ERROR]: ForterNavigationType.HELP,
  [screenTypes.HOMEPAGE]: ForterNavigationType.PRODUCT,
  [screenTypes.JOURNAL]: ForterNavigationType.PRODUCT,
  [screenTypes.LOGIN]: ForterNavigationType.ACCOUNT,
  [screenTypes.LOGIN_REGISTER]: ForterNavigationType.ACCOUNT,
  [screenTypes.NEW_IN]: ForterNavigationType.PRODUCT,
  [screenTypes.NOT_FOUND]: ForterNavigationType.PRODUCT,
  [screenTypes.ORDER_CONFIRMATION]: ForterNavigationType.CHECKOUT,
  [screenTypes.PRODUCT_DETAILS]: ForterNavigationType.PRODUCT,
  [screenTypes.PRODUCT_LISTING]: ForterNavigationType.PRODUCT,
  [screenTypes.RECOVER_PASSWORD]: ForterNavigationType.ACCOUNT,
  [screenTypes.REGISTER]: ForterNavigationType.ACCOUNT,
  [screenTypes.RESET_PASSWORD]: ForterNavigationType.ACCOUNT,
  [screenTypes.RETURNS]: ForterNavigationType.ACCOUNT,
  [screenTypes.SALE]: ForterNavigationType.PRODUCT,
  [screenTypes.SEARCH]: ForterNavigationType.SEARCH,
  [screenTypes.SOCIAL]: ForterNavigationType.ACCOUNT,
  [screenTypes.STORES]: ForterNavigationType.HELP,
  [screenTypes.UNSUBSCRIBE]: ForterNavigationType.ACCOUNT,
  [screenTypes.WISHLIST]: ForterNavigationType.PRODUCT,
};

/**
 * This command builder will handle all screen events that are not handled
 * by the user and that have a corresponding ForterNavigationType.
 *
 * If the event is considered to be a PRODUCT navigation type,
 * then will try to add the itemId and itemCategory of the product if available in
 * the properties, as specified in (requires authentication):
 *    https://portal.forter.com/docs/ios/content/sending_event_data/track_navigation
 *
 * NOTE: The methods on that page refer to the native iOS implementation which have
 *       different names in react-native-forter package, so do not be surprised to
 *       have name mismatches.
 *
 * @param {object} data - Event data provided by analytics.
 *
 * @returns {object} A command with the description of the method to be invoked in forterSDK's instance.
 */
export default data => {
  const screenName = data.event;
  const screenType = screenTypesMap[screenName];

  if (!screenType) {
    return null;
  }

  let itemId;
  let itemCategory;

  if (screenType === ForterNavigationType.PRODUCT) {
    itemId = get(data, 'properties.productId');
    itemCategory = get(data, 'properties.productCategory');

    if (!itemId || !itemCategory) {
      utils.logger.warn(
        `[ForterIntegration] - The screen view event '${screenName}' is categorised as a Product navigation type by default but productId, productCategory or both were missing from event properties. A navigation event will be sent to forter instance anyway but please review the code tracking this screen view event to add the missing values to the properties payload if possible. productId was '${itemId}', productCategory was '${itemCategory}'`,
      );
    }

    return {
      method: 'trackNavigationWithExtraData',
      args: [
        screenName,
        screenType,
        itemId ? `${itemId}` : null,
        itemCategory ? `${itemCategory}` : null,
      ],
    };
  }

  return {
    method: 'trackNavigation',
    args: [screenName, screenType],
  };
};
