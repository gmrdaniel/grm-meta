
export interface CreatorImportData {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  estatus: 'activo' | 'inactivo' | 'pendiente';
}

export interface ImportError {
  row: number;
  error: string;
  data: CreatorImportData;
}
