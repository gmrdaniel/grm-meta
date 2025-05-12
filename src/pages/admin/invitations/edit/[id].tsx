import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchInvitationById } from "@/services/invitationService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import InvitationForm from "@/components/admin/invitations/InvitationForm";

const EditInvitation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: invitation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invitation", id],
    queryFn: () => (id ? fetchInvitationById(id) : null),
    enabled: !!id,
  });

  const handleSuccess = () => {
    navigate("/invitations");
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">
              Failed to load invitation. The invitation may not exist or you
              don't have permission to edit it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/invitations")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Invitations
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Creator Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : invitation ? (
            <InvitationForm
              initialData={invitation}
              isEditMode={true}
              invitationId={id}
              onSuccess={handleSuccess}
            />
          ) : (
            <p>No invitation found with the specified ID.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditInvitation;
