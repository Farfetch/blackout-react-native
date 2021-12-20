import analyticsNative from './analytics';
import { getClientInstallIdContext } from './contexts';
import screenTypes from './screenTypes';
import eventTypes from './eventTypes';
import { trackTypes, utils } from '@farfetch/blackout-core/analytics';
export default analyticsNative;

export { eventTypes, trackTypes, screenTypes, utils };

//We export only the contexts that are not already being included by default in analytics
const exportableContexts = { getClientInstallIdContext };

export { exportableContexts as contexts };
