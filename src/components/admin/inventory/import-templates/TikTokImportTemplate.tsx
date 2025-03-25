
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Download, Upload, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { createCreator } from "@/services/creatorService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface TikTokImportTemplateProps {
  onSuccess?: () => void;
}

interface CreatorImportData {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  estatus: 'activo' | 'inactivo' | 'pendiente'; // Add estatus to the interface
}

interface ImportError {
  row: number;
  error: string;
  data: CreatorImportData;
}

export function TikTokImportTemplate({ onSuccess }: TikTokImportTemplateProps) {
  const [inputData, setInputData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importSuccess, setImportSuccess] = useState<number>(0);
  
  // Template sample
  const templateSample = "nombre,apellido,correo,usuario_tiktok\nJuan,Pérez,juan@example.com,juantiktok\nMaría,González,maria@example.com,mariatiktok";
  
  const downloadTemplate = () => {
    const element = document.createElement("a");
    const file = new Blob([templateSample], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = "plantilla_tiktok.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const importMutation = useMutation({
    mutationFn: async (creator: Omit<CreatorImportData, 'id' | 'fecha_creacion'>) => {
      return createCreator(creator);
    }
  });
  
  const processImport = async () => {
    if (!inputData.trim()) {
      toast.error("Ingresa los datos para importar");
      return;
    }
    
    setIsProcessing(true);
    setImportErrors([]);
    setImportSuccess(0);
    
    try {
      // Parse CSV data
      const lines = inputData.trim().split('\n');
      const headers = lines[0].split(',');
      
      // Validate headers
      const requiredHeaders = ["nombre", "apellido", "correo", "usuario_tiktok"];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast.error(`Faltan encabezados requeridos: ${missingHeaders.join(', ')}`);
        setIsProcessing(false);
        return;
      }
      
      // Process data rows
      const errors: ImportError[] = [];
      let successCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const rowData: any = {};
        
        // Create object from CSV row
        headers.forEach((header, index) => {
          rowData[header.trim()] = values[index]?.trim() || "";
        });
        
        // Validate required fields
        const rowErrors = [];
        if (!rowData.nombre) rowErrors.push("Nombre es requerido");
        if (!rowData.apellido) rowErrors.push("Apellido es requerido");
        if (!rowData.correo) {
          rowErrors.push("Correo es requerido");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.correo)) {
          rowErrors.push("Correo no tiene formato válido");
        }
        
        if (rowErrors.length > 0) {
          errors.push({
            row: i,
            error: rowErrors.join(", "),
            data: {...rowData, estatus: 'activo'} // Ensure estatus is included
          });
          continue;
        }
        
        // Import to database
        try {
          await importMutation.mutateAsync({
            nombre: rowData.nombre,
            apellido: rowData.apellido,
            correo: rowData.correo,
            usuario_tiktok: rowData.usuario_tiktok,
            estatus: 'activo' // Set default status
          });
          successCount++;
        } catch (error: any) {
          errors.push({
            row: i,
            error: error.message || "Error al crear creador",
            data: {...rowData, estatus: 'activo'} // Ensure estatus is included
          });
        }
      }
      
      setImportSuccess(successCount);
      setImportErrors(errors);
      
      if (errors.length === 0 && successCount > 0) {
        toast.success(`${successCount} creadores importados correctamente`);
        if (onSuccess) onSuccess();
      } else if (errors.length > 0 && successCount > 0) {
        toast.info(`Importación parcial: ${successCount} creadores importados, ${errors.length} errores`);
      } else if (errors.length > 0 && successCount === 0) {
        toast.error(`La importación falló: ${errors.length} errores`);
      }
      
    } catch (error) {
      toast.error("Error al procesar la importación");
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
              Descargar Plantilla
            </Button>
          </div>
          
          <Textarea 
            placeholder="Pega aquí los datos en formato CSV o escribe directamente respetando el formato"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          
          <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription className="text-sm">
              La primera fila debe contener los encabezados: nombre,apellido,correo,usuario_tiktok
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            disabled={isProcessing} 
            onClick={processImport}
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
      
      {(importErrors.length > 0 || importSuccess > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado de la Importación</CardTitle>
            <CardDescription>
              {importSuccess > 0 && importErrors.length > 0
                ? `Se importaron ${importSuccess} creadores con ${importErrors.length} errores`
                : importSuccess > 0
                ? `Se importaron ${importSuccess} creadores correctamente`
                : `La importación falló con ${importErrors.length} errores`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {importSuccess > 0 && (
              <Alert variant="default" className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Importación exitosa</AlertTitle>
                <AlertDescription>
                  {importSuccess} creadores fueron importados correctamente
                </AlertDescription>
              </Alert>
            )}
            
            {importErrors.length > 0 && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Errores en la importación</AlertTitle>
                  <AlertDescription>
                    Se encontraron errores en {importErrors.length} registros
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fila</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datos</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {importErrors.map((error, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-4 py-2 text-sm text-gray-500">{error.row}</td>
                          <td className="px-4 py-2 text-sm">
                            <div><span className="font-medium">Nombre:</span> {error.data.nombre || '-'}</div>
                            <div><span className="font-medium">Apellido:</span> {error.data.apellido || '-'}</div>
                            <div><span className="font-medium">Correo:</span> {error.data.correo || '-'}</div>
                            <div><span className="font-medium">TikTok:</span> {error.data.usuario_tiktok || '-'}</div>
                          </td>
                          <td className="px-4 py-2 text-sm text-red-600">{error.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
