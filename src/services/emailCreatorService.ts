
import * as XLSX from 'xlsx';
import { EmailCreator, EmailCreatorImportRow, EmailCreatorImportResult, PaginationParams, PaginatedResponse, SourceFileSummary } from '@/types/email-creator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Fetch email creators from the database with pagination
export const getEmailCreators = async (params?: PaginationParams): Promise<PaginatedResponse<EmailCreator>> => {
  try {
    // Default values for pagination
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const sourceFile = params?.sourceFile || null;
    const status = params?.status || null;

    // Build query
    let query = supabase.from('email_creators').select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (sourceFile) {
      query = query.eq('source_file', sourceFile);
    }
    
    // Updated status filter to check for prompt_output
    if (status) {
      if (status === 'completed') {
        query = query.not('prompt_output', 'is', null);
      } else if (status === 'pending') {
        query = query.is('prompt_output', null);
      } else {
        query = query.eq('status', status);
      }
    }
    
    // Get total count for pagination
    const { count, error: countError } = await query;
    
    if (countError) {
      console.error("Error counting email creators:", countError);
      throw countError;
    }
    
    // Reset query for data fetch
    query = supabase.from('email_creators').select('*');
    
    // Apply filters again for data query
    if (sourceFile) {
      query = query.eq('source_file', sourceFile);
    }
    
    // Apply the same status filter to the data query
    if (status) {
      if (status === 'completed') {
        query = query.not('prompt_output', 'is', null);
      } else if (status === 'pending') {
        query = query.is('prompt_output', null);
      } else {
        query = query.eq('status', status);
      }
    }
    
    // Get paginated data
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + pageSize - 1);
      
    if (error) {
      console.error("Error fetching email creators:", error);
      throw error;
    }
    
    const total = count || 0;
    
    return {
      data: (data || []) as EmailCreator[],
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

// Get source files summary with counts of processed and pending creators
export const getSourceFilesSummary = async (): Promise<SourceFileSummary[]> => {
  try {
    // First get all unique source files
    const { data: sourceFiles, error: sourceFilesError } = await supabase
      .from('email_creators')
      .select('source_file')
      .not('source_file', 'is', null);
    
    if (sourceFilesError) {
      console.error("Error fetching source files:", sourceFilesError);
      throw sourceFilesError;
    }

    const uniqueSourceFiles = [...new Set(sourceFiles?.map(item => item.source_file))].filter(Boolean);
    
    // For each source file, get counts
    const summaries: SourceFileSummary[] = [];
    
    for (const sourceFile of uniqueSourceFiles) {
      // Get total count
      const { count: totalCount, error: totalError } = await supabase
        .from('email_creators')
        .select('*', { count: 'exact' })
        .eq('source_file', sourceFile);
      
      if (totalError) {
        console.error(`Error getting total count for ${sourceFile}:`, totalError);
        continue;
      }
      
      // Get processed count (prompt_output is not null)
      const { count: processedCount, error: processedError } = await supabase
        .from('email_creators')
        .select('*', { count: 'exact' })
        .eq('source_file', sourceFile)
        .not('prompt_output', 'is', null);
      
      if (processedError) {
        console.error(`Error getting processed count for ${sourceFile}:`, processedError);
        continue;
      }
      
      // Calculate pending count
      const pendingCount = (totalCount || 0) - (processedCount || 0);
      
      summaries.push({
        sourceFile,
        totalCount: totalCount || 0,
        processedCount: processedCount || 0,
        pendingCount
      });
    }
    
    // Sort by source file name
    return summaries.sort((a, b) => a.sourceFile.localeCompare(b.sourceFile));
  } catch (error) {
    console.error("Error in getSourceFilesSummary:", error);
    toast.error("Failed to load source files summary");
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
        status: 'completed' as EmailCreator['status'],
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

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

// Import email creators from Excel
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

        // Check if the email already exists
        const { data: existingCreator, error: checkError } = await supabase
          .from('email_creators')
          .select('id, email')
          .eq('email', row['Correo'])
          .maybeSingle();

        if (checkError) {
          console.error("Error checking for existing email:", checkError);
          throw new Error(`Database error: ${checkError.message}`);
        }

        if (existingCreator) {
          throw new Error(`Email "${row['Correo']}" already exists in the database`);
        }

        // Create a new email creator
        const newCreator: {
          full_name: string;
          email: string;
          tiktok_link: string;
          status: EmailCreator['status'];
          source_file: string;
          link_invitation?: string;
        } = {
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

        // Insert into the database
        const { error } = await supabase
          .from('email_creators')
          .insert([newCreator]);

        if (error) {
          console.error("Database insertion error:", error);
          
          // Handle unique constraint violation
          if (error.code === '23505' && error.details?.includes('email')) {
            throw new Error(`Duplicate email: "${row['Correo']}" already exists in the database`);
          }
          
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
