import merge from 'lodash/merge';
import get from 'lodash/get';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import { utils } from '@farfetch/blackout-core/analytics';

/**
 * Merges a custom event mapping with a default one, so it can be extended according to specific rules of the project implementation.
 *
 * @param {Object} options - User configured options.
 * @param {Object} mapper - The default mapper.
 * @param {Object} key - The key of the custom mapper.
 *
 * @returns {Object} - The result of the merge.
 */
export const buildMapper = (options, defaultMapper, key) => {
  const customEventMapper = get(options, key, {});
  const mapper = merge({}, defaultMapper, customEventMapper);

  return mapper;
};

/**
 * Formats a event name to be compliant with Firebase Analytics.
 *
 * @param {String} eventName - The event name to be formatted.
 *
 * @returns {String} - The result of the transformation.
 */
export const formatEvent = (eventName = '') => {
  return eventName.toLowerCase().replace(/ /g, '_').replace('-', '_');
};

/**
 * Formats the user traits object to have all properties as strings.
 *
 * @param {Object} userTraits - The source object with the user traits.
 *
 * @returns {Object} - The formatted object.
 */
export const formatUserTraits = userTraits => {
  const result = {};
  let userTrait = null;

  Object.keys(userTraits).forEach(key => {
    userTrait = userTraits[key];

    if (isNumber(userTrait) || isBoolean(userTrait)) {
      result[key] = userTrait.toString();
    } else if (isString(userTrait)) {
      result[key] = userTrait;
    } else {
      utils.logger.error(
        `Firebase Analytics: The user property type "${key}" is not supported. Make sure to pass one of the supported types: "Boolean", "String" or "Number".`,
      );
    }
  });

  return result;
};
