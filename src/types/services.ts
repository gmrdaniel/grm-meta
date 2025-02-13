
export interface Service {
  id: string;
  name: string;
  terms_conditions: string | null;
}

export interface CreatorService {
  id: string;
  services: Service;
  updated_at: string;
  terms_accepted: boolean;
  terms_conditions: string | null;
  status: string;
}

export interface PendingService {
  id: string;
  name: string;
  creator_service_id: string;
  terms_conditions: string | null;
  terms_accepted: boolean;
  updated_at: string;
  status: string;
}
