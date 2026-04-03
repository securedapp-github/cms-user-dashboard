import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
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
  identifier: string | null;
  signupData: SignupData | null;
  setAuthenticated: (user: User) => void;
  setIdentifier: (id: string) => void;
  setSignupData: (data: SignupData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      identifier: null,
      signupData: null,
      setAuthenticated: (user) => set({ isAuthenticated: true, user }),
      setIdentifier: (id) => set({ identifier: id }),
      setSignupData: (data) => set({ signupData: data }),
      logout: () => {
        set({ isAuthenticated: false, user: null, identifier: null, signupData: null });
        localStorage.removeItem('secure-cms-auth');
      },
    }),
    {
      name: 'secure-cms-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
