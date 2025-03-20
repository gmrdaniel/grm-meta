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

export interface CreatorService {
  id: string;
  service_id: string;
  profile_id: string;
  status: 'pendiente' | 'activo' | 'inactivo' | 'cancelado';
  terms_accepted: boolean;
  service_start_date?: string;
  service_end_date?: string;
  created_at?: string;
  updated_at?: string;
  service?: Service;
  profile?: any;
}

export interface ServicePayment {
  id: string;
  creator_service_id: string;
  amount: number;
  status: 'pendiente' | 'pagado' | 'cancelado';
  payment_date?: string;
  payment_month?: string;
  payment_receipt_url?: string;
  created_at?: string;
  updated_at?: string;
  creator_service?: CreatorService;
}
