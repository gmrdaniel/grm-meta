
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImportError } from "../types";

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

// Basic validation functions that can be reused
export const validateBasicCreatorData = (rowData: any): string[] => {
  const rowErrors = [];
  if (!rowData.nombre) rowErrors.push("Nombre es requerido");
  if (!rowData.correo) {
    rowErrors.push("Correo es requerido");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.correo)) {
    rowErrors.push("Correo no tiene formato válido");
  }
  return rowErrors;
};

// Function to handle showing toast messages based on import results
export const showImportResultToast = (successCount: number, errorsCount: number) => {
  if (errorsCount === 0 && successCount > 0) {
    toast.success(`${successCount} creadores importados correctamente`);
  } else if (errorsCount > 0 && successCount > 0) {
    toast.info(`Importación parcial: ${successCount} creadores importados, ${errorsCount} errores`);
  } else if (errorsCount > 0 && successCount === 0) {
    toast.error(`La importación falló con ${errorsCount} errores`);
  }
};
