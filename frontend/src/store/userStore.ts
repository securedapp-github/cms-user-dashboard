import { create } from 'zustand';

export interface DashboardSummary {
  total_consents: number;
  active: number;
  expiring: number;
  dsr_pending: number;
}

export interface ConsentItem {
  id: string;
  app_id: string;
  app_name?: string;
  purpose_id: string;
  purpose_name?: string;
  status: string;
  expires_at: string | null;
  updated_at: string;
  tenant_name?: string;
}

interface UserState {
  user: any | null;
  summary: DashboardSummary | null;
  consents: ConsentItem[];
  setUser: (data: any) => void;
  setSummary: (data: DashboardSummary) => void;
  setConsents: (data: ConsentItem[]) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  summary: null,
  consents: [],
  setUser: (data) => set({ user: data }),
  setSummary: (data) => set({ summary: data }),
  setConsents: (data) => set({ consents: data }),
}));
