
export interface Creator {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok?: string;
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
