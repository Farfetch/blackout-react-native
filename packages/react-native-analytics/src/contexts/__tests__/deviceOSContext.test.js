import { getSystemName, getSystemVersion } from 'react-native-device-info';
import deviceOSContext from '../deviceOSContext';

describe('deviceOSContext', () => {
  it('Should return the values from getSystemName and getSystemVersion as the deviceOS value', () => {
    const expectedContext = {
      deviceOS: `${getSystemName()} ${getSystemVersion()}`,
    };

    const context = deviceOSContext();

    expect(context).toStrictEqual(expectedContext);
  });
});
