
export type Service = {
  id: string;
  name: string;
  description: string | null;
  type: 'único' | 'recurrente' | 'contrato';
  company_share_min: number;
  company_share_max: number;
  fixed_fee: number;
  max_revenue: number | null;
  contract_duration: number | null;
  renewable: boolean;
  terms_conditions: string | null;
};

export type ServiceFormData = Omit<Service, "id">;
