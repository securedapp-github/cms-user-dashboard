// Mock API Service for Authentication

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  // Step 1: Request OTP
  requestOtp: async (identifier: string): Promise<boolean> => {
    await sleep(800);
    // Simulate valid identifiers
    if (!identifier || identifier.length < 5) {
      throw new Error('Please enter a valid email or phone number.');
    }
    return true;
  },

  // Step 2: Verify OTP
  verifyOtp: async (_identifier: string, otp: string): Promise<AuthResponse> => {
    await sleep(1000);
    // Hardcode '1234' for success test
    if (otp !== '1234') {
      throw new Error('Invalid OTP code. Please try again.');
    }

    return {
      success: true,
      user: {
        id: 'u-101',
        name: 'Alex Doe',
        role: 'User',
      }
    };
  }
};
