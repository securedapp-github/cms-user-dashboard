import { api } from './index';

export interface AuthResponse {
  success: boolean;
  message?: string;
}

export const authApi = {
  // Step 1: Request OTP
  requestOtp: async (email: string, phone: string): Promise<boolean> => {
    try {
      const response = await api('/user/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ email, phone_number: phone }),
      });
      return response.success;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to request OTP');
    }
  },

  // Step 2: Verify OTP
  verifyOtp: async (email: string, phone: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await api('/user/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email, phone_number: phone, otp }),
      });
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Invalid OTP code');
    }
  }
};
