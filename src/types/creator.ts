
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
  views_youtube?: number;
  page_facebook?: string;
  lada_telefono?: string;
  telefono?: string;
  estatus: 'activo' | 'inactivo' | 'pendiente';
  fecha_creacion: string;
  fecha_consulta_videos?: string;
  fecha_descarga_yt?: string;
  enviado_hubspot?: boolean;
  fecha_envio_hubspot?: string;
  tiene_invitacion?: boolean;
  codigo_invitacion?: string;
  tiene_prompt_generado?: boolean;
  usuario_asignado?: string;
}
