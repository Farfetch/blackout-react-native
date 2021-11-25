import { integrations } from '@farfetch/blackout-core/analytics';
import AnalyticsService from './AnalyticsService';
import FirebaseAnalytics from './firebaseAnalytics';
import Forter from './Forter';

const { Integration, Omnitracking } = integrations;

export {
  AnalyticsService,
  FirebaseAnalytics,
  Forter,
  Integration,
  Omnitracking,
};
