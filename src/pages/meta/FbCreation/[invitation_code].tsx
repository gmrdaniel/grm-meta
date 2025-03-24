
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { fetchInvitationByCode } from "@/services/invitationService";
import { CreatorInvitation } from "@/types/invitation";
import { supabase } from "@/integrations/supabase/client";

const FbCreationPage = () => {
  const { invitation_code } = useParams<{ invitation_code: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    facebookPageUrl: "",
    verifyOwnership: false,
    linkInstagram: false,
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        if (!invitation_code) {
          throw new Error("No invitation code provided");
        }

        setLoading(true);
        const invitationData = await fetchInvitationByCode(invitation_code);
        
        if (!invitationData) {
          toast.error("Invalid invitation code");
          navigate("/auth");
          return;
        }

        setInvitation(invitationData);
      } catch (error) {
        console.error("Error fetching invitation:", error);
        toast.error("Failed to load invitation details");
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

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    if (!formData.verifyOwnership) {
      toast.error("Please verify that you own this Facebook page");
      return;
    }

    if (!invitation) {
      toast.error("Invitation details not found");
      return;
    }

    try {
      setSubmitting(true);
      console.log(`Submitting for invitation code: ${invitation_code}`);

      // Update the facebook_page field in the creator_invitations table
      // using the invitation_code from URL params to find the correct record
      const { error } = await supabase
        .from('creator_invitations')
        .update({ facebook_page: formData.facebookPageUrl })
        .eq('invitation_code', invitation_code);

      if (error) {
        console.error("Error updating invitation with Facebook page:", error);
        throw error;
      }

      console.log("Facebook page URL saved successfully");
      toast.success("Your submission has been received for validation");
      
      // Navigate to dashboard after successful submission
      navigate("/creator/dashboard");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit your information");
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

  // Check if the Facebook Page URL is empty to disable the button
  const isSubmitDisabled = submitting || !formData.facebookPageUrl.trim() || !formData.verifyOwnership;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-xl">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Facebook Page Creation & Instagram Linking</h1>
              <div className="flex items-center text-red-500 mt-2">
                <span className="mr-2">📌</span>
                <p className="text-orange-500 font-medium">Important: Set Up Your Facebook Page!</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">1. Create Your Facebook Page:</h2>
                <a 
                  href="https://www.facebook.com/business/help/104002523024878" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center text-blue-500 hover:underline"
                >
                  <span className="mr-2 inline-flex items-center">
                    <span className="mr-1">▶️</span>
                    Watch How
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                
                <div className="space-y-2">
                  <Label htmlFor="facebookPageUrl">Facebook Page URL</Label>
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-2 rounded-l-md border-y border-l border-gray-300">
                      <span className="text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                      </span>
                    </div>
                    <Input
                      id="facebookPageUrl"
                      name="facebookPageUrl"
                      value={formData.facebookPageUrl}
                      onChange={handleInputChange}
                      className="rounded-l-none"
                      placeholder="https://www.facebook.com/yourpage"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verifyOwnership"
                    checked={formData.verifyOwnership}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange("verifyOwnership", checked as boolean)
                    }
                  />
                  <Label htmlFor="verifyOwnership" className="text-sm">
                    I verify that I own this Facebook page
                  </Label>
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">2. Link Instagram to Facebook:</h2>
                <a 
                  href="https://www.facebook.com/help/1148909221857370" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:underline"
                >
                  <span>Instructions here</span>
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="linkInstagram"
                    checked={formData.linkInstagram}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange("linkInstagram", checked as boolean)
                    }
                  />
                  <Label htmlFor="linkInstagram" className="text-sm">
                    I've linked my Instagram to Facebook
                  </Label>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex items-center">
                <div className="rounded-full bg-green-100 p-1 mr-2">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-blue-700">Submit for validation (1-3 business days).</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end pt-0">
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {submitting ? "Submitting..." : "Submit for Validation"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FbCreationPage;
