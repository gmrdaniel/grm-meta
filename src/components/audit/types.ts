
export type AuditActionType = 'create' | 'update' | 'delete' | 'status_change' | 'payment' | 'revert';

export interface AdminProfile {
  full_name: string | null;
  email: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action_type: AuditActionType;
  module: string;
  table_name: string;
  record_id: string;
  previous_data: any;
  new_data: any;
  revertible: boolean;
  reverted_at: string | null;
  reverted_by: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin: AdminProfile | null;
  reverter: AdminProfile | null;
}

export interface AuditLogFilters {
  module?: string;
  actionType?: AuditActionType;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page: number;
  itemsPerPage: number;
}

