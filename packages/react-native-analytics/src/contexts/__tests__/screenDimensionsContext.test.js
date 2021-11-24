import { Dimensions } from 'react-native';
import screenDimensionsContext from '../screenDimensionsContext';

describe('screenDimensionsContext', () => {
  it('Should return the screen dimensions that are in Dimensions.get("window")', () => {
    const windowDimensions = Dimensions.get('window');

    const contextWithWindowDimensions = {
      screenWidth: windowDimensions.width,
      screenHeight: windowDimensions.height,
    };

    const screenDimensions = Dimensions.get('screen');

    const contextWithScreenDimensions = {
      screenWidth: screenDimensions.width,
      screenHeight: screenDimensions.height,
    };

    const context = screenDimensionsContext();

    expect(context).toStrictEqual(contextWithWindowDimensions);

    expect(context).not.toStrictEqual(contextWithScreenDimensions);
  });
});
