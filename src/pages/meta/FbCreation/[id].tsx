
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { fetchInvitationByCode } from "@/services/invitationService";
import { CreatorInvitation } from "@/types/invitation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorCard } from "@/components/invitation/ErrorCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FbCreationPage = () => {
  const { id } = useParams();
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    youtubeChannel: "",
    otherSocialMedia: "",
    phoneCode: "+1",
    phoneNumber: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('FbCreationPage - Trying to find invitation with code:', id);
        
        const invitationData = await fetchInvitationByCode(id);
        
        if (invitationData) {
          console.log('FbCreationPage - Found invitation:', invitationData);
          setInvitation(invitationData);
          
          // Pre-fill form data if any exists
          if (invitationData.social_media_handle) {
            setFormData(prev => ({
              ...prev,
              otherSocialMedia: invitationData.social_media_handle || ""
            }));
          }
        } else {
          console.error('FbCreationPage - No invitation found with code:', id);
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

  const handleBack = () => {
    window.history.back();
  };

  const handleComplete = async () => {
    if (!invitation) return;
    
    try {
      setSubmitting(true);
      
      // Update the creator_invitations record with the new data
      const { error } = await supabase
        .from('creator_invitations')
        .update({
          social_media_handle: formData.otherSocialMedia || formData.youtubeChannel,
          // Store phone in metadata or additional fields if needed
          // This is just an example, you might want to store this in a different table
        })
        .eq('id', invitation.id);
      
      if (error) {
        console.error('Error updating invitation:', error);
        toast.error('Failed to save your profile information');
        return;
      }
      
      // Show success message
      toast.success('Profile completed successfully');
      
      // Redirect to authentication page with invitation information
      const authPath = invitation.invitation_type === 'new_user'
        ? `/auth?signup=true&email=${encodeURIComponent(invitation.email)}&invitationId=${invitation.id}`
        : `/auth?email=${encodeURIComponent(invitation.email)}&invitationId=${invitation.id}`;
        
      window.location.href = authPath;
      
    } catch (err: any) {
      console.error('Error completing profile:', err);
      toast.error('An error occurred while saving your profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !invitation) {
    return <ErrorCard />;
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
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtubeChannel">YouTube Channel (Optional)</Label>
              <Input
                id="youtubeChannel"
                name="youtubeChannel"
                value={formData.youtubeChannel}
                onChange={handleInputChange}
                placeholder="@channelname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherSocialMedia">Other Social Media (Optional)</Label>
              <Input
                id="otherSocialMedia"
                name="otherSocialMedia"
                value={formData.otherSocialMedia}
                onChange={handleInputChange}
                placeholder="Instagram, Twitter, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex space-x-2">
                <Input
                  id="phoneCode"
                  name="phoneCode"
                  value={formData.phoneCode}
                  onChange={handleInputChange}
                  className="w-[80px]"
                />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={submitting}
          >
            Complete Registration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FbCreationPage;
