import merge from 'lodash/merge';
import get from 'lodash/get';

/**
 * Gets the custom event mappers object from the options configured by the user
 * when adding the integration to analytics.
 * Will copy the values specified in a new object.
 *
 * @param {object} options - User configured options.
 * @param {object} key - The key of the custom mapper.
 *
 * @returns {object} - A new object containing all custom event mappers
 */
export const buildCustomEventsMapper = (options, key) => {
  const customEventsMapper = get(options, key, {});
  const mapper = merge({}, customEventsMapper);

  return mapper;
};
