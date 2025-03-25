
// We need to make sure the action to accept an invitation checks for existing tasks
// This is a modification of the existing page that accepts invitations

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { WelcomeForm } from "@/components/invitation/WelcomeForm";
import { findInvitationByCode } from "@/integrations/supabase/client";
import { InvitationError } from "@/components/invitation/InvitationError";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";
import { checkExistingTask } from "@/services/tasksService";

export default function WelcomePage() {
  const { invitation_code } = useParams<{ invitation_code: string }>();
  const navigate = useNavigate();
  
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    socialMediaHandle: "",
    termsAccepted: false
  });
  
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true);
        
        if (!invitation_code) {
          setError("No invitation code provided");
          return;
        }
        
        const { data, error } = await findInvitationByCode(invitation_code);
        
        if (error || !data || data.length === 0) {
          console.error("Error fetching invitation:", error);
          setError("Invalid invitation code or invitation not found");
          return;
        }
        
        const invitationData = data[0];
        
        // Check if invitation has already been accepted
        if (invitationData.status === "accepted") {
          setError("This invitation has already been accepted");
          return;
        }
        
        setInvitation(invitationData);
        
        // Pre-fill form data
        setFormData({
          fullName: invitationData.full_name || "",
          email: invitationData.email || "",
          socialMediaHandle: invitationData.social_media_handle || "",
          termsAccepted: false
        });
        
      } catch (err) {
        console.error("Error in fetchInvitation:", err);
        setError("Failed to fetch invitation details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvitation();
  }, [invitation_code]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, termsAccepted: checked }));
  };
  
  const handleContinue = async () => {
    try {
      if (!invitation) return;
      
      setIsSubmitting(true);
      
      // Check if a task already exists for this invitation
      const hasExistingTask = await checkExistingTask(null, invitation.id);
      
      if (hasExistingTask) {
        toast.error("This invitation has already been processed");
        return;
      }
      
      // Update the invitation status to accepted
      const { error } = await supabase
        .from('creator_invitations')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id);
      
      if (error) {
        console.error("Error accepting invitation:", error);
        toast.error("Failed to accept invitation");
        return;
      }
      
      toast.success("Invitation accepted successfully!");
      
      // Redirect to complete profile page
      navigate(`/meta/completeProfile/${invitation_code}`);
      
    } catch (err) {
      console.error("Error in handleContinue:", err);
      toast.error("An error occurred while processing your request");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="loader">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !invitation) {
    return <InvitationError message={error || "Invitation not found"} />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <WelcomeForm
          invitation={invitation}
          formData={formData}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onContinue={handleContinue}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
}
