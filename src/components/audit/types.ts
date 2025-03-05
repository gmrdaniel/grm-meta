export type AuditActionType = 'create' | 'update' | 'delete' | 'revert' | 'payment' | 'status_change';

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
  // Add the admin and reverter properties from the join
  admin?: {
    full_name: string | null;
    email: string;
  };
  reverter?: {
    full_name: string | null;
    email: string;
  };
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
