import * as XLSX from 'xlsx';
import { format, isValid, parse, addDays } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from '@/integrations/supabase/types';

export interface UpdateCreatorResult {
  success: number;
  failed: number;
  errors: { row: number; email: string; error: string; }[];
}

export const updateCreatorsStatus = async (updates: CreatorStatusUpdate[]): Promise<UpdateCreatorResult> => {
  let successCount = 0;
  let failedCount = 0;
  const errors: { row: number; email: string; error: string; }[] = [];
  
  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    
    if (!update.correo) {
      failedCount++;
      errors.push({ row: i + 2, email: update.correo, error: "Correo electrónico es requerido" });
      continue;
    }
    
    try {
      const { error } = await supabase
        .from('creator_inventory')
        .update({
          enviado_hubspot: update.enviado_hubspot,
          tiene_invitacion: update.tiene_invitacion,
          tiene_prompt_generado: update.tiene_prompt_generado,
          tiene_nombre_real: update.tiene_nombre_real,
          fecha_envio_hubspot: update.fecha_envio_hubspot ? update.fecha_envio_hubspot : null,
        })
        .eq('correo', update.correo);
      
      if (error) {
        failedCount++;
        errors.push({ row: i + 2, email: update.correo, error: error.message });
      } else {
        successCount++;
      }
    } catch (error: any) {
      failedCount++;
      errors.push({ row: i + 2, email: update.correo, error: error.message });
    }
  }
  
  return { success: successCount, failed: failedCount, errors };
};

const parseExcelDate = (excelDate: string | number): string | null => {
  if (typeof excelDate === 'string') {
    const parsedDate = parse(excelDate, 'dd/MM/yyyy', new Date());
      
    if (isValid(parsedDate)) {
      return format(parsedDate, 'yyyy-MM-dd');
    }
    
    return null;
  }
  
  if (typeof excelDate === 'number') {
    const excelEpoch = new Date(1899, 11, 30); // Month is 0-indexed in JS, so 11 = December
    const date = addDays(excelEpoch, excelDate);
    
    if (isValid(date)) {
      return format(date, 'yyyy-MM-dd');
    }
    return null;
  }
  
  return null;
};

const parseBooleanField = (value: any): boolean | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') {
      return true;
    } else if (normalizedValue === 'false') {
      return false;
    }
  }
  
  return undefined;
};

export const generateExcelTemplate = () => {
  const workbook = XLSX.utils.book_new();
  const data = [{
    correo: '',
    enviado_hubspot: '',
    tiene_invitacion: '',
    tiene_prompt_generado: '',
    tiene_nombre_real: '',
    fecha_envio_hubspot: ''
  }];
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const booleanValidation = {
    type: 'list',
    formula1: '"TRUE,FALSE"',
    showErrorMessage: true,
    errorTitle: 'Valor inválido',
    error: 'Por favor seleccione TRUE o FALSE',
    showInputMessage: true,
    promptTitle: 'Campo booleano',
    prompt: 'Seleccione TRUE o FALSE'
  };
  
  if (!worksheet['!dataValidations']) {
    worksheet['!dataValidations'] = [];
  }
  
  ['B', 'C', 'D', 'E'].forEach(col => {
    worksheet['!dataValidations'].push({
      sqref: `${col}2:${col}1000`,
      ...booleanValidation
    });
  });
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, `template_actualizacion_creadores_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export interface CreatorStatusUpdate {
  correo: string;
  enviado_hubspot?: boolean;
  tiene_invitacion?: boolean;
  tiene_prompt_generado?: boolean;
  tiene_nombre_real?: boolean;
  fecha_envio_hubspot?: string;
}

export const processCreatorStatusExcel = async (file: File): Promise<CreatorStatusUpdate[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      try {
        const binaryString = e.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const headers = data[0] as string[];
        const rows = data.slice(1);
        
        const jsonData: any[] = rows.map(row => {
          const rowData: any = {};
          headers.forEach((header, index) => {
            rowData[header?.trim()] = row[index];
          });
          return rowData;
        });
        
        const updates = jsonData.map((row: any) => {
          const update: CreatorStatusUpdate = {
            correo: row.correo?.toString().trim(),
            enviado_hubspot: parseBooleanField(row.enviado_hubspot),
            tiene_invitacion: parseBooleanField(row.tiene_invitacion),
            tiene_prompt_generado: parseBooleanField(row.tiene_prompt_generado),
            tiene_nombre_real: parseBooleanField(row.tiene_nombre_real)
          };

          if (row.fecha_envio_hubspot) {
            update.fecha_envio_hubspot = parseExcelDate(row.fecha_envio_hubspot);
          }

          return update;
        });
        
        resolve(updates);
      } catch (error: any) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};
