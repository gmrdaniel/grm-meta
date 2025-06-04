// 🧩 Libs
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Footer from "../../../components/Footer";

// 🧱 UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { InvitationError } from "@/components/invitation/InvitationError";
import { TikTokForm } from "@/components/invitation/TikTokForm";
import { YouTubeForm } from "@/components/invitation/YouTubeForm";

// 🛠️ Services
import { supabase } from "@/integrations/supabase/client";
import { updateFacebookPage } from "@/services/invitation";
import { checkExistingTask } from "@/services/tasksService";

// 🧠 Utils
import { validateFacebookPageUrl } from "@/utils/validateFacebookPageUrl";

// 🗃️ Types
import { CreatorInvitation } from "@/types/invitation";
import { ProjectStage } from "@/types/project";
import { Check, Clock, DollarSign, Shield, Zap } from "lucide-react";
import { fetchFacebookPageDetails } from "@/services/facebook/fetchFacebookPageDetails";
import { fetchInstagramUser } from "@/services/instagram/fetchInstagramUser";
import { isValidInstagramUsernameFormat } from "@/utils/isValidInstagramUsernameFormat";
import { ProfileFormData } from "@/types/forms-type";
import { useInvitationLoader } from "@/hooks/use-invitationLoader";
import BonusCard from "@/components/ui/bonus-card";

// 🧭 Steps
const stepList = [
  { id: "welcome", label: "Accept Invitation" },
  { id: "completeProfile", label: "Complete Your Profile" },
  { id: "fbcreation", label: "Connect Facebook Page" },
] as const;

type Step = (typeof stepList)[number];

const defaultFormData = {
  firstName: "",
  lastName: "",
  email: "",
  socialMediaHandle: "",
  termsAccepted: false,
  instagramUser: "",
};

