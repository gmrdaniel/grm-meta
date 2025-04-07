import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchInvitationByCode } from "@/services/invitation/fetchInvitations";

// 🧱 UI Components
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { InvitationError } from "@/components/invitation/InvitationError";

// 🛠️ Services
import { supabase } from "@/integrations/supabase/client";
import { fetchProjectStages } from "@/services/projectService";
import { updateInvitationStatus } from "@/services/invitation/updateInvitation";

// 🗃️ Types
import { CreatorInvitation } from "@/types/invitation";
import { ProjectStage } from "@/types/project";

export default function InvitationPage() {
  const { url, id } = useParams<{ url: string; id: string }>();
  const navigate = useNavigate();

  // 📦 State
  const [invitationData, setInvitationData] = useState<CreatorInvitation | null>(null);
  const [projectStages, setProjectStages] = useState<ProjectStage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Fetch invitation on component mount
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError("No invitation ID provided");
          return;
        }

        // Fetch invitation by ID
        const invitation = await fetchInvitationByCode(id as string);

        if (!invitation) {
          setError("Invalid invitation ID or invitation not found");
          return;
        }

        setInvitationData(invitation);

        // Fetch project stages
        const stages = await fetchProjectStages(invitation.project_id);
        setProjectStages(stages);
      } catch (err) {
        console.error("Error loading invitation:", err);
        setError("Failed to load invitation details");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [id]);

  // ✅ Accept invitation handler
  const handleAcceptInvitation = async () => {
    if (!invitationData) return;

    try {
      setLoading(true);
      setError(null);

      // Update invitation status to "accepted"
      await updateInvitationStatus(invitationData.id, "in process");

      toast.success("Invitation accepted successfully!");
      // Redirect user to the project URL
      window.location.href = projectStages && projectStages[0]?.url || '/';
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError("Failed to accept invitation");
      toast.error("Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  // 🖼️ Render
  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitationData) {
    return <InvitationError message={error || "Invitation not found"} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Welcome to {projectStages && projectStages[0]?.name}!
          </h1>
          <p className="text-gray-600 mb-4">
            You have been invited to join this project.
          </p>
          <div className="mb-4">
            <p className="text-gray-700">
              <strong>Name:</strong> {invitationData.full_name}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {invitationData.email}
            </p>
          </div>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-500 transition-colors"
            onClick={handleAcceptInvitation}
          >
            Accept Invitation
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
