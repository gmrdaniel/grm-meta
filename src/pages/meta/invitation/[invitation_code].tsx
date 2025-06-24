// 🧩 Libs
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// 🧱 UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { InvitationError } from "@/components/invitation/InvitationError";
import { TikTokForm } from "@/components/invitation/TikTokForm";
import { YouTubeForm } from "@/components/invitation/YouTubeForm";

// 🛠️ Services
import { supabase } from "@/integrations/supabase/client";
import { updateFacebookPage, updateInvitation } from "@/services/invitation";
import { checkExistingTask } from "@/services/tasksService";

// 🧠 Utils
import { validateFacebookPageUrl } from "@/utils/validateFacebookPageUrl";

// 🗃️ Types
import { CreatorInvitation } from "@/types/invitation";
import { ProjectStage } from "@/types/project";
import {
  Check,
  Clock,
  DollarSign,
  Info,
  LockKeyhole,
  Shield,
  ShieldCheck,
  Ticket,
  Waypoints,
  Zap,
} from "lucide-react";
import { fetchFacebookPageDetails } from "@/services/facebook/fetchFacebookPageDetails";
import { fetchInstagramUser } from "@/services/instagram/fetchInstagramUser";
import { isValidInstagramUsernameFormat } from "@/utils/isValidInstagramUsernameFormat";
import { ProfileFormData } from "@/types/forms-type";
import { useInvitationLoader } from "@/hooks/use-invitationLoader";
import BonusCard from "@/components/ui/bonus-card";
import { fetchInvitationEventByNotification } from "@/services/notification-settings/fetchInvitationEventByNotification";
import { sendMagicLink } from "@/utils/sendMagicLink";
import { Button } from "@/components/ui/button";

