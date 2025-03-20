
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";
import { fetchInvitationByCode } from "@/services/invitationService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorCard } from "@/components/invitation/ErrorCard";
import { WelcomeForm } from "@/components/invitation/WelcomeForm";

const MetaWelcomePage = () => {
  const { id } = useParams();
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    socialMediaHandle: "",
    termsAccepted: false
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!id) return;
      
      // Add log to validate the URL parameter (now using invitation_code)
      console.log('MetaWelcomePage - URL Parameter (invitation_code):', id);
      
      try {
        setLoading(true);
        
        // Fetch invitation by code
        const invitationData = await fetchInvitationByCode(id);

        // Add log to validate the invitation data
        console.log('MetaWelcomePage - Invitation data retrieved by code:', invitationData);

        if (invitationData) {
          setInvitation(invitationData);
          setFormData({
            fullName: invitationData.full_name,
            email: invitationData.email,
            socialMediaHandle: invitationData.social_media_handle || '',
            termsAccepted: false
          });
          
          // Add log after setting state
          console.log('MetaWelcomePage - Form data initialized:', {
            fullName: invitationData.full_name,
            email: invitationData.email,
            socialMediaHandle: invitationData.social_media_handle || '',
          });
        } else {
          // Handle case when no invitation is found
          console.error('MetaWelcomePage - No invitation found with code:', id);
          setError('Invitation not found');
        }
      } catch (err: any) {
        console.error('Error fetching invitation by code:', err);
        setError('Unable to load invitation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      termsAccepted: checked
    });
  };

  const handleContinue = () => {
    if (!invitation) return;

    // Add log before navigation
    console.log('MetaWelcomePage - Continuing with invitation:', {
      id: invitation.id,
      code: invitation.invitation_code,
      email: formData.email,
      invitationType: invitation.invitation_type
    });

    // Redirect to authentication page with invitation information
    const authPath = invitation.invitation_type === 'new_user'
      ? `/auth?signup=true&email=${encodeURIComponent(formData.email)}&invitationId=${invitation.id}`
      : `/auth?email=${encodeURIComponent(formData.email)}&invitationId=${invitation.id}`;
      
    window.location.href = authPath;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !invitation) {
    // Add log when error is detected
    console.log('MetaWelcomePage - Error state:', { error, invitation });
    return <ErrorCard />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Join Meta Creator Program</CardTitle>
          <CardDescription>
            You've been invited to join Meta's exclusive content creator program
          </CardDescription>
        </CardHeader>
        
        <WelcomeForm
          invitation={invitation}
          formData={formData}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onContinue={handleContinue}
        />
      </Card>
    </div>
  );
};

export default MetaWelcomePage;
