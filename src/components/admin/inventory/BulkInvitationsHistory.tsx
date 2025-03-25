
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { AlertCircle, Download, Eye, FileSpreadsheet, Calendar, Clock } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BulkCreatorInvitation, BulkCreatorInvitationDetail } from "@/types/bulk-invitations";
import { Skeleton } from "@/components/ui/skeleton";

export function BulkInvitationsHistory() {
  const [selectedInvitation, setSelectedInvitation] = useState<BulkCreatorInvitation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["bulk-invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bulk_creator_invitations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as BulkCreatorInvitation[];
    },
  });

  const { data: invitationDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["bulk-invitation-details", selectedInvitation?.id],
    queryFn: async () => {
      if (!selectedInvitation) return null;
      
      const { data, error } = await supabase
        .from("bulk_creator_invitation_details")
        .select("*")
        .eq("bulk_invitation_id", selectedInvitation.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as BulkCreatorInvitationDetail[];
    },
    enabled: !!selectedInvitation,
  });

  const handleViewDetails = (invitation: BulkCreatorInvitation) => {
    setSelectedInvitation(invitation);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completado</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Procesando</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Fallido</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Historial de Importaciones</CardTitle>
          <CardDescription>
            Revisa tus importaciones recientes de creadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Historial de Importaciones</CardTitle>
          <CardDescription>
            Revisa tus importaciones recientes de creadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations && invitations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registros</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{invitation.file_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{invitation.processed_rows}/{invitation.total_rows} procesados</span>
                        {invitation.failed_rows > 0 && (
                          <span className="text-xs text-red-600">
                            {invitation.failed_rows} errores
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span>{format(new Date(invitation.created_at), 'dd/MM/yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistance(new Date(invitation.created_at), new Date(), { 
                            addSuffix: true,
                            locale: es 
                          })}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(invitation)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay importaciones recientes</p>
              <p className="text-sm mt-2">
                Utiliza la pestaña "Plantillas" para importar creadores
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Importación</DialogTitle>
            <DialogDescription>
              {selectedInvitation && (
                <>
                  Archivo: <span className="font-medium">{selectedInvitation.file_name}</span> - 
                  Importado el {format(new Date(selectedInvitation.created_at), 'dd/MM/yyyy HH:mm')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <p className="text-sm text-gray-500">Total de registros</p>
                    <p className="text-2xl font-bold">{selectedInvitation?.total_rows || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <p className="text-sm text-gray-500">Procesados</p>
                    <p className="text-2xl font-bold text-green-600">{selectedInvitation?.processed_rows || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <p className="text-sm text-gray-500">Errores</p>
                    <p className="text-2xl font-bold text-red-600">{selectedInvitation?.failed_rows || 0}</p>
                  </CardContent>
                </Card>
              </div>

              {invitationDetails && invitationDetails.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitationDetails.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">{detail.full_name}</TableCell>
                          <TableCell>{detail.email}</TableCell>
                          <TableCell>
                            {getStatusBadge(detail.status)}
                          </TableCell>
                          <TableCell>
                            {detail.error_message ? (
                              <div className="flex items-start gap-1 text-red-600">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{detail.error_message}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay detalles disponibles para esta importación</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
