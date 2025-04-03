
export interface Creator {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok?: string;
  secUid_tiktok?: string;
  seguidores_tiktok?: number;
  elegible_tiktok?: boolean;
  engagement_tiktok?: number;
  usuario_pinterest?: string;
  seguidores_pinterest?: number;
  usuario_youtube?: string;
  seguidores_youtube?: number;
  elegible_youtube?: boolean;
  engagement_youtube?: number;
  views_youtube?: number; // New field for YouTube views
  page_facebook?: string;
  lada_telefono?: string;
  telefono?: string;
  estatus: 'activo' | 'inactivo' | 'pendiente';
  fecha_creacion: string;
  fecha_consulta_videos?: string;
  fecha_descarga_yt?: string;
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
