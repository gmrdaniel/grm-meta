
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ImportError } from "../types";

interface ImportResultCardProps {
  importErrors: ImportError[];
  importSuccess: number;
}

export function ImportResultCard({ importErrors, importSuccess }: ImportResultCardProps) {
  if (importErrors.length === 0 && importSuccess === 0) {
    return null;
  }

  return (
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
  );
}
