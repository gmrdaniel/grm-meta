
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInvitations, updateInvitationStatus, deleteInvitation } from "@/services/invitationService";
import { Check, Copy, MailCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { CreatorInvitation } from "@/types/invitation";

const InvitationsList = () => {
  const [selectedInvitation, setSelectedInvitation] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ["invitations"],
    queryFn: fetchInvitations
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CreatorInvitation['status'] }) => 
      updateInvitationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation status updated");
    },
    onError: (error: Error) => {
      toast.error(`Error updating invitation: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error deleting invitation: ${error.message}`);
    }
  });

  const handleStatusChange = (id: string, newStatus: CreatorInvitation['status']) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    setSelectedInvitation(id);
  };

  const confirmDelete = () => {
    if (selectedInvitation) {
      deleteMutation.mutate(selectedInvitation);
      setSelectedInvitation(null);
    }
  };

  const copyInvitationLink = (invitation: CreatorInvitation) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${invitation.invitation_url}`;
    
    navigator.clipboard.writeText(fullUrl)
      .then(() => toast.success("Invitation link copied to clipboard"))
      .catch(() => toast.error("Failed to copy invitation link"));
  };

  const copyInvitationCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => toast.success("Invitation code copied to clipboard"))
      .catch(() => toast.error("Failed to copy invitation code"));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading invitations...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading invitations</div>;
  }

  if (!invitations || invitations.length === 0) {
    return <div className="text-center p-4">No invitations found</div>;
  }

  return (
    <div>
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
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell className="font-medium">{invitation.full_name}</TableCell>
              <TableCell>{invitation.email}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">{invitation.invitation_code || 'N/A'}</span>
                  {invitation.invitation_code && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyInvitationCode(invitation.invitation_code)}
                      title="Copy invitation code"
                    >
                      <Copy size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {invitation.invitation_type === "new_user" ? "New User" : "Existing User"}
              </TableCell>
              <TableCell>{getStatusBadge(invitation.status)}</TableCell>
              <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyInvitationLink(invitation)}
                    title="Copy invitation link"
                  >
                    <Copy size={16} />
                  </Button>
                  
                  {invitation.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(invitation.id, "accepted")}
                        className="text-green-600"
                        title="Mark as accepted"
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(invitation.id, "rejected")}
                        className="text-red-600"
                        title="Mark as rejected"
                      >
                        <X size={16} />
                      </Button>
                    </>
                  )}
                  
                  <AlertDialog open={selectedInvitation === invitation.id} onOpenChange={(open) => !open && setSelectedInvitation(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(invitation.id)}
                        className="text-red-600"
                        title="Delete invitation"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this invitation? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvitationsList;
