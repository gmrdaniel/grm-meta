
export interface ColumnMapping {
  [key: string]: string;
}

export interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: { row: number; error: string }[];
}

export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTiktokUsername?: boolean;
  noEngagement?: boolean;
  noVideos?: boolean;
}

export interface CreatorImportData {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  secUid_tiktok?: string;
  estatus: 'activo' | 'inactivo' | 'pendiente';
}

export interface ImportError {
  row: number;
  error: string;
  data: CreatorImportData;
}
