
import * as XLSX from 'xlsx';
import { createCreator } from "@/services/creatorService";
import { ImportError } from "../types";
import { 
  createBulkInvitation, 
  createBulkInvitationDetail, 
  updateBulkInvitation,
  validateBasicCreatorData,
  showImportResultToast
} from "./commonUtils";

export const generateYouTubeExcelTemplate = () => {
  const templateData = [
    ["nombre", "apellido", "correo", "usuario_youtube"],
    ["Juan", "Pérez", "juan@example.com", "juanChannel"],
    ["María", "González", "maria@example.com", "mariaChannel"]
  ];
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(templateData);
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla YouTube");
  XLSX.writeFile(wb, "plantilla_youtube.xlsx");
};

export const validateYouTubeCreatorData = (rowData: any): string[] => {
  const rowErrors = validateBasicCreatorData(rowData);
  if (!rowData.usuario_youtube) rowErrors.push("Usuario YouTube es requerido");
  return rowErrors;
};

export const processYouTubeImportData = async (
  csvData: string, 
  onError: (errors: ImportError[]) => void,
  onSuccess: (count: number) => void
): Promise<{
  bulkInvitationId: string,
  successCount: number,
  errors: ImportError[]
}> => {
  if (!csvData.trim()) {
    throw new Error("No data to import");
  }
  
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  
  const requiredHeaders = ["nombre", "correo", "usuario_youtube"];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  const validRowsCount = lines.filter((line, index) => index > 0 && line.trim()).length;
  
  const fileName = "import-youtube-" + new Date().toISOString().slice(0, 10);
  const bulkInvitation = await createBulkInvitation({
    fileName,
    totalRows: validRowsCount
  });
  
  const errors: ImportError[] = [];
  let successCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',');
    const rowData: any = {};
    
    headers.forEach((header, index) => {
      rowData[header.trim()] = values[index]?.trim() || "";
    });
    
    const rowErrors = validateYouTubeCreatorData(rowData);
    
    if (rowErrors.length > 0) {
      const errorMsg = rowErrors.join(", ");
      errors.push({
        row: i,
        error: errorMsg,
        data: {...rowData, estatus: 'activo'}
      });
      
      await createBulkInvitationDetail({
        bulkInvitationId: bulkInvitation.id,
        fullName: `${rowData.nombre || ''} ${rowData.apellido || ''}`.trim() || 'Sin nombre',
        email: rowData.correo || 'Sin correo',
        status: 'failed',
        errorMessage: errorMsg
      });
      
      continue;
    }
    
    try {
      await createCreator({
        nombre: rowData.nombre,
        apellido: rowData.apellido || '',
        correo: rowData.correo,
        usuario_youtube: rowData.usuario_youtube,
        estatus: 'activo'
      });
      
      await createBulkInvitationDetail({
        bulkInvitationId: bulkInvitation.id,
        fullName: `${rowData.nombre} ${rowData.apellido || ''}`,
        email: rowData.correo,
        status: 'completed'
      });
      
      successCount++;
    } catch (error: any) {
      const errorMsg = error.message || "Error al crear creador";
      errors.push({
        row: i,
        error: errorMsg,
        data: {...rowData, estatus: 'activo'}
      });
      
      await createBulkInvitationDetail({
        bulkInvitationId: bulkInvitation.id,
        fullName: `${rowData.nombre} ${rowData.apellido || ''}`,
        email: rowData.correo,
        status: 'failed',
        errorMessage: errorMsg
      });
    }
  }
  
  await updateBulkInvitation({
    id: bulkInvitation.id,
    processedRows: successCount,
    failedRows: errors.length,
    status: errors.length === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed')
  });
  
  onSuccess(successCount);
  onError(errors);
  
  showImportResultToast(successCount, errors.length);

  return {
    bulkInvitationId: bulkInvitation.id,
    successCount,
    errors
  };
};
