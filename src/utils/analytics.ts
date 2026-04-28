export type ConsentEvent = 
  | 'consent_initiated'
  | 'minor_guardian_required'
  | 'guardian_nominated'
  | 'guardian_otp_verified'
  | 'consent_completed';

/**
 * A stub analytics service for tracking consent flows.
 * In a real application, this would integrate with Mixpanel, Google Analytics, Amplitude, etc.
 */
export const analytics = {
  logEvent: (event: ConsentEvent, properties?: Record<string, any>) => {
    // Console log for demo/debugging purposes
    console.log(`[Analytics] Event: ${event}`, properties || {});
    
    // Example integration hook:
    // window.dataLayer.push({ event, ...properties });
    // mixpanel.track(event, properties);
  }
};
