
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { SummaryCreator } from './creators-summary/types';

export interface CreatorExportData {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  seguidores_tiktok: number;
  engagement: number;
  duration_average: number;
  date_last_post: number;
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
    
    return {
      "Nombre": creator.nombre || '',
      "Apellido": creator.apellido || '',
      "Correo": creator.correo || '',
      "Usuario TikTok": creator.usuario_tiktok ? `@${creator.usuario_tiktok}` : '',
      "Seguidores": formatFollowers(creator.seguidores_tiktok),
      "Engagement": formatEngagement(creator.engagement),
      "Duración Promedio": formatDuration(creator.duration_average),
      "Último Post": formatDate(creator.date_last_post),
      "Elegible": creator.seguidores_tiktok >= 100000 && creator.engagement >= 4 ? 'Sí' : 'No'
    };
  });
};
