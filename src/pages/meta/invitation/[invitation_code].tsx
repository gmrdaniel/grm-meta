// 🧩 Libs
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

// 🧱 UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// 📋 Form Components
import { WelcomeForm } from "@/components/invitation/WelcomeForm";
import {
  CompleteProfileForm,
  ProfileFormData,
} from "@/components/invitation/CompleteProfileForm";
import { FacebookPageForm } from "@/components/facebook/FacebookPageForm";
import { SubmissionCompleteScreen } from "@/components/facebook/SubmissionCompleteScreen";
import { InvitationError } from "@/components/invitation/InvitationError";

// 🛠️ Services
import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import {
  updateFacebookPage,
  updateInvitationStatus,
} from "@/services/invitation";
import { fetchProjectStages } from "@/services/projectService";

// 🧠 Utils
import { validateFacebookPageUrl } from "@/utils/validationUtils";

// 🗃️ Types
import { CreatorInvitation } from "@/types/invitation";
import { ProjectStage } from "@/types/project";
import { Check, DollarSign, Zap, Shield, Clock } from "lucide-react";

// 🧭 Steps
const stepList = [
  { id: "welcome", label: "Accept Invitation" },
  { id: "completeProfile", label: "Complete Your Profile" },
  { id: "fbcreation", label: "Connect Facebook Page" },
] as const;

type Step = (typeof stepList)[number];

const defaultFormData = {
  fullName: "",
  email: "",
  socialMediaHandle: "",
  termsAccepted: false,
};

const defaultFacebookData = {
  facebookPageUrl: "",
  verifyOwnership: false,
  linkInstagram: false,
};

const defaultPasswordData = {
  password: "",
  confirmPassword: "",
};

