
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

const CompleteProfilePage = () => {
  const { invitation_code } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    youtubeChannel: "",
    otherSocialMedia: "",
    phoneCountryCode: "+1",
    phoneNumber: ""
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!invitation_code) return;
      
      try {
        setLoading(true);
        console.log('CompleteProfilePage - Fetching invitation with code:', invitation_code);
        
        // Try with RPC function first
        const { data, error } = await supabase.rpc('find_invitation_by_code', { 
          code_param: invitation_code 
        });
        
        console.log('CompleteProfilePage - RPC function result:', { data, error });
        
        if (error) {
          console.error('Error finding invitation:', error);
          setError('Unable to find your invitation. Please check the link and try again.');
          setLoading(false);
          return;
        }
        
        if (data && data.length > 0) {
          const foundInvitation = data[0] as unknown as CreatorInvitation;
          setInvitation(foundInvitation);
          setLoading(false);
          return;
        }
        
        // Try direct query if RPC fails
        const { data: directData, error: directError } = await supabase
          .from('creator_invitations')
          .select('*')
          .eq('invitation_code', invitation_code)
          .maybeSingle();
          
        console.log('CompleteProfilePage - Direct query result:', { data: directData, error: directError });
        
        if (directError) {
          console.error('Error in direct query:', directError);
          setError('Unable to find your invitation. Please check the link and try again.');
          setLoading(false);
          return;
        }
        
        if (directData) {
          setInvitation(directData as CreatorInvitation);
          setLoading(false);
          return;
        }
        
        // No invitation found
        setError('Invitation not found');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('An unexpected error occurred. Please try again later.');
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitation_code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    if (!invitation) return;
    
    try {
      setSaving(true);
      
      // Prepare the additional data to update
      const additionalData = {
        youtube_channel: formData.youtubeChannel || null,
        other_social_media: formData.otherSocialMedia || null,
        phone_country_code: formData.phoneCountryCode,
        phone_number: formData.phoneNumber
      };
      
      console.log('CompleteProfilePage - Updating invitation with additional data:', additionalData);
      
      // Update the invitation with additional data
      const { error } = await supabase
        .from('creator_invitations')
        .update(additionalData)
        .eq('id', invitation.id);
      
      if (error) {
        console.error('Error updating invitation:', error);
        toast.error('Failed to save your profile information. Please try again.');
        setSaving(false);
        return;
      }
      
      toast.success('Profile information saved successfully!');
      
      // Redirect to authentication page with invitation information
      const authPath = invitation.invitation_type === 'new_user'
        ? `/auth?signup=true&email=${encodeURIComponent(invitation.email)}&invitationId=${invitation.id}`
        : `/auth?email=${encodeURIComponent(invitation.email)}&invitationId=${invitation.id}`;
        
      navigate(authPath);
    } catch (err) {
      console.error('Error submitting profile data:', err);
      toast.error('An unexpected error occurred. Please try again.');
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (!invitation_code) return;
    navigate(`/meta/welcome/${invitation_code}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Error</CardTitle>
            <CardDescription>
              {error || "Unable to find your invitation"}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
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
              <div className="flex gap-2">
                <Input
                  id="phoneCountryCode"
                  name="phoneCountryCode"
                  value={formData.phoneCountryCode}
                  onChange={handleInputChange}
                  className="w-20"
                />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="flex-1"
                  type="tel"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !formData.phoneNumber}
          >
            {saving ? "Saving..." : "Complete Registration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CompleteProfilePage;
