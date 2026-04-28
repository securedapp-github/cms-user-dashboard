import { api } from './index';

export interface InitiateConsentPayload {
  email?: string;
  phone_number?: string;
  dob?: string;
  purposes: string[];
  policy_version?: string;
  callback_url?: string; // Inform the backend of our callback URL if needed
}

export interface InitiateConsentResponse {
  flow: 'standard' | 'guardian_required';
  redirect_url?: string;
  pop_url?: string;
}

export interface NominateGuardianPayload {
  guardian_name: string;
  guardian_email?: string;
  guardian_phone?: string;
  relation: string;
}

export interface SendOtpPayload {
  otp_mode?: string;
  otp_modes?: string[];
}

export interface VerifyOtpPayload {
  otp: string;
}

export interface VerifyOtpResponse {
  consent_ids: string[];
  purpose_decisions: Record<string, string>;
  data_subject: string;
  consent_provider: string;
  provider_type: string;
}

export const consentApi = {
  /**
   * Initiate a consent request.
   * Based on the user's age (DOB), this will return either a standard flow or a guardian_required flow.
   */
  initiateConsent: async (appId: string, payload: InitiateConsentPayload, apiKey?: string): Promise<InitiateConsentResponse> => {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }
    return await api(`/public/apps/${appId}/consent/initiate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  },

  /**
   * Nominate a guardian for a minor.
   * Usually called by the hosted page internally, but available here for custom UI integrations.
   */
  nominateGuardian: async (token: string, payload: NominateGuardianPayload) => {
    return await api(`/public/consent/guardian/${token}/nominate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Send OTP for guardian verification.
   * Usually called by the hosted page internally.
   */
  sendOtp: async (token: string, payload?: SendOtpPayload) => {
    return await api(`/public/consent/redirect/${token}/send-otp`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  /**
   * Verify the OTP to complete the guardian consent process.
   * Usually called by the hosted page internally.
   */
  verifyOtp: async (token: string, payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    return await api(`/public/consent/redirect/${token}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
