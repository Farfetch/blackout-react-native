import * as integrations from '..';
import { integrations as integrationsCore } from '@farfetch/blackout-core/analytics';

jest.mock('@react-native-firebase/analytics', () => ({}));

it('Should export the Integration class of the @farfetch/blackout-core package', () => {
  expect(integrations.Integration).toBe(integrationsCore.Integration);
});

it('Should export the Omnitracking class of the @farfetch/blackout-core package', () => {
  expect(integrations.Omnitracking).toBe(integrationsCore.Omnitracking);
});

it('Should export the FirebaseAnalytics class', () => {
  expect(integrations.FirebaseAnalytics).toBeDefined();
});
