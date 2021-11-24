import AsyncStorage from '@react-native-community/async-storage';
import { name } from '../../package.json';
import { v4 as uuidv4 } from 'uuid';

export const ClientInstallIdDefaultKey = `${name}/clientInstallIdContext`;

/**
 * Returns a context function that will add a clientInstallId
 * property to the context when added with analytics.useContext method.
 * The clientInstallId is a UUID that identifies an installation
 * of the app and will only change when the app is installed
 * again. This id will be stored with @react-native-community/async-storage
 * by default.
 *
 * @param {Object} [options]              - Options object to configure the context function that will be returned.
 * @param {Object} [options.storage]      - The storage instance to use to store the clientInstallId. This instance must provide the methods setItem(key, value) and getItem(key) to work. By default will use AsyncStorage from '@react-native-community/async-storage' package.
 * @param {String} [options.storageKey]   - The name of the key where the id will be stored on the storage. By default it is the '${packageName}/clientInstallIdContext'.
 *
 * @returns {Function}                    - An async context function to be used in analytics.useContext method.
 */
export default function getClientInstallIdContext(options = {}) {
  const storageImplementation = options.storage || AsyncStorage;
  const storageKey = options.storageKey || ClientInstallIdDefaultKey;

  let clientInstallId;

  return async function getClientInstallId() {
    if (!clientInstallId) {
      const storedClientInstallId = await storageImplementation.getItem(
        storageKey,
      );

      if (storedClientInstallId) {
        clientInstallId = storedClientInstallId;
      } else {
        clientInstallId = uuidv4();
        await storageImplementation.setItem(storageKey, clientInstallId);
      }
    }

    return {
      app: {
        clientInstallId,
      },
    };
  };
}
