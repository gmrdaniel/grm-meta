
export interface Creator {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok?: string;
  secuid_tiktok?: string; // Changed from secUid_tiktok to match database column name
  seguidores_tiktok?: number;
  elegible_tiktok?: boolean;
  engagement_tiktok?: number;
  usuario_pinterest?: string;
  seguidores_pinterest?: number;
  usuario_youtube?: string;
  seguidores_youtube?: number;
  elegible_youtube?: boolean;
  engagement_youtube?: number;
  page_facebook?: string;
  lada_telefono?: string;
  telefono?: string;
  estatus: 'activo' | 'inactivo' | 'pendiente';
  fecha_creacion: string;
}

export interface TikTokVideo {
  id: string;
  creator_id: string;
  video_id: string;
  description?: string;
  create_time?: number;
  author?: string;
  author_id?: string;
  video_definition?: string;
  duration?: number;
  number_of_comments?: number;
  number_of_hearts?: number;
  number_of_plays?: number;
  number_of_reposts?: number;
  created_at: string;
  updated_at: string;
}
