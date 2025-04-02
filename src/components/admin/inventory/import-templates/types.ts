
export interface CreatorImportData {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok?: string;
  secUid_tiktok?: string;
  usuario_youtube?: string;
  estatus: 'activo' | 'inactivo' | 'pendiente';
}

export interface ImportError {
  row: number;
  error: string;
  data: CreatorImportData;
}

export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTikTokUsername?: boolean;
  withoutEngagement?: boolean;
  withoutVideos?: boolean;
  withoutYouTube?: boolean;
  [key: string]: boolean | undefined;
}
