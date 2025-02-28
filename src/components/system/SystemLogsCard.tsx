
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, ScrollText, RefreshCw, Undo2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";

export function SystemLogsCard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [reverting, setReverting] = useState<string | null>(null);

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
          revertible,
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
      toast({
        title: "Error",
        description: "No se pudieron cargar los logs del sistema",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revertLog = async (logId: string) => {
    try {
      setReverting(logId);
      
      // Obtener el ID del usuario actual
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;
      
      if (!currentUserId) {
        throw new Error("No hay sesión de usuario activa");
      }
      
      console.log("Intentando revertir log:", logId, "por usuario:", currentUserId);
      
      // Usar el RPC para revertir la acción
      const { data, error } = await supabase.rpc('revert_audit_action', {
        _audit_log_id: logId,
        _admin_id: currentUserId
      });
      
      if (error) {
        console.error("Error al revertir la acción:", error);
        throw error;
      }
      
      console.log("Respuesta de revertir:", data);
      
      // Actualizar la lista de logs
      await fetchLogs();
      
      toast({
        title: "Acción revertida",
        description: "La acción ha sido revertida correctamente",
      });
    } catch (error: any) {
      console.error("Error revirtiendo log:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo revertir la acción",
        variant: "destructive"
      });
    } finally {
      setReverting(null);
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
                  <TableHead>Acciones</TableHead>
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
                          {log.revertible && (
                            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Reversible
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.revertible && !log.reverted_at && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => revertLog(log.id)}
                          disabled={!!reverting}
                        >
                          {reverting === log.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Undo2 className="h-3 w-3 mr-1" />
                              Revertir
                            </>
                          )}
                        </Button>
                      )}
                      {!log.revertible && !log.reverted_at && (
                        <div className="flex items-center text-xs text-gray-500">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          No reversible
                        </div>
                      )}
                      {log.reverted_at && (
                        <div className="flex items-center text-xs text-gray-500">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Ya revertido
                        </div>
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
