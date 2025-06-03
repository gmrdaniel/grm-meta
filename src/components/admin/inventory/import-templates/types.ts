
export interface CreatorImportData {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  secUid_tiktok?: string;
  estatus: 'activo' | 'inactivo' | 'pendiente';
}

export interface BulkCreatorInvitationDetail {
  bulk_invitation_id: string;
  created_at: string;
  email: string;
  error_message: string | null;
  full_name: string;
  id: string;
  is_active: boolean;
  status: string;
  updated_at: string;
}

export interface ImportError {
  row: number;
  error: string;
  data: CreatorImportData;
}

export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTiktokUsername?: boolean;
}