const defaultFacebookData = {
  facebookProfileUrl: "",
  facebookPageUrl: "",
  verifyPageOwnership: false,
  verifyProfileOwnership: false,
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
  const [formData, setFormData] = useState(defaultFormData);
  const [facebookFormData, setFacebookFormData] = useState(defaultFacebookData);
  const [passwordData, setPasswordData] = useState(defaultPasswordData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // 🔃 Fetch invitation and stages
  const { loading, error } = useInvitationLoader({
    invitation_code,
    setFormData,
    setInvitation,
    setProjectStages,
    setCurrentStep,
    stepList, // <-- ahora tú le pasas la lista adecuada
  });

  interface YouTubeProfileFormData {
    youtubeChannel: string;
    instagramUser: string;
    isIGProfessional: boolean;
    phoneCountryCode: string;
    phoneNumber: string;
    phoneVerified: boolean;
    socialMediaHandle: string; // Para el "TikTok Channel" que se guarda aquí
  }

  const handleCompleteProfileYtbSubmit = async (
    formData: YouTubeProfileFormData
  ) => {
    if (!invitation) return;
    setSaving(true);

    const updateData = {
      youtube_channel: formData.youtubeChannel ?? null,
      instagram_user: formData.instagramUser,
      is_professional_account: formData.isIGProfessional,
      phone_country_code: formData.phoneCountryCode ?? null,
      phone_number: formData.phoneNumber ?? null,
      phone_verified: formData.phoneVerified ?? false,
      social_media_handle: formData.socialMediaHandle ?? null, // Para TikTok
    };
    console.log("updateData being sent to Supabase:", updateData);

    const { error } = await supabase
      .from("creator_invitations")
      .update(updateData)
      .eq("id", invitation.id);

    if (error) {
      toast.error("Failed to save YouTube profile");
    } else {
      toast.success("YouTube profile saved successfully");
      goToNextStep();
    }

    setSaving(false);
  };

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

    try {
      const hasExistingTask = await checkExistingTask(null, invitation.id);
      if (hasExistingTask) {
        toast.error("This invitation has already been processed");
        setIsSubmitting(false);
        return;
      }

      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("First name and last name are required");
        setIsSubmitting(false);
        return;
      }
      const instagramUsername = formData.instagramUser?.trim();

      // Validación 1: campo obligatorio
      if (!instagramUsername) {
        toast.error("Instagram username is required.");
        setIsSubmitting(false);
        setSaving(false);
        return;
      }

      // Validación 2: formato correcto (sin arrobas, links, espacios, etc.)
      if (!isValidInstagramUsernameFormat(instagramUsername)) {
        toast.error(
          "Please enter only the Instagram username without @ or links."
        );
        setIsSubmitting(false);
        setSaving(false);
        return;
      }

      let isBusinessAccount: boolean | null = null;
      let isProfessionalAccount: boolean | null = null;

      // Validación 3: existencia del usuario
      try {
        const result = await fetchInstagramUser(instagramUsername);

        const user = result.result[0]?.user;

        if (
          !user?.username ||
          user.username.toLowerCase() !== instagramUsername.toLowerCase()
        ) {
          toast.error("Instagram user does not exist or is inaccessible.");
          setSaving(false);
          return;
        }

        isBusinessAccount = user.is_business;
        isProfessionalAccount = false;
      } catch (error) {
        console.log(error);
        toast.error("Failed to verify Instagram user.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("creator_invitations")
        .update({
          status: "in process",
          updated_at: new Date().toISOString(),
          first_name: formData.firstName,
          last_name: formData.lastName,
          instagram_user: instagramUsername,
          is_business_account: isBusinessAccount,
          is_professional_account: isProfessionalAccount,
        })
        .eq("id", invitation.id);

      if (error) {
        toast.error("Failed to accept invitation");
      } else {
        toast.success("Invitation accepted successfully");
        goToNextStep();
      }
    } catch (error) {
      console.error("Error in handleContinueWelcome:", error);
      toast.error("An error occurred while processing your request");
      setIsSubmitting(false);
      return;
    }
  };

  const handleCompleteProfileSubmit = async (formData: ProfileFormData) => {
    if (!invitation) return;
    setSaving(true);

    const updateData = {
      youtube_channel: formData.youtubeChannel || null,
      status: "in process" as const,
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

  const handleFacebookSubmit = async () => {
    if (!facebookFormData.verifyPageOwnership) {
      toast.error("Please verify that you own this Facebook page");
      return;
    }

    if (!facebookFormData.verifyProfileOwnership) {
      toast.error("Please verify that you own this Facebook ");
      return;
    }
    const { isValid: isPageUrlValid, errorMessage: pageUrlError } =
      validateFacebookPageUrl(facebookFormData.facebookPageUrl);

    const { isValid: isProfileUrlValid, errorMessage: profileUrlError } =
      validateFacebookPageUrl(facebookFormData.facebookProfileUrl);

    // Validación secuencial
    if (!isPageUrlValid) {
      toast.error(pageUrlError || "Invalid Facebook Business Page URL");
      return;
    }

    if (!isProfileUrlValid) {
      toast.error(profileUrlError || "Invalid Facebook Personal Profile URL");
      return;
    }

    if (
      facebookFormData.facebookPageUrl === facebookFormData.facebookProfileUrl
    ) {
      toast.error("Facebook Page and Profile URLs cannot be the same.");
      return;
    }

    if (!invitation_code || !invitation) {
      toast.error("Missing invitation data");
      return;
    }

    try {
      setSubmitting(true);

      // Validate that the Facebook page exists and is of type "page"
      const details = await fetchFacebookPageDetails(
        facebookFormData.facebookPageUrl.trim()
      );

      console.log(details);

      if (details.type !== "page") {
        toast.error("The provided URL does not correspond to a Facebook Page.");
        return;
      }

      // Proceed with update if validation passed
      const result = await updateFacebookPage(
        invitation.id,
        facebookFormData.facebookPageUrl.trim(),
        facebookFormData.facebookProfileUrl.trim()
      );

      if (
        !result ||
        result.facebook_page !== facebookFormData.facebookPageUrl.trim()
      ) {
        toast.error("Error saving your Facebook page");
        return;
      }

      toast.success("Your submission has been received");
      setSubmissionComplete(true);
    } catch (err) {
      toast.error("Error submitting your info");
      console.error(err);
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
            first_name: invitation.first_name,
            last_name: invitation.last_name,
            phone_country_code: invitation.phone_country_code || null,
            phone_number: invitation.phone_number || null,
            social_media_handle: invitation.instagram_user || null,
            country_of_residence_id: null,
          },
        },
      });

      if (error) throw error;

      toast.success("Account created! You can log in now.");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      console.log(err);
      toast.error("Error creating account");
    } finally {
      setSubmitting(false);
    }
  };

  // 🖼️ Render
  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <Card className="w-full">
          <CardContent className="text-center">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return <InvitationError message={error || "Invitation not found"} />;
  }

  if (invitation.status === "completed") {
    return <InvitationError message={error || "Invitation was completed"} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-7xl mx-auto my-8 md:my-12 ">
        <div className="lg:grid lg:grid-cols-[1fr_1.25fr]">
          {/* Left Side - Purple Section */}
          <div className="bg-gradient-to-br from-blue-500/80 to-purple-600/80 opacity-90 p-12 text-white relative overflow-hidden flex flex-col rounded-t-2xl md:rounded-tr-none md:rounded-s-2xl">
            <div className="relative z-10">
              {/* Official Badge */}
              <a
                href="https://www.facebook.com/FacebookforCreators/posts/pfbid02cZ1b5PweXBEdJhXz7XDBXSGVt1ELbkZNkSCR7vUAKeNmebbyQvk6in7AjJnboskNl"
                target="_blank"
                rel="noopener noreferrer"
                className="badge inline-flex items-center bg-white bg-opacity-30 rounded-full px-4 py-2 mb-6 no-underline hover:bg-opacity-40 transition"
              >
                <Check className="h-4 w-4 mr-2 text-white" />
                <span className="text-white font-medium text-sm">
                  Official Announcement
                </span>
              </a>

              {/* Main Title */}
              <h1 className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white mb-8">
                Join Meta
                <br className="lg:block" />
                Creator Breakthrough Bonus Program
              </h1>

              {/* Subtitle */}
              <p className="relative z-10 text-xl text-white mb-8">
                Get access to:
              </p>

              {/* Benefits Cards */}
              <div className="space-y-4">
                <BonusCard
                  icon={<DollarSign className="h-5 w-5" />}
                  title="$5,000 in bonuses"
                  subtitle="Earn while creating content you love"
                />

                <BonusCard
                  icon={<Clock className="h-5 w-5" />}
                  title="Monetize on Facebook Instantly"
                  subtitle="No waiting period for eligibility"
                />
                <BonusCard
                  icon={<Shield className="h-5 w-5" />}
                  title="Free Meta Verified"
                  subtitle="Get the blue checkmark & exclusive features"
                />
                <BonusCard
                  icon={<Zap className="h-5 w-5" />}
                  title="Fast-track application"
                  subtitle="Skip the line with our partner program"
                />
              </div>

              <div className="mt-8">
                <p className="text-white/80 font-medium">
                  Limited spots available. Apply now!
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="bg-white p-8 flex flex-col justify-center rounded-b-2xl md:rounded-e-2xl">
            <div className=" w-full">
              <div className="text-left mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                  Join Meta Creator Program
                </h2>
                <p className="text-purple-600 font-medium mb-4">
                  We're La Neta, an official partner of Meta
                </p>

                {currentStep.id === "welcome" && (
                  <div className="space-y-3 text-gray-600">
                    <p>
                      Welcome to the Meta Creator Breakthrough Bonus Program
                    </p>
                    <p>
                      Earn up to{" "}
                      <span className="font-semibold">$5,000 in bonuses</span>{" "}
                      just by posting Reels on Facebook
                    </p>
                    <p>
                      Start monetizing right away + get a free trial of Meta
                      Verified
                    </p>
                    <p>
                      Limited spots available for high-potential creators like
                      you
                    </p>
                    <p className="mt-4 text-gray-700">
                      Fill out the form below to get started.
                    </p>
                  </div>
                )}
              </div>

              {invitation?.social_media_type === "tiktok" && (
                <TikTokForm
                  currentStep={currentStep}
                  invitation={invitation}
                  formData={formData}
                  saving={saving}
                  isSubmitting={isSubmitting}
                  submissionComplete={submissionComplete}
                  facebookFormData={facebookFormData}
                  submitting={submitting}
                  error={error}
                  showPasswordForm={showPasswordForm}
                  passwordData={passwordData}
                  handleInputChange={handleInputChange}
                  handleCheckboxChange={handleCheckboxChange}
                  handleContinueWelcome={handleContinueWelcome}
                  handleCompleteProfileSubmit={handleCompleteProfileSubmit}
                  handleFacebookInputChange={handleFacebookInputChange}
                  handleCheckboxFacebookChange={handleCheckboxFacebookChange}
                  handleFacebookSubmit={handleFacebookSubmit}
                  handlePasswordChange={handlePasswordChange}
                  handleSetPassword={handleSetPassword}
                  setShowPasswordForm={setShowPasswordForm}
                />
              )}
              {invitation?.social_media_type === "youtube" && (
                <YouTubeForm
                  currentStep={currentStep}
                  invitation={invitation}
                  formData={formData}
                  saving={saving}
                  isSubmitting={isSubmitting}
                  submissionComplete={submissionComplete}
                  facebookFormData={facebookFormData}
                  submitting={submitting}
                  error={error}
                  showPasswordForm={showPasswordForm}
                  passwordData={passwordData}
                  handleInputChange={handleInputChange}
                  handleCheckboxChange={handleCheckboxChange}
                  handleContinueWelcome={handleContinueWelcome}
                  handleCompleteProfileYtbSubmit={
                    handleCompleteProfileYtbSubmit
                  }
                  handleFacebookInputChange={handleFacebookInputChange}
                  handleCheckboxFacebookChange={handleCheckboxFacebookChange}
                  handleFacebookSubmit={handleFacebookSubmit}
                  handlePasswordChange={handlePasswordChange}
                  handleSetPassword={handleSetPassword}
                  setShowPasswordForm={setShowPasswordForm}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
