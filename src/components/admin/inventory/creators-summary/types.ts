
export interface SummaryCreator {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  seguidores_tiktok: number;
  engagement: number;
  duration_average: number;
  date_last_post: number;
}

export interface CreatorsSummaryData {
  data: SummaryCreator[];
  count: number;
}
