
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { FileUploader } from "@/components/admin/inventory/import-templates/components/FileUploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreatorStatusUpdate, UpdateCreatorResult, generateExcelTemplate, processCreatorStatusExcel, updateCreatorsStatus } from "@/services/creatorInventoryUpdater";

export function StatusUpdater() {
  const [file, setFile] = useState<File | null>(null);
  const [updateResult, setUpdateResult] = useState<UpdateCreatorResult | null>(null);
  
  // Mutation for processing Excel file
  const processFileMutation = useMutation({
    mutationFn: processCreatorStatusExcel,
  });
  
  // Mutation for updating creator statuses
  const updateStatusesMutation = useMutation({
    mutationFn: updateCreatorsStatus,
    onSuccess: (result) => {
      setUpdateResult(result);
      
      if (result.success > 0) {
        if (result.failed === 0) {
          toast.success(`Se actualizaron ${result.success} creadores correctamente`);
        } else {
          toast.info(`Se actualizaron ${result.success} creadores, pero fallaron ${result.failed}`);
        }
      } else if (result.failed > 0) {
        toast.error(`Error al actualizar creadores. Se encontraron ${result.failed} errores.`);
      }
    },
    onError: (error: any) => {
      toast.error(`Error en la actualización: ${error.message || 'Error desconocido'}`);
    }
  });
  
  const handleImport = async () => {
    if (!file) {
      toast.error("Selecciona un archivo Excel para importar");
      return;
    }
    
    try {
      // First process the file to get the updates
      const updates = await processFileMutation.mutateAsync(file);
      
      if (updates.length === 0) {
        toast.error("No se encontraron datos válidos en el archivo");
        return;
      }
      
      // Then update the creators
      await updateStatusesMutation.mutateAsync(updates);
    } catch (error: any) {
      toast.error(`Error al procesar el archivo: ${error.message || 'Error desconocido'}`);
    }
  };
  
  const isProcessing = processFileMutation.isPending || updateStatusesMutation.isPending;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Actualizar Estado de Creadores</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateExcelTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Plantilla
          </Button>
        </CardTitle>
        <CardDescription>
          Actualiza el estado de los creadores basado en el correo electrónico como campo clave
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <AlertTitle>Información importante</AlertTitle>
          <AlertDescription className="text-sm">
            <ul className="list-disc pl-5 space-y-1">
              <li>El campo <strong>correo</strong> es obligatorio y se usa como clave para buscar los creadores</li>
              <li>El campo <strong>fecha_envio_hubspot</strong> debe estar en formato DD/MM/YYYY</li>
              <li>Los campos <strong>enviado_hubspot</strong>, <strong>tiene_invitacion</strong>, y <strong>tiene_prompt_generado</strong> deben ser valores booleanos</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="border rounded-md p-4 bg-gray-50">
          <FileUploader file={file} setFile={setFile} />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleImport} 
          disabled={!file || isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Importar y Actualizar</span>
            </>
          )}
        </Button>
      </CardFooter>
      
      {updateResult && (
        <div className="px-6 pb-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultado de la Importación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded border border-green-200 text-green-700">
                  <p className="font-medium">Creadores Actualizados</p>
                  <p className="text-2xl font-bold">{updateResult.success}</p>
                </div>
                <div className="bg-red-50 p-3 rounded border border-red-200 text-red-700">
                  <p className="font-medium">Errores</p>
                  <p className="text-2xl font-bold">{updateResult.failed}</p>
                </div>
              </div>
              
              {updateResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Detalle de errores:</h3>
                  <div className="max-h-64 overflow-y-auto border rounded">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3">Fila</th>
                          <th className="px-6 py-3">Correo</th>
                          <th className="px-6 py-3">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {updateResult.errors.map((err, index) => (
                          <tr key={index} className="text-sm">
                            <td className="px-6 py-4">{err.row}</td>
                            <td className="px-6 py-4">{err.email}</td>
                            <td className="px-6 py-4 text-red-600">{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}
