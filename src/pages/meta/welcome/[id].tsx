
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";
import { fetchInvitationByCode, updateInvitationStatus } from "@/services/invitationService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorCard } from "@/components/invitation/ErrorCard";
import { WelcomeForm } from "@/components/invitation/WelcomeForm";
import { toast } from "sonner";

const MetaWelcomePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    socialMediaHandle: "",
    termsAccepted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        // Method 3: Try using our custom RPC function
        if (!invitationData && !directData?.length) {
          console.log('MetaWelcomePage - Trying custom RPC function');
          const { data: rpcData, error: rpcError } = await findInvitationByCode(id);
          
          console.log('MetaWelcomePage - Custom RPC function result:', { data: rpcData, error: rpcError });
          
          if (rpcData && rpcData.length > 0) {
            console.log('MetaWelcomePage - Found invitation with custom RPC function');
            const foundInvitation = rpcData[0] as unknown as CreatorInvitation;
            setInvitation(foundInvitation);
            setFormData({
              fullName: foundInvitation.full_name || '',
              email: foundInvitation.email || '',
              socialMediaHandle: foundInvitation.social_media_handle || '',
              termsAccepted: false
            });
            setLoading(false);
            return;
          }
        }

        // Use the results from service function or direct query
        const foundInvitation = invitationData || (directData?.length ? directData[0] as CreatorInvitation : null);
        
        if (foundInvitation) {
          setInvitation(foundInvitation);
          setFormData({
            fullName: foundInvitation.full_name || '',
            email: foundInvitation.email || '',
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

  const handleContinue = async () => {
    if (!invitation) return;

    // Add log before navigation
    console.log('MetaWelcomePage - Continuing with invitation:', {
      id: invitation.id,
      code: invitation.invitation_code,
      email: formData.email,
      invitationType: invitation.invitation_type
    });

    try {
      setIsSubmitting(true);
      
      // Update the invitation status to accepted
      console.log('MetaWelcomePage - Updating invitation status to accepted');
      const updatedInvitation = await updateInvitationStatus(invitation.id, "accepted");
      
      if (!updatedInvitation) {
        toast.error("Failed to update invitation status");
        return;
      }
      
      console.log('MetaWelcomePage - Invitation status updated successfully', updatedInvitation);
      
      // Navigate to the complete profile page
      navigate(`/meta/completeProfile/${invitation.invitation_code}`);
    } catch (error) {
      console.error('MetaWelcomePage - Error updating invitation status:', error);
      toast.error("Failed to update invitation status");
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Title and description moved to WelcomeForm component */}
        </CardHeader>
        
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
};

export default MetaWelcomePage;