// 🧭 Steps
const stepList = [
  { id: "welcome", label: "Account" },
  { id: "completeProfile", label: "Verification" },
  { id: "fbcreation", label: "Connect" },
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
  const [searchParams] = useSearchParams();
  const notif: string | null = searchParams.get("notif");

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
  const [eventData, setEventData] = useState<any>();
  const [submittingStep, setSubmittingStep] = useState<string>("");
  useEffect(() => {
    if (!notif) return;

    const fetchEventData = async () => {
      try {
        const data = await fetchInvitationEventByNotification(notif);
        setEventData(data);
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };

    fetchEventData();
  }, [notif]);

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

  const getLoadingMessage = () => {
    if (isSubmitting) return "Verifying Instagram user...";
    if (saving) return "Saving profile information...";
    if (submittingStep === "validatingPage")
      return "Validating Facebook page...";
    if (submittingStep === "validatingProfile")
      return "Validating Facebook profile...";
    if (submittingStep === "updatingInvitation")
      return "Updating invitation...";
    if (submittingStep === "creatingAccount") return "Creating account...";
    if (submittingStep === "sendingMagicLink") return "Sending magic link...";
    if (submitting) return "Submitting Facebook data...";
    return "Loading information...";
  };

  // ✏️ Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let finalValue = value;

    if (name === "instagramUser") {
      finalValue = value
        .replace(/[^a-zA-Z0-9._]/g, "") // permite letras, números, punto y guion bajo
        .slice(0, 30); // máximo 30 caracteres
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
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

      if (/\s+$|\/$/.test(formData.instagramUser)) {
        toast.error("Username must not end with spaces or a slash (/)");
        setIsSubmitting(false);
        return;
      }

      if (/\s/.test(formData.instagramUser)) {
        toast.error("Username cannot contain spaces");
        setIsSubmitting(false);
        return;
      }
      if (!isValidInstagramUsernameFormat(instagramUsername)) {
        toast.error("Only letters, numbers, periods, and underscores allowed.");
        setIsSubmitting(false);
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
          registration_notification_id: notif,
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
    try {
      setSubmitting(true);

      // Step 1: Validate form fields
      setSubmittingStep("validatingPage");
      const isValid = validateFacebookForm();
      if (!isValid) return;

      // Step 2: Get Facebook page details
      const fbPageData = await fetchFacebookPageDetails(
        facebookFormData.facebookPageUrl.trim()
      );

      // Check if the page is valid
      if (fbPageData.type !== "page") {
        toast.error("The provided URL does not correspond to a Facebook Page.");
        return false;
      }

      setSubmittingStep("validatingProfile");
      // Step 3: Get Facebook profile details
      const fbOwnerProfileData = await fetchFacebookPageDetails(
        facebookFormData.facebookProfileUrl.trim()
      );

      if (
        fbOwnerProfileData.type !== "not_page" &&
        fbOwnerProfileData.type !== "private_page"
      ) {
        toast.error(
          "The provided URL does not correspond to a Facebook Profile."
        );
        return false;
      }

      setSubmittingStep("updatingInvitation");
      // Step 3: Update backend with Facebook data
      const updated = await updateFacebookInfo(
        invitation.id,
        fbPageData.profile?.profile_id, // Page ID
        fbOwnerProfileData?.profile?.profile_id // Profile ID
      );
      if (!updated) return;

      // Step 4: Register or enrich user in Supabase Auth
      setSubmittingStep("creatingAccount");
      const registered = await registerOrUpdateUser(invitation);
      if (!registered) return;

      // Step 5: Send magic link to login
      setSubmittingStep("sendingMagicLink");
      const magicLinkSent = await sendMagicLink(invitation.email);
      if (!magicLinkSent) return;

      // Final feedback
      toast.success(
        "Your submission has been received. Check your email to sign in."
      );
      setSubmissionComplete(true);
    } catch (err) {
      toast.error("Error submitting your info");
      console.error(err);
    } finally {
      setSubmitting(false);
      setSubmittingStep(null);
    }
  };

  const validateFacebookForm = (): boolean => {
    if (!facebookFormData.verifyPageOwnership) {
      toast.error("Please verify that you own this Facebook page");
      return false;
    }

    if (!facebookFormData.verifyProfileOwnership) {
      toast.error("Please verify that you own this Facebook profile");
      return false;
    }

    const { isValid: isPageUrlValid, errorMessage: pageUrlError } =
      validateFacebookPageUrl(facebookFormData.facebookPageUrl);
    const { isValid: isProfileUrlValid, errorMessage: profileUrlError } =
      validateFacebookPageUrl(facebookFormData.facebookProfileUrl);

    if (!isPageUrlValid) {
      toast.error(pageUrlError || "Invalid Facebook Business Page URL");
      return false;
    }

    if (!isProfileUrlValid) {
      toast.error(profileUrlError || "Invalid Facebook Personal Profile URL");
      return false;
    }

    if (
      facebookFormData.facebookPageUrl === facebookFormData.facebookProfileUrl
    ) {
      toast.error("Facebook Page and Profile URLs cannot be the same.");
      return false;
    }

    if (!invitation_code || !invitation) {
      toast.error("Missing invitation data");
      return false;
    }

    return true;
  };

  const updateFacebookInfo = async (
    invitationId: string,
    fb_profile_id?: string,
    fb_profile_owner_id?: string
  ): Promise<boolean> => {
    const result = await updateInvitation(invitationId, {
      facebook_page: facebookFormData.facebookPageUrl.trim(),
      facebook_profile: facebookFormData.facebookProfileUrl.trim(),
      fb_step_completed: true,
      fb_profile_id: fb_profile_id, //Page ID
      fb_profile_owner_id: fb_profile_owner_id, //Profile ID
      status: "completed",
    });

    if (!result) {
      toast.error("Error saving your Facebook page");
      return false;
    }

    return true;
  };

  const registerOrUpdateUser = async (invitation: any): Promise<boolean> => {
    const randomPassword =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    const { error: signUpError } = await supabase.auth.signUp({
      email: invitation.email,
      password: randomPassword,
      options: {
        data: {
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          phone_country_code: invitation.phone_country_code ?? null,
          phone_number: invitation.phone_number ?? null,
          social_media_handle: invitation.instagram_user ?? null,
          country_of_residence_id: null,
        },
      },
    });

    if (signUpError && signUpError.message !== "User already registered") {
      toast.error("Error registering user");
      console.error(signUpError);
      return false;
    }

    return true;
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center flex-col p-4">
      <div className="max-w-7xl mx-auto my-8 md:my-12 ">
        <div
          className={`lg:grid ${
            !submissionComplete && !invitation.fb_step_completed
              ? "lg:grid-cols-[1fr_1.25fr]"
              : ""
          } `}
        >
          {/* Left Side - Purple Section */}

          {!submissionComplete && !invitation.fb_step_completed && (
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
                {stepList.find((step) => step.id === currentStep.id).label ==
                  "Account" && (
                  <>
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
                        subtitle="Earn while creating content you love."
                      />

                      <BonusCard
                        icon={<Clock className="h-5 w-5" />}
                        title="Monetize on Facebook Instantly"
                        subtitle="No waiting period for eligibility."
                      />
                      <BonusCard
                        icon={<Shield className="h-5 w-5" />}
                        title="Free Meta Verified"
                        subtitle="Get the blue checkmark & exclusive features."
                      />
                      <BonusCard
                        icon={<Zap className="h-5 w-5" />}
                        title="Fast-track application"
                        subtitle="Skip the line with our partner program."
                      />
                    </div>

                    <div className="mt-8">
                      <p className="text-white/80 font-medium">
                        Limited spots available. Apply now!
                      </p>
                    </div>
                  </>
                )}
                {stepList.find((step) => step.id === currentStep.id).label ==
                  "Verification" && (
                  <>
                    <h1 className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white mb-8">
                      Verify your Identity
                    </h1>
                    <p className="mb-8">
                      We need to verify your phone number to secure your account
                      and continue with the registration process.
                    </p>
                    <div className="space-y-4">
                      <BonusCard
                        icon={<LockKeyhole className="h-5 w-5" />}
                        title="Secure Verification"
                        subtitle="We verify your identity to ensure program integrity and protect your account."
                      />
                      <BonusCard
                        icon={<ShieldCheck className="h-5 w-5" />}
                        title="Almost there"
                        subtitle="You're just a few steps away from applying to the Meta Creator Breakthrough Program."
                      />
                    </div>
                  </>
                )}
                {stepList.find((step) => step.id === currentStep.id).label ==
                  "Connect" && (
                  <>
                    <h1 className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white mb-8">
                      Connect Your Facebook Accounts
                    </h1>
                    <p className="mb-8">
                      We need to verify your facebook accounts to secure your
                      application and continue with the registration process.
                    </p>
                    <div className="space-y-4">
                      <BonusCard
                        icon={<Info className="h-5 w-5" />}
                        title="Important Information"
                        subtitle="Both your personal profile and business page are required for the  Meta Creator Breakthrough Program."
                      />
                      <BonusCard
                        icon={<Waypoints className="h-5 w-5" />}
                        title="Connection Required"
                        subtitle="Your Facebook Page must be connected to your Instagram account for your application to be valid."
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {/* Right Side - Form Section */}

          <div
            className={`bg-white p-8 flex flex-col justify-center rounded-b-2xl ${
              !submissionComplete && !invitation.fb_step_completed
                ? "md:rounded-bl-none md:rounded-e-2xl"
                : "rounded-2xl"
            }`}
          >
            <div className=" w-full">
              {!submissionComplete && !invitation.fb_step_completed && (
                <Stepper steps={stepList} currentStep={currentStep.id} />
              )}
              {invitation?.social_media_type === "tiktok" && (
                <TikTokForm
                  currentStep={currentStep}
                  invitation={invitation}
                  formData={formData}
                  saving={saving}
                  getLoadingMessage={getLoadingMessage}
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
                  setShowPasswordForm={setShowPasswordForm}
                />
              )}
            </div>
          </div>
        </div>
        {eventData && (
          <div className="w-full mt-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-500 p-6 text-white">
            {eventData.event_name && (
              <h2 className="flex items-center gap-1 text-xl font-bold mb-2">
                <Ticket className="text-red-300"></Ticket>{" "}
                {eventData.event_name}
              </h2>
            )}

            {eventData.description && (
              <p className="mb-4">{eventData.description}</p>
            )}

            {eventData.link_terms && (
              <p className="text-sm ">
                By participating, you agree to our{" "}
                <a
                  href={eventData.link_terms}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Terms and Conditions
                </a>
                .
              </p>
            )}

            {eventData.deadline && (
              <p className="text-sm font-medium">
                Deadline: {eventData.deadline} EST
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}