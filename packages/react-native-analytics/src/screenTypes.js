import { pageTypes } from '@farfetch/blackout-core/analytics';

//For now, we are assuming the same pageTypes from @farfetch/blackout-core.
//This will allow existing integrations that make use of it, to continue working.
export default {
  ...pageTypes,
};
