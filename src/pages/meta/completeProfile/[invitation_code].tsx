import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { InvitationError } from "@/components/invitation/InvitationError";
import { CompleteProfileForm, ProfileFormData } from "@/components/invitation/CompleteProfileForm";
import { fetchInvitationByCode } from "@/services/invitation/fetchInvitations";

const CompleteProfilePage = () => {
  const { invitation_code } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!invitation_code) return;
      
      try {
        setLoading(true);
        console.log('CompleteProfilePage - Fetching invitation with code:', invitation_code);
        
        const invitationData = await fetchInvitationByCode(invitation_code);
        
        if (invitationData) {
          setInvitation(invitationData);
        } else {
          setError('Invitation not found');
        }
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [invitation_code]);

  const handleSubmit = async (formData: ProfileFormData) => {
    if (!invitation) return;
    
    try {
      setSaving(true);
      
      const updateData = {
        youtube_channel: formData.youtubeChannel || null,
        instagram_user: formData.instagramUser || null,
        phone_country_code: formData.phoneCountryCode || null,
        phone_number: formData.phoneNumber || null,
        phone_verified: formData.phoneVerified
      };
      
      console.log('CompleteProfilePage - Updating invitation with additional data:', updateData);
      
      const { error } = await supabase
        .from('creator_invitations')
        .update(updateData)
        .eq('id', invitation.id);
      
      if (error) {
        console.error('Error updating invitation:', error);
        toast.error('Failed to save your profile information. Please try again.');
        setSaving(false);
        return;
      }
      
      toast.success('Profile information saved successfully!');
      
      navigate(`/meta/FbCreation/${invitation_code}`);
    } catch (err) {
      console.error('Error submitting profile data:', err);
      toast.error('An unexpected error occurred. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !invitation) {
    return <InvitationError message={error || "Unable to find your invitation"} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Add additional information to complete your registration
          </CardDescription>
        </CardHeader>
        
        <CompleteProfileForm 
          onSubmit={handleSubmit}
          isSubmitting={saving}
          invitationId={invitation.id}
        />
      </Card>
    </div>
  );
};

export default CompleteProfilePage;
