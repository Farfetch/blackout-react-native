import { integrations } from '@farfetch/blackout-core/analytics';
import AnalyticsService from './AnalyticsService';
import FirebaseAnalytics from './firebaseAnalytics';

const { Integration, Omnitracking } = integrations;

export { AnalyticsService, FirebaseAnalytics, Integration, Omnitracking };
