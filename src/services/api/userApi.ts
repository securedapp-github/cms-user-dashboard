import { api } from './index';

export const userApi = {
  // 1. Session Login
  loginUser: async (payload: { email: string; phone_number: string }) => {
    // The backend POST /user/auth/session returns { token, principal_id }
    // Sending variations of phone for compatibility as per API screenshot
    return await api('/user/auth/session', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        phoneNumber: payload.phone_number,
        phone: payload.phone_number,
      }),
    });
  },

  // 2. Fetch User Details
  getUser: async () => {
    return await api('/user/me');
  },

  // 3. Dashboard Summary
  getSummary: async () => {
    return await api('/user/summary');
  },

  // 4. Consents List
  getConsents: async (filters?: { tenant_id?: string; app_id?: string; status?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.app_id) params.append('app_id', filters.app_id);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status.toLowerCase());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const url = params.toString() ? `/user/consents?${params.toString()}` : `/user/consents`;
    return await api(url);
  },
  getConsentDetails: async (id: string) => {
    return await api(`/user/consents/${id}`);
  },
  updateConsent: async (id: string, payload: { purpose_id: string; enabled: boolean }) => {
    return await api(`/user/consents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  withdrawConsent: async (id: string) => {
    return await api(`/user/consents/${id}/withdraw`, {
      method: 'POST',
    });
  },

  // 5. Tenants List
  getTenants: async () => {
    return await api('/user/tenants');
  },

  // 6. Apps List
  getApps: async (tenantId: string) => {
    return await api(`/user/apps?tenant_id=${tenantId}`);
  },

  // 7. DSR Requests List
  getDsrRequests: async (filters?: { status?: string; tenant_id?: string; app_id?: string; page?: number }) => {
    const params = new URLSearchParams();
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.app_id) params.append('app_id', filters.app_id);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status.toLowerCase());
    if (filters?.page) params.append('page', filters.page.toString());

    const url = params.toString() ? `/user/dsr/requests?${params.toString()}` : `/user/dsr/requests`;
    return await api(url);
  },

  // 8. Submit DSR Request
  submitDSR: async (payload: { tenant_id: string; app_id: string; request_type: string; description: string }) => {
    return await api('/user/dsr/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 9. Activity Logs
  getLogs: async (limit: number = 50) => {
    return await api(`/user/logs?limit=${limit}`);
  },

  // 10. Grievances
  getGrievances: async () => {
    return await api('/user/grievances');
  },
  createGrievance: async (payload: { tenant_id: string; category: string; description: string }) => {
    return await api('/user/grievance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
