
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, XCircle } from "lucide-react";

interface FileUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export function FileUploader({ file, setFile }: FileUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileSpreadsheet className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Haz clic para seleccionar</span> o arrastra un archivo Excel</p>
            <p className="text-xs text-gray-500">.XLS, .XLSX</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".xls,.xlsx" 
            onChange={handleFileChange} 
          />
        </label>
      </div>
      
      {file && (
        <div className="bg-blue-50 p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFile(null)}
            className="text-red-500 hover:text-red-700"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
