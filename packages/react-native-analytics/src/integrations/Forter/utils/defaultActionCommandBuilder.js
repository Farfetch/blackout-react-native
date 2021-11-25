import eventTypes from '../../../eventTypes';

let ForterActionType;

try {
  ForterActionType = require('react-native-forter').ForterActionType;
} catch (e) {
  // Set it to a default object so it does not throw when importing and
  // react-native-forter is not installed.
  ForterActionType = {};
}

const eventTypesMap = {
  [eventTypes.PRODUCT_ADDED_TO_CART]: ForterActionType.ADD_TO_CART,
  [eventTypes.PRODUCT_REMOVED_FROM_CART]: ForterActionType.REMOVE_FROM_CART,
  [eventTypes.LOGIN]: ForterActionType.ACCOUNT_LOGIN,
  [eventTypes.LOGOUT]: ForterActionType.ACCOUNT_LOGOUT,
  [eventTypes.ORDER_COMPLETED]: ForterActionType.PAYMENT_INFO,
  [eventTypes.PLACE_ORDER_FAILED]: ForterActionType.PAYMENT_INFO,
};

/**
 * This command builder will handle all track events that are not handled
 * by the user and that have a corresponding ForterActionType.
 *
 * @param {object} data - Event data provided by analytics.
 *
 * @returns {object} A command with the description of the method to be invoked in forterSDK's instance.
 */
export default data => {
  const eventName = data.event;

  const eventType = eventTypesMap[eventName];

  if (!eventType) {
    return null;
  }

  return {
    method: 'trackActionWithJSON',
    args: [eventType, data.properties],
  };
};
