import { Dimensions } from 'react-native';

/**
 * Function that adds screenWidth and screenHeight properties that
 * correspond to the application's window dimensions
 * as returned by Dimensions.get('window') method. This function
 * is to be used in analytics.useContext method.
 *
 * @returns {Object} - An object with keys 'screenWidth' and 'screenHeight' that correspond to the application's window dimensions.
 */
export default function screenDimensionsContext() {
  const windowDimensions = Dimensions.get('window');

  return {
    screenWidth: windowDimensions.width,
    screenHeight: windowDimensions.height,
  };
}
