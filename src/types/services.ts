
export interface Service {
  id: string;
  name: string;
  description?: string;
  type: string;
  fixed_fee?: number;
  company_share_min?: number;
  company_share_max?: number;
  contract_duration?: number;
  max_revenue?: number;
  renewable?: boolean;
  terms_conditions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PendingService {
  id: string;
  name: string;
  creator_service_id: string;
  terms_conditions: string;
  terms_accepted: boolean;
  updated_at: string;
  status: string;
}
