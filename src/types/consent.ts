export interface Purpose {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status?: 'granted' | 'rejected';
  required: boolean;
  data_items: string[];
}

export interface ConsentDetailsData {
  id: string;
  status: string;
  fiduciary: { name: string };
  application: { name: string };
  purposes: Purpose[];
  data_shared: string[];
  policy_version: string;
  created_at: string;
  updated_at: string;
  provider_type?: 'self' | 'guardian';
  guardian_name?: string;
  guardian_email?: string;
}
