
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { ImportError } from "./types";
import { ImportResultCard } from "./components/ImportResultCard";
import { FileUploader } from "./components/FileUploader";
import { ImportMethodSelector } from "./components/ImportMethodSelector";
import { 
  generateExcelTemplate, 
  processImportData 
} from "./utils/tiktokUtils";
import { processExcelFile } from "./utils/commonUtils";

interface TikTokImportTemplateProps {
  onSuccess?: () => void;
}

export function TikTokImportTemplate({ onSuccess }: TikTokImportTemplateProps) {
  const [inputData, setInputData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importSuccess, setImportSuccess] = useState<number>(0);
  const [importMethod, setImportMethod] = useState<'csv' | 'excel'>('csv');
  const [file, setFile] = useState<File | null>(null);
  
  const downloadTemplate = () => {
    generateExcelTemplate();
  };
  
  const importMutation = useMutation({
    mutationFn: async (csvData: string) => {
      return processImportData(
        csvData,
        setImportErrors,
        setImportSuccess
      );
    }
  });

  const excelFileMutation = useMutation({
    mutationFn: processExcelFile
  });
  
  const handleProcessExcelFile = async () => {
    if (!file) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const csvData = await excelFileMutation.mutateAsync(file);
      setInputData(csvData);
      await importMutation.mutateAsync(csvData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error processing Excel file:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleImportCsv = async () => {
    setIsProcessing(true);
    
    try {
      await importMutation.mutateAsync(inputData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onSuccess && onSuccess()}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h2 className="text-xl font-bold">Plantilla: Usuario TikTok</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Importar Creadores con TikTok</CardTitle>
          <CardDescription>
            Importa múltiples creadores con sus datos básicos y usuario de TikTok
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Formato: nombre, apellido, correo, usuario_tiktok
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar Plantilla Excel
            </Button>
          </div>
          
          <div className="border rounded-md p-4 bg-gray-50">
            <ImportMethodSelector 
              importMethod={importMethod} 
              setImportMethod={setImportMethod} 
            />
            
            {importMethod === 'excel' ? (
              <FileUploader file={file} setFile={setFile} />
            ) : (
              <Textarea 
                placeholder="Pega aquí los datos en formato CSV o escribe directamente respetando el formato"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            )}
          </div>
          
          <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription className="text-sm">
              La primera fila debe contener los encabezados: nombre,apellido,correo,usuario_tiktok
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            disabled={isProcessing} 
            onClick={importMethod === 'excel' ? handleProcessExcelFile : handleImportCsv}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Importar Datos
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <ImportResultCard 
        importErrors={importErrors}
        importSuccess={importSuccess}
      />
    </div>
  );
}
