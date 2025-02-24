
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";

export function DownloadRatesTemplate() {
  const downloadTemplate = () => {
    const template = [
      ["email", "platform", "post_type", "rate_usd", "is_active"],
      ["creator@example.com", "Instagram", "Post", "100", "true"],
      ["creator2@example.com", "TikTok", "Video", "150", "true"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tarifas");
    XLSX.writeFile(wb, "plantilla_tarifas.xlsx");
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
