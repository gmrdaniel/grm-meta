
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { fetchInvitationByCode, updateFacebookPage, updateInvitationStatus } from "@/services/invitationService";
import { CreatorInvitation } from "@/types/invitation";
import { supabase } from "@/integrations/supabase/client";
import { FacebookPageForm } from "@/components/facebook/FacebookPageForm";
import { SubmissionCompleteScreen } from "@/components/facebook/SubmissionCompleteScreen";
import { validateFacebookPageUrl } from "@/utils/validationUtils";

const FbCreationPage = () => {
  const { invitation_code } = useParams<{ invitation_code: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    facebookPageUrl: "",
    verifyOwnership: false,
    linkInstagram: false,
  });
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        if (!invitation_code) {
          throw new Error("No invitation code provided");
        }

        setLoading(true);
        setError(null);
        const invitationData = await fetchInvitationByCode(invitation_code);
        
        if (!invitationData) {
          toast.error("Invalid invitation code");
          navigate("/auth");
          return;
        }

        setInvitation(invitationData);
        console.log("Invitation data loaded:", invitationData);
        
        if (invitationData.facebook_page) {
          setFormData(prev => ({
            ...prev,
            facebookPageUrl: invitationData.facebook_page
          }));
        }
      } catch (error) {
        console.error("Error fetching invitation:", error);
        toast.error("Failed to load invitation details");
        setError("Failed to load invitation details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (invitation_code) {
      fetchInvitation();
    }
  }, [invitation_code, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    if (!formData.verifyOwnership) {
      toast.error("Please verify that you own this Facebook page");
      return;
    }

    const { isValid, errorMessage } = validateFacebookPageUrl(formData.facebookPageUrl);
    if (!isValid) {
      toast.error(errorMessage || "Please enter a valid Facebook page URL");
      return;
    }

    if (!invitation_code || !invitation) {
      toast.error("Invitation information not found");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      console.log("Starting Facebook page submission process");
      console.log(`Invitation code: ${invitation_code}`);
      console.log(`Invitation ID: ${invitation.id}`);

      const facebookPageUrl = formData.facebookPageUrl.trim();
      if (!facebookPageUrl) {
        toast.error("Please enter a valid Facebook page URL");
        setSubmitting(false);
        return;
      }

      console.log(`Facebook page URL to save: ${facebookPageUrl}`);

      const result = await updateFacebookPage(invitation.id, facebookPageUrl);
      
      if (!result) {
        console.error("Failed to update Facebook page URL");
        toast.error("There was an error saving your Facebook page. Please try again.");
        setError("Failed to update your Facebook page information. Please try again later.");
        setSubmitting(false);
        return;
      }
      
      console.log("Facebook page update result:", result);
      
      if (result.facebook_page === facebookPageUrl) {
        console.log("Facebook page URL successfully updated!");
        
        console.log("Updating invitation status to accepted");
        const updatedInvitation = await updateInvitationStatus(invitation.id, 'completed');
        console.log("Invitation status updated:", updatedInvitation);
        
        toast.success("Your submission has been received for validation");
        
        setSubmissionComplete(true);
      } else {
        console.error("Data mismatch after save:", {
          expected: facebookPageUrl,
          actual: result ? result.facebook_page : 'null'
        });
        toast.error("There was an issue saving your data. Please try again.");
        setError("The saved data does not match what was submitted. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit your information");
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPassword = async () => {
    if (!invitation) return;
    
    if (passwordData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: invitation.email,
        password: passwordData.password,
        options: {
          data: {
            full_name: invitation.full_name,
            phone: invitation.phone_number || null
          }
        }
      });
      
      if (userError) {
        console.error("Error creating user account:", userError);
        toast.error("Failed to create your account");
        setError(userError.message);
        setSubmitting(false);
        return;
      }
      
      console.log("User account created successfully:", userData);
      toast.success("Account created successfully! You can now log in");
      
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
      
    } catch (error) {
      console.error("Error in account creation:", error);
      toast.error("An unexpected error occurred");
      setError("Failed to create your account. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-xl">
        <CardContent className="pt-6">
          {submissionComplete ? (
            <SubmissionCompleteScreen 
              showPasswordForm={showPasswordForm}
              passwordData={passwordData}
              submitting={submitting}
              onPasswordChange={handlePasswordChange}
              onSetPassword={handleSetPassword}
              onShowPasswordForm={() => setShowPasswordForm(true)}
            />
          ) : (
            <FacebookPageForm 
              formData={formData}
              submitting={submitting}
              error={error}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
              onSubmit={handleSubmit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FbCreationPage;
