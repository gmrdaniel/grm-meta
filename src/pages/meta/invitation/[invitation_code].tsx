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
import { checkExistingTask } from "@/services/tasksService";

// 🧠 Utils
import { validateFacebookPageUrl } from "@/utils/validationUtils";

// 🗃️ Types
import { CreatorInvitation } from "@/types/invitation";
import { ProjectStage } from "@/types/project";
import { Check } from "lucide-react";

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
        /*  if (invitationData.status === "accepted") {
          setError("This invitation has already been accepted");
          return;
        } */

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

    const hasExistingTask = await checkExistingTask(null, invitation.id);
    if (hasExistingTask) {
      toast.error("This invitation has already been processed");
      return;
    }

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

      await updateInvitationStatus(invitation.id, "accepted");
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
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
    <div className="flex flex-col md:flex-row items-center justify-evenly min-h-screen bg-gray-50 p-4 gap-2">
      <div className="text-center max-w-md space-y-1 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Meta Monetization Program
        </h1>
        <p className="text-sm text-gray-500">Join. Monetize. Grow.</p>

        {/* Benefits Section */}
      <div className="p-4 ">
        <h3 className="font-medium mb-3">Benefits:</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span>$5,000 Bonuses (90 days)</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span>Immediate Facebook Monetization</span>
          </li>
        </ul>
        

      </div>
      </div>

      <div className="h-[400px] hidden lg:block  bg-blue-300 p-[1px]"></div>

      <Card className="w-full max-w-lg min-h-lg">
        <CardContent className="pt-6">
          <Stepper steps={stepList} currentStep={currentStep.id} />

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
        </CardContent>
      </Card>
    </div>
  );
}
