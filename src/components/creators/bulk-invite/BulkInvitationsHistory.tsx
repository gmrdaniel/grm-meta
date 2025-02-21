
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CreatorServicesPagination } from "@/components/creator-services/CreatorServicesPagination";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BulkInvitation {
  id: string;
  file_name: string;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  status: string;
  created_at: string;
}

interface BulkInvitationDetail {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  status: string;
  error_message: string | null;
  created_at: string;
  invitation_link?: string;
}

export function BulkInvitationsHistory() {
  const [page, setPage] = useState(1);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [detailsPage, setDetailsPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const pageSize = 10;

  const { data: invitationsData, isLoading: isLoadingInvitations } = useQuery({
    queryKey: ['bulk-invitations', page],
    queryFn: async () => {
      const startRow = (page - 1) * pageSize;
      const { data: invitations, error, count } = await supabase
        .from('bulk_creator_invitations')
        .select('*', { count: 'exact' })
        .range(startRow, startRow + pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        invitations,
        total: count || 0
      };
    }
  });

  const { data: detailsData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['bulk-invitation-details', selectedInvitationId, detailsPage],
    queryFn: async () => {
      if (!selectedInvitationId) return { details: [], total: 0 };

      const startRow = (detailsPage - 1) * pageSize;
      
      // Primero obtenemos los detalles de la invitación masiva
      const { data: details, error: detailsError, count } = await supabase
        .from('bulk_creator_invitation_details')
        .select('*', { count: 'exact' })
        .eq('bulk_invitation_id', selectedInvitationId)
        .range(startRow, startRow + pageSize - 1)
        .order('created_at', { ascending: false });

      if (detailsError) throw detailsError;

      // Luego obtenemos los links de invitación correspondientes
      if (details && details.length > 0) {
        const { data: invitations, error: invitationsError } = await supabase
          .from('creator_invitations')
          .select('email, token')
          .in('email', details.map(d => d.email));

        if (invitationsError) throw invitationsError;

        // Combinamos los detalles con los links de invitación
        const detailsWithLinks = details.map(detail => {
          const invitation = invitations?.find(inv => inv.email === detail.email);
          return {
            ...detail,
            invitation_link: invitation 
              ? `${window.location.origin}/auth?invitation=${invitation.token}`
              : undefined
          };
        });

        return {
          details: detailsWithLinks,
          total: count || 0
        };
      }

      return {
        details: [],
        total: count || 0
      };
    },
    enabled: !!selectedInvitationId
  });

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success("URL copiada al portapapeles");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Error al copiar URL");
    }
  };

  const totalInvitationsPages = Math.ceil((invitationsData?.total || 0) / pageSize);
  const totalDetailsPages = Math.ceil((detailsData?.total || 0) / pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Historial de Plantillas Cargadas</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Total Registros</TableHead>
                  <TableHead>Procesados</TableHead>
                  <TableHead>Fallidos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingInvitations ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : invitationsData?.invitations?.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.file_name}</TableCell>
                    <TableCell>{invitation.total_rows}</TableCell>
                    <TableCell>{invitation.processed_rows}</TableCell>
                    <TableCell>{invitation.failed_rows}</TableCell>
                    <TableCell>{invitation.status}</TableCell>
                    <TableCell>
                      {format(new Date(invitation.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInvitationId(invitation.id);
                          setDetailsPage(1);
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalInvitationsPages > 1 && (
            <div className="mt-4">
              <CreatorServicesPagination
                page={page}
                totalPages={totalInvitationsPages}
                setPage={setPage}
              />
            </div>
          )}
        </div>
      </Card>

      {selectedInvitationId && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detalles de la Invitación</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingDetails ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Cargando detalles...
                      </TableCell>
                    </TableRow>
                  ) : detailsData?.details?.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{detail.full_name}</TableCell>
                      <TableCell>{detail.email}</TableCell>
                      <TableCell>{detail.status}</TableCell>
                      <TableCell>{detail.is_active ? "Sí" : "No"}</TableCell>
                      <TableCell>{detail.error_message || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(detail.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {detail.invitation_link && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyUrl(detail.invitation_link!, detail.id)}
                                >
                                  {copiedId === detail.id ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copiar URL de invitación</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalDetailsPages > 1 && (
              <div className="mt-4">
                <CreatorServicesPagination
                  page={detailsPage}
                  totalPages={totalDetailsPages}
                  setPage={setDetailsPage}
                />
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
