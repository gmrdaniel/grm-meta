
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CreatorServicesPagination } from "@/components/creator-services/CreatorServicesPagination";
import { Card } from "@/components/ui/card";

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
}

export function BulkInvitationsHistory() {
  const [page, setPage] = useState(1);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [detailsPage, setDetailsPage] = useState(1);
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
      const { data: details, error, count } = await supabase
        .from('bulk_creator_invitation_details')
        .select('*', { count: 'exact' })
        .eq('bulk_invitation_id', selectedInvitationId)
        .range(startRow, startRow + pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        details,
        total: count || 0
      };
    },
    enabled: !!selectedInvitationId
  });

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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingDetails ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
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
