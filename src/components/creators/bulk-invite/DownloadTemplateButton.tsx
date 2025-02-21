
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import * as XLSX from 'xlsx';

export function DownloadTemplateButton() {
  const downloadTemplate = () => {
    const template = [
      ["Nombre", "Email", "Activo", "Enviar Invitación"],
      ["Juan Pérez", "juan@ejemplo.com", "TRUE", "TRUE"],
      ["María García", "maria@ejemplo.com", "TRUE", "FALSE"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_creadores.xlsx");
  };

  return (
    <Button
      variant="outline"
      onClick={downloadTemplate}
      className="flex items-center gap-2"
    >
      <FileDown className="h-4 w-4" />
      Descargar Plantilla
    </Button>
  );
}
