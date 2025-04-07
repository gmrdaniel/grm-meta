
import * as XLSX from 'xlsx';
import { EmailCreator, EmailCreatorImportRow, EmailCreatorImportResult } from '@/types/email-creator';
import { toast } from 'sonner';

// Simulated data store (would be replaced with actual DB calls)
const emailCreators: EmailCreator[] = [];

export const getEmailCreators = (): EmailCreator[] => {
  return emailCreators;
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
    jsonData.forEach((row, index) => {
      try {
        // Validate the row data
        if (!row['Nombre'] || typeof row['Nombre'] !== 'string') {
          throw new Error('Missing or invalid "Nombre" field');
        }

        if (!row['Link de TikTok'] || typeof row['Link de TikTok'] !== 'string') {
          throw new Error('Missing or invalid "Link de TikTok" field');
        }

        // Create a new email creator
        const newCreator: EmailCreator = {
          id: crypto.randomUUID(),
          full_name: row['Nombre'],
          tiktok_link: row['Link de TikTok'],
          created_at: new Date().toISOString(),
          status: 'active'
        };

        // Add to the data store
        emailCreators.push(newCreator);
        result.successful++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: index + 2, // +2 because Excel starts at 1 and we have header row
          message: error.message
        });
      }
    });

    return result;
  } catch (error) {
    console.error("Error importing email creators:", error);
    toast.error("Failed to import email creators");
    throw error;
  }
};
