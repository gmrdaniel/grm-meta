import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { createCreator } from "@/services/creatorService";
import { toast } from "sonner";
import { CreatorImportData, ImportError } from "../types";

export const createBulkInvitation = async (data: { fileName: string; totalRows: number }) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("No se ha iniciado sesión");
  }

  const { data: invitation, error } = await supabase
    .from("bulk_creator_invitations")
    .insert({
      file_name: data.fileName,
      status: "processing",
      total_rows: data.totalRows,
      created_by: userData.user.id
    } as any)
    .select("*")
    .single();

  if (error) throw error;
  return invitation;
};

export const updateBulkInvitation = async (data: { 
  id: string, 
  processedRows: number, 
  failedRows: number, 
  status: string 
}) => {
  const { error } = await supabase
    .from("bulk_creator_invitations")
    .update({
      processed_rows: data.processedRows,
      failed_rows: data.failedRows,
      status: data.status,
      updated_at: new Date().toISOString()
    } as any)
    .eq("id", data.id);

  if (error) throw error;
};

export const createBulkInvitationDetail = async (data: { 
  bulkInvitationId: string, 
  fullName: string, 
  email: string, 
  status: string, 
  errorMessage?: string 
}) => {
  const { error } = await supabase
    .from("bulk_creator_invitation_details")
    .insert({
      bulk_invitation_id: data.bulkInvitationId,
      full_name: data.fullName,
      email: data.email,
      status: data.status,
      error_message: data.errorMessage || null
    } as any);

  if (error) throw error;
};

export const generateExcelTemplate = () => {
  const templateData = [
    ["nombre", "apellido", "correo", "usuario_tiktok"],
    ["Juan", "Pérez", "juan@example.com", "juantiktok"],
    ["María", "González", "maria@example.com", "mariatiktok"]
  ];
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(templateData);
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla TikTok");
  XLSX.writeFile(wb, "plantilla_tiktok.xlsx");
};

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

export const processExcelFile = async (file: File): Promise<string> => {
  if (!file) {
    toast.error("Selecciona un archivo Excel para importar");
    throw new Error("No file selected");
  }
  
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
    
    let csvData = "";
    
    jsonData.forEach((row: any[], index: number) => {
      csvData += row.join(",") + "\n";
    });
    
    return csvData;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    toast.error("Error al leer el archivo Excel");
    throw error;
  }
};

export const validateCreatorData = (rowData: any): string[] => {
  const rowErrors = [];
  if (!rowData.nombre) rowErrors.push("Nombre es requerido");
  if (!rowData.correo) {
    rowErrors.push("Correo es requerido");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.correo)) {
    rowErrors.push("Correo no tiene formato válido");
  }
  return rowErrors;
};

export const validateYouTubeCreatorData = (rowData: any): string[] => {
  const rowErrors = validateCreatorData(rowData);
  if (!rowData.usuario_youtube) rowErrors.push("Usuario YouTube es requerido");
  return rowErrors;
};

export const processImportData = async (
  csvData: string, 
  onError: (errors: ImportError[]) => void,
  onSuccess: (count: number) => void
): Promise<{
  bulkInvitationId: string,
  successCount: number,
  errors: ImportError[]
}> => {
  if (!csvData.trim()) {
    toast.error("Ingresa los datos para importar");
    throw new Error("No data to import");
  }
  
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  
  const requiredHeaders = ["nombre", "apellido", "correo", "usuario_tiktok"];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    toast.error(`Faltan encabezados requeridos: ${missingHeaders.join(', ')}`);
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  const validRowsCount = lines.filter((line, index) => index > 0 && line.trim()).length;
  
  const fileName = "import-csv-" + new Date().toISOString().slice(0, 10);
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
    
    const rowErrors = validateCreatorData(rowData);
    
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
        apellido: rowData.apellido,
        correo: rowData.correo,
        usuario_tiktok: rowData.usuario_tiktok,
        estatus: 'activo'
      });
      
      await createBulkInvitationDetail({
        bulkInvitationId: bulkInvitation.id,
        fullName: `${rowData.nombre} ${rowData.apellido}`,
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
        fullName: `${rowData.nombre} ${rowData.apellido}`,
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
  
  if (errors.length === 0 && successCount > 0) {
    toast.success(`${successCount} creadores importados correctamente`);
  } else if (errors.length > 0 && successCount > 0) {
    toast.info(`Importación parcial: ${successCount} creadores importados, ${errors.length} errores`);
  } else if (errors.length > 0 && successCount === 0) {
    toast.error(`La importación falló con ${errors.length} errores`);
  }

  return {
    bulkInvitationId: bulkInvitation.id,
    successCount,
    errors
  };
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
    toast.error("Ingresa los datos para importar");
    throw new Error("No data to import");
  }
  
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  
  const requiredHeaders = ["nombre", "correo", "usuario_youtube"];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    toast.error(`Faltan encabezados requeridos: ${missingHeaders.join(', ')}`);
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
  
  if (errors.length === 0 && successCount > 0) {
    toast.success(`${successCount} creadores importados correctamente`);
  } else if (errors.length > 0 && successCount > 0) {
    toast.info(`Importación parcial: ${successCount} creadores importados, ${errors.length} errores`);
  } else if (errors.length > 0 && successCount === 0) {
    toast.error(`La importación falló con ${errors.length} errores`);
  }

  return {
    bulkInvitationId: bulkInvitation.id,
    successCount,
    errors
  };
};
