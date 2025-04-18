
export type NombreRealStatus = 'pendiente' | 'proceso' | 'error' | 'completado';

export interface CreatorStatusUpdate {
  correo: string;
  enviado_hubspot?: boolean;
  tiene_invitacion?: boolean;
  tiene_prompt_generado?: boolean;
  tiene_nombre_real?: NombreRealStatus;
  fecha_envio_hubspot?: string;
}

export interface UpdateCreatorResult {
  success: number;
  failed: number;
  errors: { row: number; email: string; error: string; }[];
}
