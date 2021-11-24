import deviceModelContext from '../deviceModelContext';
import { getModel, getDeviceId } from 'react-native-device-info';

describe('deviceModelContext', () => {
  it('Should return the model that is available in getModel if it is not unknown', () => {
    const model = getModel();

    const expectedContext = {
      device: model,
    };

    const context = deviceModelContext();

    expect(context).toStrictEqual(expectedContext);
  });

  it('Should return the deviceId that is available in getDeviceId if getModel returns unknown', () => {
    getModel.mockImplementation(() => 'unknown');

    const deviceId = getDeviceId();

    const expectedContext = {
      device: deviceId,
    };

    const context = deviceModelContext();

    expect(context).toStrictEqual(expectedContext);
  });
});
