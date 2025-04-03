
export interface SummaryCreator {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  seguidores_tiktok: number;
  usuario_youtube: string;
  seguidores_youtube: number;
  engagement_tiktok: number;
  average_duration_tiktok: number;
  date_last_post_tiktok: number;
  engagement_youtube: number;
  average_duration_youtube: number;
}

export interface CreatorsSummaryData {
  data: SummaryCreator[];
  count: number;
}
