import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExternalLink, Check, Clock, Eye, Mail } from "lucide-react";
import { toast } from "sonner";
import { fetchInvitationByCode, updateFacebookPage } from "@/services/invitationService";
import { fetchProjectStageByView, createTask } from "@/services/projectService";
import { CreatorInvitation } from "@/types/invitation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

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
        
        try {
          const stageData = await fetchProjectStageByView('meta/FbCreation');
          
          if (!stageData) {
            console.error("Could not find project stage for meta/FbCreation");
          } else if (invitation.project_id) {
            const taskData = {
              title: "Validar registro",
              project_id: invitation.project_id,
              stage_id: stageData.id,
              creator_id: "00000000-0000-0000-0000-000000000000",
              status: 'pending' as const,
              creator_invitation_id: invitation.id
            };
            
            const taskResult = await createTask(taskData);
            console.log("Task creation result:", taskResult);
          } else {
            console.warn("No project_id found in invitation, skipping task creation");
          }
        } catch (taskError) {
          console.error("Error creating validation task:", taskError);
        }
        
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

  if (submissionComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-8 pb-8 flex flex-col items-center">
            <div className="bg-blue-100 p-6 rounded-full mb-4">
              {showPasswordForm ? (
                <div className="text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
              ) : (
                <Clock className="h-12 w-12 text-blue-600" />
              )}
            </div>
            
            {showPasswordForm ? (
              <>
                <CardTitle className="text-2xl font-bold text-center mb-2">
                  Create Password
                </CardTitle>
                <p className="text-gray-600 text-center mb-6">
                  Set a secure password for your creator account
                </p>
                
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      name="password"
                      type="password"
                      value={passwordData.password}
                      onChange={handlePasswordChange}
                    />
                    <p className="text-sm text-gray-500">Must be at least 8 characters</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSetPassword}
                    disabled={submitting || passwordData.password.length < 8 || passwordData.password !== passwordData.confirmPassword}
                    className="w-full"
                  >
                    {submitting ? "Creating Account..." : "Set Password & Continue"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl font-bold text-center mb-2">
                  <Eye className="inline mr-2" /> Your Submission is Under Review!
                </CardTitle>
                <p className="text-gray-600 text-center mb-4">
                  We've received your details and are currently verifying your information (takes 1-3 business days).
                </p>
                <p className="text-gray-600 text-center mb-8">
                  <Mail className="inline mr-2 text-blue-500" /> You'll be notified via email/SMS once approved.
                </p>
                
                <Button onClick={() => setShowPasswordForm(true)}>
                  Set a Password
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
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
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitDisabled}
            className="min-w-[200px]"
          >
            {submitting ? "Submitting..." : "Submit for Validation"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FbCreationPage;
