
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileDown, Upload } from "lucide-react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

export function BulkInviteCreators() {
  const [isUploading, setIsUploading] = useState(false);

  const downloadTemplate = () => {
    const template = [
      ["Nombre", "Email", "Activo"],
      ["Juan Pérez", "juan@ejemplo.com", "TRUE"],
      ["María García", "maria@ejemplo.com", "TRUE"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_creadores.xlsx");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        // Validar datos
        const validRows = rows.filter((row: any) => {
          const isValid = row.Nombre && row.Email && 
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.Email) &&
            (row.Activo === 'TRUE' || row.Activo === 'FALSE');
          return isValid;
        });

        if (validRows.length === 0) {
          throw new Error("No se encontraron filas válidas en el archivo");
        }

        // Crear registro de invitación masiva
        const { data: bulkInvitation, error: invitationError } = await supabase
          .from('bulk_creator_invitations')
          .insert({
            file_name: file.name,
            total_rows: rows.length,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (invitationError) throw invitationError;

        // Insertar detalles
        const details = validRows.map((row: any) => ({
          bulk_invitation_id: bulkInvitation.id,
          full_name: row.Nombre,
          email: row.Email,
          is_active: row.Activo === 'TRUE',
        }));

        const { error: detailsError } = await supabase
          .from('bulk_creator_invitation_details')
          .insert(details);

        if (detailsError) throw detailsError;

        toast.success(`Archivo procesado: ${validRows.length} registros válidos de ${rows.length} totales`);
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error:', error);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Descargar Plantilla
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="file-upload"
            className="text-sm font-medium text-gray-700"
          >
            Subir archivo completado
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="relative"
              disabled={isUploading}
            >
              <input
                id="file-upload"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Subiendo..." : "Seleccionar archivo"}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Formatos aceptados: .xlsx, .xls
          </p>
        </div>
      </div>
    </div>
  );
}
