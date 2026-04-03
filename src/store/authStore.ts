import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  principal_id: string;
  email: string;
  phone_number: string;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  email: string | null;
  phone_number: string | null;
  signupData: SignupData | null;
  setAuthenticated: (user: User | null) => void;
  setCredentials: (email: string, phone: string) => void;
  setSignupData: (data: SignupData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      email: null,
      phone_number: null,
      signupData: null,
      setAuthenticated: (user) => set({ isAuthenticated: !!user, user }),
      setCredentials: (email, phone_number) => set({ email, phone_number }),
      setSignupData: (data) => set({ signupData: data }),
      logout: () => {
        set({ isAuthenticated: false, user: null, email: null, phone_number: null, signupData: null });
        localStorage.removeItem('secure-cms-auth');
      },
    }),
    {
      name: 'secure-cms-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
