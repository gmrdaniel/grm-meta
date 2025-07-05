import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Download,
  Eye,
  FileSpreadsheet,
  Calendar,
  Clock,
} from "lucide-react";
import { format, formatDistance } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BulkCreatorInvitation,
  BulkCreatorInvitationDetail,
} from "@/types/bulk-invitations";
import { Skeleton } from "@/components/ui/skeleton";

export function BulkInvitationsHistory() {
  const [selectedInvitation, setSelectedInvitation] =
    useState<BulkCreatorInvitation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["bulk-invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bulk_creator_invitations")
        .select("*")
        .order("created_at", { ascending: false });
      console.log(data);
      
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
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Import History</CardTitle>
          <CardDescription>Review your recent creator imports</CardDescription>
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
          <CardTitle className="text-xl">Import History</CardTitle>
          <CardDescription>Review your recent creator imports</CardDescription>
        </CardHeader>
        <CardContent>
          {invitations && invitations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {invitation.file_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {invitation.processed_rows}/{invitation.total_rows}{" "}
                          processed
                        </span>
                        {invitation.failed_rows > 0 && (
                          <span className="text-xs text-red-600">
                            {invitation.failed_rows} errors
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span>
                            {format(
                              new Date(invitation.created_at),
                              "dd/MM/yyyy"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistance(
                              new Date(invitation.created_at),
                              new Date(),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
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
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent imports</p>
              <p className="text-sm mt-2">
                Use the "Templates" tab to import creators
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Details</DialogTitle>
            <DialogDescription>
              {selectedInvitation && (
                <>
                  Archive:{" "}
                  <span className="font-medium">
                    {selectedInvitation.file_name}
                  </span>{" "}
                  - Imported on{" "}
                  {format(
                    new Date(selectedInvitation.created_at),
                    "dd/MM/yyyy HH:mm"
                  )}
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
                    <p className="text-sm text-gray-500">Total records</p>
                    <p className="text-2xl font-bold">
                      {selectedInvitation?.total_rows || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <p className="text-sm text-gray-500">Processed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedInvitation?.processed_rows || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <p className="text-sm text-gray-500">Errors</p>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedInvitation?.failed_rows || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {invitationDetails && invitationDetails.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitationDetails.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">
                            {detail.first_name}
                          </TableCell>
                          <TableCell>{detail.email}</TableCell>
                          <TableCell>{getStatusBadge(detail.status)}</TableCell>
                          <TableCell>
                            {detail.error_message ? (
                              <div className="flex items-start gap-1 text-red-600">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">
                                  {detail.error_message}
                                </span>
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
                  <p>No details available for this import</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
