
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

// Update an email creator's prompt, prompt output and status
export const updateEmailCreatorPrompt = async (
  id: string,
  prompt: string,
  promptOutput: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_creators')
      .update({
        prompt,
        prompt_output: promptOutput,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id) as { error: any };

    if (error) {
      console.error("Error updating email creator prompt:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateEmailCreatorPrompt:", error);
    toast.error("Failed to update email creator prompt");
    throw error;
  }
};

export const importEmailCreatorsFromExcel = async (file: File): Promise<EmailCreatorImportResult> => {
  const result: EmailCreatorImportResult = {
    successful: 0,
    failed: 0,
    errors: []
  };

  try {
    console.log("Starting import process with file:", file.name);
    
    // Read the file
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    
    if (!workbook.SheetNames.length) {
      throw new Error("No sheets found in Excel file");
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
    
    console.log("Parsed Excel data:", jsonData.length, "rows");

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      try {
        console.log("Processing row:", row);
        
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

        console.log("Inserting new creator:", newCreator);

        // Insert into the database with type assertion
        const { error } = await supabase
          .from('email_creators')
          .insert([newCreator]) as { error: any };

        if (error) {
          console.error("Database insertion error:", error);
          throw new Error(`Database error: ${error.message}`);
        }

        result.successful++;
      } catch (error: any) {
        console.error("Error processing row", i + 2, ":", error.message);
        result.failed++;
        result.errors.push({
          row: i + 2, // +2 because Excel starts at 1 and we have header row
          message: error.message
        });
      }
    }

    console.log("Import completed:", result);
    return result;
  } catch (error) {
    console.error("Error importing email creators:", error);
    toast.error("Failed to import email creators");
    throw error;
  }
};
