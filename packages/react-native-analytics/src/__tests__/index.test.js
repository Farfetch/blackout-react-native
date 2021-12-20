import * as mainExports from '..';
import analytics from '../analytics';
import screenTypes from '../screenTypes';
import { trackTypes } from '@farfetch/blackout-core/analytics';

jest.mock('@react-native-firebase/analytics', () => ({}));

it('Should export the analytics instance on the default export', () => {
  expect(mainExports.default).toBe(analytics);
});

it('Should export the eventTypes on the eventTypes key', () => {
  expect(mainExports.eventTypes).toMatchSnapshot();
});

it('Should export the trackTypes on trackTypes key', () => {
  expect(mainExports.trackTypes).toBe(trackTypes);
});

it('Should export the screenTypes on screenTypes key', () => {
  expect(mainExports.screenTypes).toBe(screenTypes);
});
