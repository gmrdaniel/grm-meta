
import * as XLSX from 'xlsx';
import { EmailCreator, EmailCreatorImportRow, EmailCreatorImportResult, PaginationParams, PaginatedResponse } from '@/types/email-creator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Fetch email creators from the database with pagination
export const getEmailCreators = async (params?: PaginationParams): Promise<PaginatedResponse<EmailCreator>> => {
  try {
    // Default values for pagination
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('email_creators')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error("Error counting email creators:", countError);
      throw countError;
    }
    
    // Get paginated data
    const { data, error } = await supabase
      .from('email_creators')
      .select('*')
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + pageSize - 1) as { data: EmailCreator[] | null, error: any };
      
    if (error) {
      console.error("Error fetching email creators:", error);
      throw error;
    }
    
    const total = count || 0;
    
    return {
      data: data || [],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (error) {
    console.error("Error in getEmailCreators:", error);
    toast.error("Failed to load email creators");
    return {
      data: [],
      total: 0,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
      totalPages: 0
    };
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
        const newCreator: any = {
          full_name: row['Nombre'],
          email: row['Correo'],
          tiktok_link: row['Link de TikTok'],
          status: 'active',
          source_file: file.name // Add the source file name
        };

        // Add the optional link_invitation field if it exists
        if (row['Link de Invitación'] && typeof row['Link de Invitación'] === 'string') {
          newCreator.link_invitation = row['Link de Invitación'];
        }

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
