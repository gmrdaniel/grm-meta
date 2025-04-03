
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { SummaryCreator } from './creators-summary/types';

export interface CreatorExportData {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  seguidores_tiktok: number;
  engagement_tiktok: number;
  average_duration_tiktok: number;
  date_last_post_tiktok: number;
  usuario_youtube: string;
  seguidores_youtube: number;
  engagement_youtube: number;
  average_duration_youtube: number;
}

export const exportToCsv = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate filename with date
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const fullFilename = `${filename}_${dateStr}.xlsx`;
  
  // Export the file
  XLSX.writeFile(workbook, fullFilename);
};

export const formatExportData = (creators: SummaryCreator[]) => {
  return creators.map(creator => {
    // Format data for export
    const formatFollowers = (count?: number) => {
      if (count === undefined || count === null) return "N/A";
      return count.toString();
    };
    
    const formatEngagement = (rate?: number) => {
      if (rate === undefined || rate === null) return "N/A";
      return `${rate.toFixed(2)}%`;
    };
    
    const formatDuration = (seconds?: number) => {
      if (seconds === undefined || seconds === null) return "N/A";
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    const formatDate = (timestamp?: number) => {
      if (!timestamp) return "N/A";
      return format(new Date(timestamp * 1000), "yyyy-MM-dd");
    };
    
    const isEligibleForTikTok = creator.seguidores_tiktok >= 100000 && creator.engagement_tiktok >= 4;
    const isEligibleForYouTube = creator.seguidores_youtube >= 100000 && creator.engagement_youtube >= 4;
    
    return {
      "Nombre": creator.nombre || '',
      "Apellido": creator.apellido || '',
      "Correo": creator.correo || '',
      "Usuario TikTok": creator.usuario_tiktok ? `@${creator.usuario_tiktok}` : '',
      "Seguidores TikTok": formatFollowers(creator.seguidores_tiktok),
      "Engagement TikTok": formatEngagement(creator.engagement_tiktok),
      "Duración Prom. TikTok": formatDuration(creator.average_duration_tiktok),
      "Último Post TikTok": formatDate(creator.date_last_post_tiktok),
      "Elegible TikTok": isEligibleForTikTok ? 'Sí' : 'No',
      "Usuario YouTube": creator.usuario_youtube ? `@${creator.usuario_youtube}` : '',
      "Seguidores YouTube": formatFollowers(creator.seguidores_youtube),
      "Engagement YouTube": formatEngagement(creator.engagement_youtube),
      "Duración Prom. YouTube": formatDuration(creator.average_duration_youtube),
      "Elegible YouTube": isEligibleForYouTube ? 'Sí' : 'No'
    };
  });
};
