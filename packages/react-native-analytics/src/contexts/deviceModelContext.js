import { getModel, getDeviceId } from 'react-native-device-info';

/**
 * Function that adds a device property with the model of the device
 * to be used on analytics.useContext method.
 * For iOS devices, the model name is obtained from a user-maintained
 * list of models. If a model name is not available, will use the deviceId as the device model.
 *
 * @returns {Object} - An object with a key 'device' that corresponds to the device model.
 */
export default function deviceModelContext() {
  let model = getModel();

  //For iOS devices, the model is obtained from a user-maintained
  //list of models, so if the model of the iOS device is not found
  //we return the deviceId as specified in react-native-device-info docs.
  if (model === 'unknown') {
    model = getDeviceId();
  }

  return { device: model };
}
