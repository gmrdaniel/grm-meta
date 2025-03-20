
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";
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

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('creator_invitations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setInvitation(data as CreatorInvitation);
          setFormData({
            fullName: data.full_name,
            email: data.email,
            socialMediaHandle: data.social_media_handle || '',
            termsAccepted: false
          });
        }
      } catch (err: any) {
        console.error('Error fetching invitation:', err);
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
    if (!formData.termsAccepted) {
      toast.error("You must accept the terms and conditions to continue");
      return;
    }

    if (!invitation) {
      toast.error("No invitation found");
      return;
    }

    // Redirect to authentication page with invitation information
    if (invitation.invitation_type === 'new_user') {
      navigate(`/auth?signup=true&email=${encodeURIComponent(formData.email)}&invitationId=${id}`);
    } else {
      navigate(`/auth?email=${encodeURIComponent(formData.email)}&invitationId=${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full"></div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-center">Invitation Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              The invitation you're looking for is either invalid or has expired.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>Go to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    );
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
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName"
                value={formData.fullName} 
                onChange={handleInputChange}
                placeholder="Your full name" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                value={formData.email} 
                onChange={handleInputChange}
                placeholder="your@email.com" 
              />
            </div>

            {invitation.social_media_type && (
              <div className="space-y-2">
                <Label htmlFor="socialMediaHandle">
                  {invitation.social_media_type === 'tiktok' ? 'TikTok Username' : 'Pinterest Username'}
                </Label>
                <Input 
                  id="socialMediaHandle"
                  name="socialMediaHandle" 
                  value={formData.socialMediaHandle} 
                  onChange={handleInputChange}
                  placeholder={invitation.social_media_type === 'tiktok' ? '@username' : 'username'} 
                />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox 
                id="termsAccepted" 
                checked={formData.termsAccepted}
                onCheckedChange={handleCheckboxChange}
              />
              <label 
                htmlFor="termsAccepted" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the <a href="#" className="text-blue-600 hover:underline">terms and conditions</a>
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={handleContinue}>Continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MetaWelcomePage;
