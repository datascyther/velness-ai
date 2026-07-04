import {
  analytics,
  logEvent as fbLogEvent,
  setUserId as fbSetUserId,
  setUserProperties as fbSetUserProperties,
} from '@/lib/firebase';

export type AnalyticsEvent =
  | 'daily_checkin'
  | 'mood_logged'
  | 'journey_started'
  | 'journey_completed'
  | 'ai_conversation'
  | 'reflection_saved'
  | 'meditation_completed'
  | 'subscription_purchased'
  | 'auth_signin'
  | 'auth_signup'
  | 'auth_signout'
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'onboarding_abandoned'
  | 'crisis_resource_accessed'
  | 'error_occurred'
  | 'login_attempt'
  | 'login_success'
  | 'login_failed'
  | 'password_reset';

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined | null;
}

class AnalyticsService {
  private enabled = true;

  init(): void {
    if (__DEV__) {
      console.log('[Analytics] Initialized');
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
    if (!this.enabled) return;

    if (__DEV__) {
      console.log(`[Analytics] ${event}`, properties ?? '');
    }

    if (!analytics) return;
    try {
      fbLogEvent(analytics, event, properties);
    } catch {
      // analytics failures never crash the app
    }
  }

  trackScreenView(screenName: string): void {
    this.trackEvent('ai_conversation' as AnalyticsEvent, { screen: screenName });
  }

  identifyUser(userId: string, traits?: Record<string, unknown>): void {
    if (__DEV__) {
      console.log(`[Analytics] Identify: ${userId}`, traits ?? '');
    }

    if (!analytics) return;
    try {
      fbSetUserId(analytics, userId);
      if (traits) {
        fbSetUserProperties(analytics, traits as Record<string, string>);
      }
    } catch {
      // analytics failures never crash the app
    }
  }

  reset(): void {
    this.identifyUser('');
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
