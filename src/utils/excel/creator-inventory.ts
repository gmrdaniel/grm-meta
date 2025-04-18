
import * as XLSX from 'xlsx';
import { format, isValid, parse, addDays } from 'date-fns';
import { CreatorStatusUpdate, NombreRealStatus } from '@/types/creator-inventory';

const parseExcelDate = (excelDate: string | number): string | null => {
  if (typeof excelDate === 'string') {
    const parsedDate = parse(excelDate, 'dd/MM/yyyy', new Date());
      
    if (isValid(parsedDate)) {
      return format(parsedDate, 'yyyy-MM-dd');
    }
    
    return null;
  }
  
  if (typeof excelDate === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
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

const parseEnumField = (value: any): NombreRealStatus | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    switch (normalizedValue) {
      case 'pendiente':
      case 'proceso':
      case 'error':
      case 'completado':
        return normalizedValue as NombreRealStatus;
      default:
        return undefined;
    }
  }
  
  return undefined;
};

export const generateExcelTemplate = () => {
  const workbook = XLSX.utils.book_new();
  const data = [{
    correo: 'ejemplo@correo.com',
    enviado_hubspot: 'TRUE',
    tiene_invitacion: 'FALSE',
    tiene_prompt_generado: 'TRUE',
    tiene_nombre_real: 'proceso',
    fecha_envio_hubspot: format(new Date(), 'dd/MM/yyyy')
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

  const enumValidation = {
    type: 'list',
    formula1: '"pendiente,proceso,error,completado"',
    showErrorMessage: true,
    errorTitle: 'Valor inválido',
    error: 'Por favor seleccione un estado válido',
    showInputMessage: true,
    promptTitle: 'Estado de nombre real',
    prompt: 'Seleccione: pendiente, proceso, error, completado'
  };
  
  if (!worksheet['!dataValidations']) {
    worksheet['!dataValidations'] = [];
  }
  
  ['B', 'C', 'D'].forEach(col => {
    worksheet['!dataValidations'].push({
      sqref: `${col}2:${col}1000`,
      ...booleanValidation
    });
  });

  worksheet['!dataValidations'].push({
    sqref: 'E2:E1000',
    ...enumValidation
  });
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, `template_actualizacion_creadores_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const processExcelFile = async (file: File): Promise<CreatorStatusUpdate[]> => {
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
            tiene_nombre_real: parseEnumField(row.tiene_nombre_real)
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
