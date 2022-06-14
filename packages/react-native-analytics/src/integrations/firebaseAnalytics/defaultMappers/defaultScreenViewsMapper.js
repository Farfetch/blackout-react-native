import isObject from 'lodash/isObject';
import snakeCase from 'lodash/snakeCase';

export default function defaultScreenViewsMapper(data) {
  const screenName = data.event;
  const properties = data.properties;

  const mappedProperties = {
    screen_name: screenName,
    screen_class: screenName,
  };

  if (properties) {
    const propertyKeys = Object.keys(properties);

    if (propertyKeys.length > 0) {
      propertyKeys.forEach(key => {
        const value = properties[key];

        // Discard values that are not primitives
        if (isObject(value) || typeof value === 'symbol') {
          return;
        }

        mappedProperties[snakeCase(key)] = value;
      });
    }
  }

  return {
    method: 'logScreenView',
    properties: mappedProperties,
  };
}
