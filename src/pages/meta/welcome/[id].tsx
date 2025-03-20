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
      
      // Add log to validate the URL parameter
      console.log('MetaWelcomePage - URL Parameter (invitation_code):', id);
      
      try {
        setLoading(true);
        
        // Try multiple methods to find the invitation
        
        // Method 1: Check with direct query first
        console.log('MetaWelcomePage - Trying to find invitation using direct query');
        const { data: directData, error: directError } = await supabase
          .from('creator_invitations')
          .select('*')
          .eq('invitation_code', id)
          .limit(1);

        console.log('MetaWelcomePage - Direct query result:', { data: directData, error: directError });
        
        // Method 2: Try with the service function that uses multiple approaches
        console.log('MetaWelcomePage - Trying to find invitation using service function');
        const invitationData = await fetchInvitationByCode(id);
        console.log('MetaWelcomePage - Service function result:', invitationData);
        
        // Method 3: Try raw SQL query if needed
        if (!invitationData && !directData?.length) {
          console.log('MetaWelcomePage - Trying raw SQL query as last resort');
          const { data: rawData, error: rawError } = await supabase.rpc('find_invitation_by_code', { 
            code_param: id 
          });
          
          console.log('MetaWelcomePage - Raw SQL query result:', { data: rawData, error: rawError });
          
          if (rawData && rawData.length > 0) {
            console.log('MetaWelcomePage - Found invitation with raw SQL');
            setInvitation(rawData[0]);
            setFormData({
              fullName: rawData[0].full_name,
              email: rawData[0].email,
              socialMediaHandle: rawData[0].social_media_handle || '',
              termsAccepted: false
            });
            setLoading(false);
            return;
          }
        }

        // Use the results from service function or direct query
        const foundInvitation = invitationData || (directData?.length ? directData[0] : null);
        
        if (foundInvitation) {
          setInvitation(foundInvitation);
          setFormData({
            fullName: foundInvitation.full_name,
            email: foundInvitation.email,
            socialMediaHandle: foundInvitation.social_media_handle || '',
            termsAccepted: false
          });
          
          // Add log after setting state
          console.log('MetaWelcomePage - Form data initialized:', {
            fullName: foundInvitation.full_name,
            email: foundInvitation.email,
            socialMediaHandle: foundInvitation.social_media_handle || '',
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
