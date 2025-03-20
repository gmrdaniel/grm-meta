
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInvitations } from "@/services/invitationService";
import { CreatorInvitation } from "@/types/invitation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const InvitationsList = () => {
  const { data: invitations, isLoading, error, refetch } = useQuery({
    queryKey: ["invitations"],
    queryFn: fetchInvitations,
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

  if (isLoading) return <div>Loading invitations...</div>;
  if (error) return <div>Error loading invitations: {(error as Error).message}</div>;
  if (!invitations || invitations.length === 0) return <div>No invitations found.</div>;

  return (
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvitationsList;
