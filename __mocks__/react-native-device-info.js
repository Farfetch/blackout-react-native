export const getDeviceId = jest
  .fn()
  .mockImplementation(() => 'iPhone 11 Pro Max');
export const getModel = jest.fn().mockImplementation(() => 'iPhone12,5');
export const getSystemName = jest.fn().mockImplementation(() => 'iOS');
export const getSystemVersion = jest.fn().mockImplementation(() => '13.0');
