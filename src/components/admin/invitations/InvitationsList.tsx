
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvitationsWithPagination,
  fetchAllInvitations,
  updateInvitationStatus,
  deleteInvitation,
  sendCreatorInvitationEmail,
  exportInvitationsToExcel,
} from "@/services/invitationService";
import {
  Check,
  Copy,
  MailCheck,
  MoreVertical,
  RefreshCw,
  Trash2,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreatorInvitation } from "@/types/invitation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InvitationsPagination from "./InvitationsPagination";

const InvitationsList = () => {
  const [selectedInvitation, setSelectedInvitation] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invitations", { page: currentPage, pageSize }],
    queryFn: () => fetchInvitationsWithPagination(currentPage, pageSize),
  });

  const invitations = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "pending" | "accepted" | "rejected" | 'completed';
    }) => updateInvitationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation status updated");
    },
    onError: (error: Error) => {
      toast.error(`Error updating invitation: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error deleting invitation: ${error.message}`);
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({
      email,
      name,
      invitationUrl,
    }: {
      email: string;
      name?: string;
      invitationUrl: string;
    }) => sendCreatorInvitationEmail({ email, name, invitationUrl }),
    onSuccess: () => {
      toast.success("Invitation email sent successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error sending email: ${error.message}`);
    },
  });

  const handleExportInvitations = async () => {
    try {
      setIsExporting(true);
      // Fetch all invitations for export
      const allInvitations = await fetchAllInvitations();
      // Export to Excel
      exportInvitationsToExcel(allInvitations);
    } catch (error) {
      console.error("Error exporting invitations:", error);
      toast.error("Failed to export invitations");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleStatusChange = (
    id: string,
    newStatus: "pending" | "accepted" | "rejected" | 'completed'
  ) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const confirmDelete = () => {
    if (selectedInvitation) {
      deleteMutation.mutate(selectedInvitation);
      setSelectedInvitation(null);
    }
  };

  const createInvitationLink = (invitation: CreatorInvitation) => { 
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${invitation.invitation_url}`;

    return fullUrl
  }
  
  const copyInvitationLink = (invitation: CreatorInvitation) => {
    navigator.clipboard
      .writeText(createInvitationLink(invitation))
      .then(() => toast.success("Invitation link copied to clipboard"))
      .catch(() => toast.error("Failed to copy invitation link"));
  };

  const copyInvitationCode = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success("Invitation code copied to clipboard"))
      .catch(() => toast.error("Failed to copy invitation code"));
  };

  const resetInvitationStatus = (id: string) => {
    handleStatusChange(id, "pending");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading invitations...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading invitations</div>;
  }

  if (!invitations || invitations.length === 0) {
    return <div className="text-center p-4">No invitations found</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={handleExportInvitations} 
          disabled={isExporting}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download size={16} />
          {isExporting ? "Exporting..." : "Export All Invitations"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Invitation Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation: CreatorInvitation) => (
            <TableRow key={invitation.id}>
              <TableCell className="font-medium">
                {invitation.full_name}
              </TableCell>
              <TableCell>{invitation.email}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">
                    {invitation.invitation_code || "N/A"}
                  </span>
                  {invitation.invitation_code && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyInvitationCode(invitation.invitation_code)
                      }
                      title="Copy invitation code"
                    >
                      <Copy size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {invitation.invitation_type === "new_user"
                  ? "New User"
                  : "Existing User"}
              </TableCell>
              <TableCell>{getStatusBadge(invitation.status)}</TableCell>
              <TableCell>
                {new Date(invitation.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    className="z-50 bg-white border shadow-md rounded-md w-auto max-w-xs p-2"
                  >
                    <DropdownMenuItem asChild>
                      <button
                        onClick={() => copyInvitationLink(invitation)}
                        className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy invitation link
                      </button>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <button
                        onClick={() =>
                          sendEmailMutation.mutate({
                            email: invitation.email,
                            name: invitation.full_name,
                            invitationUrl: createInvitationLink(invitation),
                          })
                        }
                        className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm text-indigo-600"
                      >
                        <MailCheck className="mr-2 h-4 w-4" />
                        Send invitation email
                      </button>
                    </DropdownMenuItem>

                    {invitation.status === "pending" && (
                      <>
                        <DropdownMenuItem asChild>
                          <button
                            onClick={() =>
                              handleStatusChange(invitation.id, "accepted")
                            }
                            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm text-green-600"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Mark as accepted
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <button
                            onClick={() =>
                              handleStatusChange(invitation.id, "rejected")
                            }
                            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm text-red-600"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Mark as rejected
                          </button>
                        </DropdownMenuItem>
                      </>
                    )}

                    {invitation.status !== "pending" && (
                      <DropdownMenuItem asChild>
                        <button
                          onClick={() => resetInvitationStatus(invitation.id)}
                          className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm text-blue-600"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset to pending
                        </button>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <AlertDialog
                      open={selectedInvitation === invitation.id}
                      onOpenChange={(open) =>
                        !open && setSelectedInvitation(null)
                      }
                    >
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                          <button
                            onClick={() => setSelectedInvitation(invitation.id)}
                            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete invitation
                          </button>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this invitation?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalCount > 0 && (
        <InvitationsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default InvitationsList;
