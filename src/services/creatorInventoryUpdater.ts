
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { format, parse } from 'date-fns';
import { toast } from "sonner";

export interface CreatorStatusUpdate {
  correo: string;
  enviado_hubspot?: boolean;
  fecha_envio_hubspot?: string;
  tiene_invitacion?: boolean;
  codigo_invitacion?: string;
  tiene_prompt_generado?: boolean;
  usuario_asignado?: string;
}

export interface UpdateCreatorResult {
  success: number;
  failed: number;
  errors: { row: number; email: string; error: string }[];
}

export const processCreatorStatusExcel = async (file: File): Promise<CreatorStatusUpdate[]> => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    
    const data = XLSX.utils.sheet_to_json<any>(worksheet);
    
    // Validate and transform the data
    const updates: CreatorStatusUpdate[] = [];
    
    for (const row of data) {
      if (!row.correo) {
        continue; // Skip rows without an email
      }
      
      const update: CreatorStatusUpdate = {
        correo: row.correo,
      };
      
      // Process boolean fields
      if (row.enviado_hubspot !== undefined) {
        update.enviado_hubspot = parseBooleanField(row.enviado_hubspot);
      }
      
      if (row.tiene_invitacion !== undefined) {
        update.tiene_invitacion = parseBooleanField(row.tiene_invitacion);
      }
      
      if (row.tiene_prompt_generado !== undefined) {
        update.tiene_prompt_generado = parseBooleanField(row.tiene_prompt_generado);
      }
      
      // Process date field - expecting DD/MM/YYYY format
      if (row.fecha_envio_hubspot) {
        try {
          // Parse the date string and convert to ISO format
          const parsedDate = parse(row.fecha_envio_hubspot, 'dd/MM/yyyy', new Date());
          update.fecha_envio_hubspot = parsedDate.toISOString();
        } catch (error) {
          console.error('Invalid date format:', row.fecha_envio_hubspot);
        }
      }
      
      // Process string fields
      if (row.codigo_invitacion !== undefined) {
        update.codigo_invitacion = String(row.codigo_invitacion);
      }
      
      if (row.usuario_asignado !== undefined) {
        update.usuario_asignado = String(row.usuario_asignado);
      }
      
      updates.push(update);
    }
    
    return updates;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw new Error('Failed to process Excel file');
  }
};

// Helper function to parse boolean fields from various formats
const parseBooleanField = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lowercased = value.toLowerCase();
    return lowercased === 'true' || lowercased === 'si' || lowercased === 'sí' || 
           lowercased === 'yes' || lowercased === '1' || lowercased === 'verdadero';
  }
  return false;
};

export const updateCreatorsStatus = async (updates: CreatorStatusUpdate[]): Promise<UpdateCreatorResult> => {
  const result: UpdateCreatorResult = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    
    try {
      // Build the update object with only the fields that are present
      const updateData: any = {};
      
      if (update.enviado_hubspot !== undefined) {
        updateData.enviado_hubspot = update.enviado_hubspot;
      }
      
      if (update.fecha_envio_hubspot !== undefined) {
        updateData.fecha_envio_hubspot = update.fecha_envio_hubspot;
      }
      
      if (update.tiene_invitacion !== undefined) {
        updateData.tiene_invitacion = update.tiene_invitacion;
      }
      
      if (update.codigo_invitacion !== undefined) {
        updateData.codigo_invitacion = update.codigo_invitacion;
      }
      
      if (update.tiene_prompt_generado !== undefined) {
        updateData.tiene_prompt_generado = update.tiene_prompt_generado;
      }
      
      if (update.usuario_asignado !== undefined) {
        updateData.usuario_asignado = update.usuario_asignado;
      }
      
      // Update the creator if the email matches
      const { data, error } = await supabase
        .from('creator_inventory')
        .update(updateData)
        .eq('correo', update.correo);
      
      if (error) {
        result.failed++;
        result.errors.push({
          row: i + 2, // +2 accounts for 0-based index and header row
          email: update.correo,
          error: error.message
        });
      } else {
        result.success++;
      }
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        row: i + 2,
        email: update.correo,
        error: error.message || 'Unknown error'
      });
    }
  }
  
  return result;
};

export const generateExcelTemplate = (): void => {
  // Create a worksheet with header
  const ws = XLSX.utils.aoa_to_sheet([
    ['correo', 'enviado_hubspot', 'fecha_envio_hubspot', 'tiene_invitacion', 'codigo_invitacion', 'tiene_prompt_generado', 'usuario_asignado'],
    ['ejemplo@correo.com', 'true', '15/04/2025', 'true', 'ABC123', 'false', 'usuario1']
  ]);
  
  // Create workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  
  // Generate and save the Excel file
  XLSX.writeFile(wb, 'actualizacion_creator_inventory.xlsx');
  
  toast.success('Plantilla descargada correctamente');
};
