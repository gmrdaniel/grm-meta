
export type BulkCreatorInvitation = {
  id: string;
  file_name: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type BulkCreatorInvitationDetail = {
  id: string;
  bulk_invitation_id: string;
  first_name: string;
  email: string;
  is_active: boolean;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};
