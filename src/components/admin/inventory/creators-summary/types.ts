
export interface SummaryCreator {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  seguidores_tiktok: number;
  engagement: number;
  duration_average: number;
  date_last_post: number;
  usuario_youtube: string;
  seguidores_youtube: number;
  yt_engagement: number;
  yt_average_duration: number;
  video_id: string;
}

export interface CreatorsSummaryData {
  data: SummaryCreator[];
  count: number;
}
