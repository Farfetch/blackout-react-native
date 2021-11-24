import { getSystemName, getSystemVersion } from 'react-native-device-info';

/**
 * Function that adds a deviceOS property with the name and version of the operating system
 * of the device to be used on analytics.useContext method.
 *
 * @returns {Object} - An object with a key 'deviceOS' that corresponds to the name and version of the operating system.
 */
export default function deviceOSContext() {
  const systemName = getSystemName();
  const systemVersion = getSystemVersion();

  return { deviceOS: `${systemName} ${systemVersion}` };
}
