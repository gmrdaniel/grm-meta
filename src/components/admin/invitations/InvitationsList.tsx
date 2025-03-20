
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInvitations, deleteInvitation } from "@/services/invitationService";
import { CreatorInvitation } from "@/types/invitation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

const InvitationsList = () => {
  const queryClient = useQueryClient();
  const [invitationToDelete, setInvitationToDelete] = useState<CreatorInvitation | null>(null);

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ["invitations"],
    queryFn: fetchInvitations,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation deleted successfully");
      setInvitationToDelete(null);
    },
    onError: (error) => {
      toast.error(`Error deleting invitation: ${error instanceof Error ? error.message : String(error)}`);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const copyInvitationUrl = (invitation: CreatorInvitation) => {
    const fullUrl = `${window.location.origin}${invitation.invitation_url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Invitation URL copied to clipboard");
  };

  const openInvitationUrl = (invitation: CreatorInvitation) => {
    const fullUrl = `${window.location.origin}${invitation.invitation_url}`;
    window.open(fullUrl, "_blank");
  };

  const handleDelete = (invitation: CreatorInvitation) => {
    setInvitationToDelete(invitation);
  };

  const confirmDelete = () => {
    if (invitationToDelete) {
      deleteMutation.mutate(invitationToDelete.id);
    }
  };

  if (isLoading) return <div>Loading invitations...</div>;
  if (error) return <div>Error loading invitations: {(error as Error).message}</div>;
  if (!invitations || invitations.length === 0) return <div>No invitations found.</div>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Social Media</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => (
              <tr key={invitation.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{invitation.full_name}</td>
                <td className="px-4 py-3">{invitation.email}</td>
                <td className="px-4 py-3">
                  {invitation.social_media_handle && invitation.social_media_type ? (
                    <>
                      <span className="capitalize">{invitation.social_media_type}</span>:{" "}
                      {invitation.social_media_handle}
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-4 py-3 capitalize">{invitation.invitation_type.replace("_", " ")}</td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(invitation.status)}>
                    {invitation.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {new Date(invitation.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInvitationUrl(invitation)}
                    title="Copy invitation URL"
                  >
                    <Copy size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInvitationUrl(invitation)}
                    title="Open invitation URL"
                  >
                    <ExternalLink size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(invitation)}
                    className="text-red-500 hover:bg-red-50"
                    title="Delete invitation"
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!invitationToDelete} onOpenChange={(open) => !open && setInvitationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the invitation for {invitationToDelete?.full_name}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InvitationsList;
