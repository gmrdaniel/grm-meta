
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, ScrollText, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function SystemLogsCard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      console.log("Fetching logs...");
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          id,
          created_at,
          action_type,
          module,
          table_name,
          record_id,
          reverted_at,
          admin:profiles!audit_logs_admin_id_fkey(full_name),
          reverter:profiles!audit_logs_reverted_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching logs:", error);
        throw error;
      }
      
      console.log("Logs fetched:", data);
      setLogs(data || []);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'payment':
        return 'bg-purple-100 text-purple-800';
      case 'status_change':
        return 'bg-yellow-100 text-yellow-800';
      case 'revert':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module.toLowerCase()) {
      case 'payment':
        return <Database className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: es });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ScrollText className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-xl">Logs del Sistema</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchLogs} 
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar logs
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Revisa los últimos logs de actividad del sistema y auditoría
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showDetails ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">
              Los logs de sistema muestran un registro detallado de las acciones realizadas en la plataforma.
            </p>
            <Button onClick={fetchLogs} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Ver logs recientes"
              )}
            </Button>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No se encontraron logs de actividad recientes.</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Administrador</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell className="capitalize">
                      <div className="flex items-center gap-1">
                        {getModuleIcon(log.module)}
                        <span>{log.module}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionTypeColor(log.action_type)}`}>
                        {log.action_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.admin?.full_name || "Sistema"}
                    </TableCell>
                    <TableCell>
                      {log.reverted_at ? (
                        <span className="flex items-center text-xs text-red-700">
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                          Revertido por {log.reverter?.full_name || "Sistema"}
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-green-700">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Activo
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {showDetails && logs.length > 0 && (
          <div className="mt-4 text-right">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDetails(false)}
            >
              Ocultar detalles
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
