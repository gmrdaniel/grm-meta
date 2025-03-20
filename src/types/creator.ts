
export interface Creator {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok?: string;
  usuario_pinterest?: string;
  page_facebook?: string;
  lada_telefono?: string;
  telefono?: string;
  estatus: 'activo' | 'inactivo' | 'pendiente';
  fecha_creacion: string;
}
