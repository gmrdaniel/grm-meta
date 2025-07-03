
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
    })
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
    })
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
      first_name: data.fullName,
      email: data.email,
      status: data.status,
      error_message: data.errorMessage || null
    });

  if (error) throw error;
};

export const generateExcelTemplate = () => {
  const templateData = [
    ["full_name", "email", "tiktok_username"],
    ["Juan Perez", "juan@example.com", "juantiktok"],
    ["María Gonzales", "maria@example.com", "mariatiktok"]
  ];
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(templateData);
  XLSX.utils.book_append_sheet(wb, ws, "Tiktok Template");
  XLSX.writeFile(wb, "tiktok_template.xlsx");
};

export const processExcelFile = async (file: File): Promise<string> => {
  if (!file) {
    toast.error("Select an Excel file to import");
    throw new Error("No file selected");
  }
  
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
    
    let csvData = "";
    ;
    
    jsonData.forEach((row: any[], index: number) => {
      csvData += row.join(",") + "\n";
    });
    
    return csvData;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    toast.error("Error reading Excel file");
    throw error;
  }
};

export const validateCreatorData = (rowData: any): string[] => {
  const rowErrors = [];
  if (!rowData.nombre) rowErrors.push("Full Name is required");
  if (!rowData.apellido) rowErrors.push("Last name is required");
  if (!rowData.correo) {
    rowErrors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.correo)) {
    rowErrors.push("Email does not have a valid format");
  }
  console.log('error');
  
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
    toast.error("Enter the data to import");
    throw new Error("No data to import");
  }
  
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  
  const requiredHeaders = ["full_name", "email", "tiktok_username"];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    toast.error(`Required headers are missing: ${missingHeaders.join(', ')}`);
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
        email: rowData.correo || 'No mail',
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
      const errorMsg = error.message || "Error creating creator";
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
    toast.success(`${successCount} creators imported successfully`);
  } else if (errors.length > 0 && successCount > 0) {

    toast.info(`Partial import: ${successCount} imported creators, ${errors.length} errors`);  } else if (errors.length > 0 && successCount === 0) {
    toast.error(`The import failed with ${errors.length} errors`);
  }

  return {
    bulkInvitationId: bulkInvitation.id,
    successCount,
    errors
  };
};
