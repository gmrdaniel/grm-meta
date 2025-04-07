
import * as XLSX from 'xlsx';
import { EmailCreator, EmailCreatorImportRow, EmailCreatorImportResult } from '@/types/email-creator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Fetch email creators from the database
export const getEmailCreators = async (): Promise<EmailCreator[]> => {
  try {
    // Using type assertion to handle the typing issue
    const { data, error } = await supabase
      .from('email_creators')
      .select('*')
      .order('created_at', { ascending: false }) as { data: EmailCreator[] | null, error: any };
      
    if (error) {
      console.error("Error fetching email creators:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getEmailCreators:", error);
    toast.error("Failed to load email creators");
    return [];
  }
};

export const importEmailCreatorsFromExcel = async (file: File): Promise<EmailCreatorImportResult> => {
  const result: EmailCreatorImportResult = {
    successful: 0,
    failed: 0,
    errors: []
  };

  try {
    // Read the file
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      try {
        // Validate the row data
        if (!row['Nombre'] || typeof row['Nombre'] !== 'string') {
          throw new Error('Missing or invalid "Nombre" field');
        }

        if (!row['Correo'] || typeof row['Correo'] !== 'string') {
          throw new Error('Missing or invalid "Correo" field');
        }

        if (!row['Link de TikTok'] || typeof row['Link de TikTok'] !== 'string') {
          throw new Error('Missing or invalid "Link de TikTok" field');
        }

        // Create a new email creator
        const newCreator = {
          full_name: row['Nombre'],
          email: row['Correo'],
          tiktok_link: row['Link de TikTok'],
          status: 'active'
        };

        // Insert into the database with type assertion
        const { error } = await supabase
          .from('email_creators')
          .insert([newCreator]) as { error: any };

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        result.successful++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: i + 2, // +2 because Excel starts at 1 and we have header row
          message: error.message
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error importing email creators:", error);
    toast.error("Failed to import email creators");
    throw error;
  }
};
