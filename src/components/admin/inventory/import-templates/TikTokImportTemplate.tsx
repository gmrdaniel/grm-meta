import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Download, Upload, AlertTriangle, CheckCircle2, XCircle, FileSpreadsheet } from "lucide-react";
import { createCreator } from "@/services/creatorService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

interface TikTokImportTemplateProps {
  onSuccess?: () => void;
}

interface CreatorImportData {
  nombre: string;
  apellido: string;
  correo: string;
  usuario_tiktok: string;
  estatus: 'activo' | 'inactivo' | 'pendiente';
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
  const [importMethod, setImportMethod] = useState<'csv' | 'excel'>('csv');
  const [file, setFile] = useState<File | null>(null);
  
  const templateData = [
    ["nombre", "apellido", "correo", "usuario_tiktok"],
    ["Juan", "Pérez", "juan@example.com", "juantiktok"],
    ["María", "González", "maria@example.com", "mariatiktok"]
  ];
  
  const templateSample = "nombre,apellido,correo,usuario_tiktok\nJuan,Pérez,juan@example.com,juantiktok\nMaría,González,maria@example.com,mariatiktok";
  
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla TikTok");
    XLSX.writeFile(wb, "plantilla_tiktok.xlsx");
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportMethod('excel');
    }
  };
  
  const processExcelFile = async () => {
    if (!file) {
      toast.error("Selecciona un archivo Excel para importar");
      return;
    }
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
      
      let csvData = "";
      
      jsonData.forEach((row: any[], index: number) => {
        csvData += row.join(",") + "\n";
      });
      
      setInputData(csvData);
      processImport(csvData);
      
    } catch (error) {
      console.error("Error reading Excel file:", error);
      toast.error("Error al leer el archivo Excel");
    }
  };
  
  const importMutation = useMutation({
    mutationFn: async (creator: Omit<CreatorImportData, 'id' | 'fecha_creacion'>) => {
      return createCreator(creator);
    }
  });

  const createBulkInvitationMutation = useMutation({
    mutationFn: async (data: { fileName: string; totalRows: number }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("No se ha iniciado sesión");
      }

      const { data: invitation, error } = await supabase
        .from("bulk_creator_invitations")
        .insert({
          file_name: data.fileName,
          status: "processing",
          total_rows: data.totalRows,
          created_by: userData.user.id
        })
        .select("*")
        .single();

      if (error) throw error;
      return invitation;
    }
  });

  const updateBulkInvitationMutation = useMutation({
    mutationFn: async (data: { 
      id: string, 
      processedRows: number, 
      failedRows: number, 
      status: string 
    }) => {
      const { error } = await supabase
        .from("bulk_creator_invitations")
        .update({
          processed_rows: data.processedRows,
          failed_rows: data.failedRows,
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq("id", data.id);

      if (error) throw error;
    }
  });

  const createBulkInvitationDetailMutation = useMutation({
    mutationFn: async (data: { 
      bulkInvitationId: string, 
      fullName: string, 
      email: string, 
      status: string, 
      errorMessage?: string 
    }) => {
      const { error } = await supabase
        .from("bulk_creator_invitation_details")
        .insert({
          bulk_invitation_id: data.bulkInvitationId,
          full_name: data.fullName,
          email: data.email,
          status: data.status,
          error_message: data.errorMessage || null
        });

      if (error) throw error;
    }
  });
  
  const processImport = async (csvContent?: string) => {
    const dataToProcess = csvContent || inputData;
    
    if (!dataToProcess.trim()) {
      toast.error("Ingresa los datos para importar");
      return;
    }
    
    setIsProcessing(true);
    setImportErrors([]);
    setImportSuccess(0);
    
    try {
      const lines = dataToProcess.trim().split('\n');
      const headers = lines[0].split(',');
      
      const requiredHeaders = ["nombre", "apellido", "correo", "usuario_tiktok"];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast.error(`Faltan encabezados requeridos: ${missingHeaders.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      const validRowsCount = lines.filter((line, index) => index > 0 && line.trim()).length;
      
      const fileName = file ? file.name : "import-csv-" + new Date().toISOString().slice(0, 10);
      const bulkInvitation = await createBulkInvitationMutation.mutateAsync({
        fileName,
        totalRows: validRowsCount
      });
      
      const errors: ImportError[] = [];
      let successCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header.trim()] = values[index]?.trim() || "";
        });
        
        const rowErrors = [];
        if (!rowData.nombre) rowErrors.push("Nombre es requerido");
        if (!rowData.apellido) rowErrors.push("Apellido es requerido");
        if (!rowData.correo) {
          rowErrors.push("Correo es requerido");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.correo)) {
          rowErrors.push("Correo no tiene formato válido");
        }
        
        if (rowErrors.length > 0) {
          const errorMsg = rowErrors.join(", ");
          errors.push({
            row: i,
            error: errorMsg,
            data: {...rowData, estatus: 'activo'}
          });
          
          await createBulkInvitationDetailMutation.mutateAsync({
            bulkInvitationId: bulkInvitation.id,
            fullName: `${rowData.nombre || ''} ${rowData.apellido || ''}`.trim() || 'Sin nombre',
            email: rowData.correo || 'Sin correo',
            status: 'failed',
            errorMessage: errorMsg
          });
          
          continue;
        }
        
        try {
          await importMutation.mutateAsync({
            nombre: rowData.nombre,
            apellido: rowData.apellido,
            correo: rowData.correo,
            usuario_tiktok: rowData.usuario_tiktok,
            estatus: 'activo'
          });
          
          await createBulkInvitationDetailMutation.mutateAsync({
            bulkInvitationId: bulkInvitation.id,
            fullName: `${rowData.nombre} ${rowData.apellido}`,
            email: rowData.correo,
            status: 'completed'
          });
          
          successCount++;
        } catch (error: any) {
          const errorMsg = error.message || "Error al crear creador";
          errors.push({
            row: i,
            error: errorMsg,
            data: {...rowData, estatus: 'activo'}
          });
          
          await createBulkInvitationDetailMutation.mutateAsync({
            bulkInvitationId: bulkInvitation.id,
            fullName: `${rowData.nombre} ${rowData.apellido}`,
            email: rowData.correo,
            status: 'failed',
            errorMessage: errorMsg
          });
        }
      }
      
      await updateBulkInvitationMutation.mutateAsync({
        id: bulkInvitation.id,
        processedRows: successCount,
        failedRows: errors.length,
        status: errors.length === 0 ? 'completed' : (successCount > 0 ? 'completed' : 'failed')
      });
      
      setImportSuccess(successCount);
      setImportErrors(errors);
      
      if (errors.length === 0 && successCount > 0) {
        toast.success(`${successCount} creadores importados correctamente`);
        if (onSuccess) onSuccess();
      } else if (errors.length > 0 && successCount > 0) {
        toast.info(`Importación parcial: ${successCount} creadores importados, ${errors.length} errores`);
      } else if (errors.length > 0 && successCount === 0) {
        toast.error(`La importación falló con ${errors.length} errores`);
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
              Descargar Plantilla Excel
            </Button>
          </div>
          
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Elige un método de importación:</h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={importMethod === 'csv' ? 'default' : 'outline'}
                  onClick={() => setImportMethod('csv')}
                >
                  Texto CSV
                </Button>
                <Button 
                  size="sm" 
                  variant={importMethod === 'excel' ? 'default' : 'outline'}
                  onClick={() => setImportMethod('excel')}
                >
                  Archivo Excel
                </Button>
              </div>
            </div>
            
            {importMethod === 'excel' ? (
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
            onClick={importMethod === 'excel' ? processExcelFile : () => processImport()}
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