export default function InvitationStepperPage() {
  const { invitation_code } = useParams<{ invitation_code: string }>();
  const navigate = useNavigate();

  // 📦 State
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>(stepList[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [facebookFormData, setFacebookFormData] = useState(defaultFacebookData);
  const [passwordData, setPasswordData] = useState(defaultPasswordData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // 🔃 Fetch invitation and stages
  useEffect(() => {
    const fetchInvitationAndStages = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!invitation_code) {
          setError("No invitation code provided");
          return;
        }

        const { data, error } = await findInvitationByCode(invitation_code);

        if (error || !data?.length) {
          setError("Invalid invitation code or invitation not found");
          return;
        }

        const invitationData = data[0];
        
        if (invitationData.status === "completed") {
          setError("This invitation has already been accepted");
          return;
        }

        setInvitation(invitationData);
        setFormData({
          fullName: invitationData.full_name || "",
          email: invitationData.email || "",
          socialMediaHandle: invitationData.social_media_handle || "",
          termsAccepted: false,
        });

        const stagesData = await fetchProjectStages(invitationData.project_id);
        setProjectStages(stagesData);

        if (invitationData.current_stage_id) {
          const currentStage = stagesData.find(
            (s) => s.id === invitationData.current_stage_id
          );
          if (currentStage) {
            const currentStep = stepList.find(
              (step) => step.id == currentStage.slug
            );

            setCurrentStep(currentStep);
          }
        }
      } catch (err) {
        console.error("Error loading invitation:", err);
        setError("Failed to load invitation details");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationAndStages();
  }, [invitation_code]);

  // ✏️ Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacebookInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFacebookFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, termsAccepted: checked }));
  };

  const handleCheckboxFacebookChange = (name: string, checked: boolean) => {
    setFacebookFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔁 Step navigation
  const goToNextStep = async () => {
    if (!invitation || !projectStages.length) return;
    const currentIndex = projectStages.findIndex(
      (s) => s.slug === currentStep.id
    );
    const nextStage = projectStages[currentIndex + 1];
    if (!nextStage) return;

    const { error } = await supabase
      .from("creator_invitations")
      .update({
        current_stage_id: nextStage.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (error) {
      toast.error("Failed to save progress");
      return;
    }

    const nextStep = stepList.find((step) => step.id === nextStage.slug);
    setCurrentStep(nextStep);
    setInvitation(
      (prev) => prev && { ...prev, current_stage_id: nextStage.id }
    );
  };

  // ✅ Handlers
  const handleContinueWelcome = async () => {
    if (!invitation) return;
    setIsSubmitting(true);

    // Remove task check since tasks functionality has been removed

    const { error } = await supabase
      .from("creator_invitations")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", invitation.id);

    if (error) {
      toast.error("Failed to accept invitation");
    } else {
      toast.success("Invitation accepted successfully");
      goToNextStep();
    }

    setIsSubmitting(false);
  };

  const handleCompleteProfileSubmit = async (formData: ProfileFormData) => {
    if (!invitation) return;
    setSaving(true);

    const updateData = {
      youtube_channel: formData.youtubeChannel || null,
      instagram_user: formData.instagramUser || null,
      phone_country_code: formData.phoneCountryCode || null,
      phone_number: formData.phoneNumber || null,
      phone_verified: formData.phoneVerified,
    };

    const { error } = await supabase
      .from("creator_invitations")
      .update(updateData)
      .eq("id", invitation.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved successfully");
      goToNextStep();
    }

    setSaving(false);
  };

  const handleSubmit = async () => {
    if (!facebookFormData.verifyOwnership) {
      toast.error("Please verify that you own this Facebook page");
      return;
    }

    const { isValid, errorMessage } = validateFacebookPageUrl(
      facebookFormData.facebookPageUrl
    );
    if (!isValid) {
      toast.error(errorMessage || "Invalid Facebook URL");
      return;
    }

    if (!invitation_code || !invitation) {
      toast.error("Missing invitation data");
      return;
    }

    try {
      setSubmitting(true);
      const result = await updateFacebookPage(
        invitation.id,
        facebookFormData.facebookPageUrl.trim()
      );

      if (
        !result ||
        result.facebook_page !== facebookFormData.facebookPageUrl.trim()
      ) {
        toast.error("Error saving your Facebook page");
        return;
      }

      await updateInvitationStatus(invitation.id, "completed");
      toast.success("Your submission has been received");
      setSubmissionComplete(true);
    } catch (err) {
      toast.error("Error submitting your info");
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
      const { error } = await supabase.auth.signUp({
        email: invitation.email,
        password: passwordData.password,
        options: {
          data: {
            full_name: invitation.full_name,
            phone: invitation.phone_number || null,
          },
        },
      });

      if (error) throw error;

      toast.success("Account created! You can now log in.");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      toast.error("Error creating account");
    } finally {
      setSubmitting(false);
    }
  };

  // 🖼️ Render
  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return <InvitationError message={error || "Invitation not found"} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Purple Header Section */}
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 p-8 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20"></div>
              <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white/10"></div>
              <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white/15"></div>
            </div>

            <div className="relative z-10">
              {/* Official Badge */}
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 w-fit">
                <Check className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Official Announcement</span>
              </div>

              {/* Main Title */}
              <h1 className="text-3xl font-bold mb-6 leading-tight">
                Join Meta Creator Breakthrough Bonus Program
              </h1>

              {/* Subtitle */}
              <p className="text-lg mb-6 opacity-90">Get access to:</p>

              {/* Benefits Cards */}
              <div className="space-y-3">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">$5,000 in bonuses</h3>
                      <p className="text-white/80 text-sm">Earn while creating content you love</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Monetize on Facebook Instantly</h3>
                      <p className="text-white/80 text-sm">No waiting period for eligibility</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Free Meta Verified</h3>
                      <p className="text-white/80 text-sm">Get the blue checkmark & exclusive features</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Fast-track application</h3>
                      <p className="text-white/80 text-sm">Skip the line with our partner program</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-white/80 font-medium">Limited spots available. Apply now!</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Join Meta Creator Program
              </h2>
              <p className="text-purple-600 font-medium mb-4">
                We're La Neta, an official partner of Meta
              </p>
              
              {currentStep.id === "welcome" && (
                <div className="text-left space-y-3 text-sm text-gray-600">
                  <p>Welcome to the Meta Creator Breakthrough Bonus Program</p>
                  <p>
                    Earn up to <span className="font-bold text-purple-600">$5,000 in bonuses</span> just by posting Reels on Facebook
                  </p>
                  <p>Start monetizing right away + get a free trial of Meta Verified</p>
                  <p>Limited spots available for high-potential creators like you</p>
                  <p className="font-medium">Fill out the form below to get started.</p>
                </div>
              )}
            </div>
            
            <Stepper steps={stepList} currentStep={currentStep.id} className="mb-8" />
            
            {currentStep.id === "welcome" && (
              <WelcomeForm
                invitation={invitation}
                formData={formData}
                onInputChange={handleInputChange}
                onCheckboxChange={handleCheckboxChange}
                onContinue={handleContinueWelcome}
                isSubmitting={isSubmitting}
              />
            )}

            {currentStep.id === "completeProfile" && (
              <CompleteProfileForm
                onSubmit={handleCompleteProfileSubmit}
                isSubmitting={saving}
                invitationId={invitation.id}
              />
            )}

            {currentStep.id === "fbcreation" &&
              (submissionComplete ? (
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
                  formData={facebookFormData}
                  submitting={submitting}
                  error={error}
                  onInputChange={handleFacebookInputChange}
                  onCheckboxChange={handleCheckboxFacebookChange}
                  onSubmit={handleSubmit}
                />
              ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 min-h-[600px]">
          {/* Left Side - Purple Section */}
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 p-12 text-white relative overflow-hidden flex flex-col justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20"></div>
              <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white/10"></div>
              <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white/15"></div>
            </div>

            <div className="relative z-10">
              {/* Official Badge */}
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8 w-fit">
                <Check className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Official Announcement</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl font-bold mb-8 leading-tight">
                Join Meta Creator Breakthrough Bonus Program
              </h1>

              {/* Subtitle */}
              <p className="text-xl mb-8 opacity-90">Get access to:</p>

              {/* Benefits Cards */}
              <div className="space-y-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">$5,000 in bonuses</h3>
                      <p className="text-white/80 text-sm">Earn while creating content you love</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Monetize on Facebook Instantly</h3>
                      <p className="text-white/80 text-sm">No waiting period for eligibility</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Free Meta Verified</h3>
                      <p className="text-white/80 text-sm">Get the blue checkmark & exclusive features</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Fast-track application</h3>
                      <p className="text-white/80 text-sm">Skip the line with our partner program</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-white/80 font-medium">Limited spots available. Apply now!</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="bg-white p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Join Meta Creator Program
                </h2>
                <p className="text-purple-600 font-medium mb-4">
                  We're La Neta, an official partner of Meta
                </p>
                
                {currentStep.id === "welcome" && (
                  <div className="text-left space-y-3 text-sm text-gray-600">
                    <p>Welcome to the Meta Creator Breakthrough Bonus Program</p>
                    <p>
                      Earn up to <span className="font-bold text-purple-600">$5,000 in bonuses</span> just by posting Reels on Facebook
                    </p>
                    <p>Start monetizing right away + get a free trial of Meta Verified</p>
                    <p>Limited spots available for high-potential creators like you</p>
                    <p className="font-medium">Fill out the form below to get started.</p>
                  </div>
                )}
              </div>
              
              <Stepper steps={stepList} currentStep={currentStep.id} className="mb-8" />
              
              {currentStep.id === "welcome" && (
                <WelcomeForm
                  invitation={invitation}
                  formData={formData}
                  onInputChange={handleInputChange}
                  onCheckboxChange={handleCheckboxChange}
                  onContinue={handleContinueWelcome}
                  isSubmitting={isSubmitting}
                />
              )}

              {currentStep.id === "completeProfile" && (
                <CompleteProfileForm
                  onSubmit={handleCompleteProfileSubmit}
                  isSubmitting={saving}
                  invitationId={invitation.id}
                />
              )}

              {currentStep.id === "fbcreation" &&
                (submissionComplete ? (
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
                    formData={facebookFormData}
                    submitting={submitting}
                    error={error}
                    onInputChange={handleFacebookInputChange}
                    onCheckboxChange={handleCheckboxFacebookChange}
                    onSubmit={handleSubmit}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
