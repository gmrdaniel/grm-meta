import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
interface FileUploadButtonProps {
  isUploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export function FileUploadButton({
  isUploading,
  onFileSelect
}: FileUploadButtonProps) {
  return <div className="flex flex-col gap-2 py-[4px]">
      <label htmlFor="file-upload" className="text-sm font-medium text-gray-700 py-0">
        Subir archivo completado
      </label>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="relative" disabled={isUploading}>
          <input id="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".xlsx,.xls" onChange={onFileSelect} disabled={isUploading} />
          {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          {isUploading ? "Procesando..." : "Seleccionar archivo"}
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        Formatos aceptados: .xlsx, .xls
      </p>
    </div>;
}