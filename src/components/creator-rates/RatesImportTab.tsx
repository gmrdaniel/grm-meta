
import { useState } from "react";
import { FileUploadButton } from "@/components/creators/bulk-invite/FileUploadButton";
import { RatesImportPreview } from "./components/RatesImportPreview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export function RatesImportTab() {
  const [isUploading, setIsUploading] = useState(false);
  const [importId, setImportId] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const workbook = await file.arrayBuffer().then(buffer => XLSX.read(buffer));
      const firstSheet = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

      // Create import record
      const { data: importData, error: importError } = await supabase
        .from('rate_imports')
        .insert({
          file_name: file.name,
          total_rows: rows.length,
          status: 'processing'
        })
        .select()
        .single();

      if (importError) throw importError;

      // Process each row
      const importDetails = rows.map((row: any) => ({
        import_id: importData.id,
        email: row.email || '',
        platform_name: row.platform || '',
        post_type_name: row.post_type || '',
        rate_usd: parseFloat(row.rate_usd) || 0,
        is_active: row.is_active === 'true' || row.is_active === true
      }));

      const { error: detailsError } = await supabase
        .from('rate_import_details')
        .insert(importDetails);

      if (detailsError) throw detailsError;

      setImportId(importData.id);
      toast.success("Archivo procesado correctamente");
    } catch (error: any) {
      console.error('Error processing file:', error);
      toast.error(error.message || "Error al procesar el archivo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-xl">
        <h3 className="text-lg font-medium mb-2">Importar Tarifas</h3>
        <p className="text-sm text-gray-500 mb-4">
          Sube un archivo Excel con las tarifas de los creadores. El archivo debe contener las columnas: email, platform, post_type, rate_usd, is_active.
        </p>
        <FileUploadButton 
          isUploading={isUploading} 
          onFileSelect={handleFileSelect}
        />
      </div>

      {importId && (
        <RatesImportPreview importId={importId} />
      )}
    </div>
  );
}
