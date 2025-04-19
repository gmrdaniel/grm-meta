import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PinterestWelcomeForm } from "@/components/pinterest/PinterestWelcomeForm";
import { CompleteProfileForm } from "@/components/invitation/CompleteProfileForm";
import { FacebookPageForm } from "@/components/facebook/FacebookPageForm";
import { SubmissionCompleteScreen } from "@/components/facebook/SubmissionCompleteScreen";
import { InvitationError } from "@/components/invitation/InvitationError";
import { Stepper } from "@/components/ui/stepper";
import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import { updateFacebookPage, updateInvitationStatus } from "@/services/invitation";
import { fetchProjectStages } from "@/services/projectService";
import { checkExistingTask } from "@/services/tasksService";
import { CreatorInvitation } from "@/types/invitation";
import { ProjectStage } from "@/types/project";

const stepList = [
  { id: "welcome", label: "Crear cuenta" },
  { id: "completeProfile", label: "Perfil" },
  { id: "connected", label: "Conectar" }
] as const;

type Step = (typeof stepList)[number];

export default function PinterestInvitationPage() {
  const { invitation_code } = useParams<{ invitation_code: string }>();
  const navigate = useNavigate();

  // 📦 State
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>(stepList[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    socialMediaHandle: "",
    termsAccepted: false,
  });
  const [facebookFormData, setFacebookFormData] = useState({
    facebookPageUrl: "",
    verifyOwnership: false,
    linkInstagram: false,
  });
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileData, setProfileData] = useState({
    pinterestUrl: "",
    contentTypes: [] as string[],
    isConnected: false,
    isAutoPublishEnabled: false,
  });

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
              (step) => step.id === currentStage.slug
            );
            if (currentStep) {
              setCurrentStep(currentStep);
            }
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

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentTypeChange = (value: string, checked: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      contentTypes: checked
        ? [...prev.contentTypes, value]
        : prev.contentTypes.filter((type) => type !== value),
    }));
  };

  const handleProfileCheckboxChange = (
    key: 'isConnected' | 'isAutoPublishEnabled',
    checked: boolean
  ) => {
    setProfileData((prev) => ({ ...prev, [key]: checked }));
  };

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

  const handleCompleteProfileSubmit = async (formData) => {
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

  const handleProfileSubmit = async () => {
    if (!invitation) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("creator_invitations")
        .update({
          pinterest_profile: profileData.pinterestUrl,
          content_types: profileData.contentTypes,
          has_connected_accounts: profileData.isConnected,
          has_enabled_autopublish: profileData.isAutoPublishEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      if (error) throw error;

      toast.success("¡Perfil guardado exitosamente!");
      goToNextStep();
    } catch (err) {
      toast.error("Error al guardar el perfil");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!facebookFormData.verifyOwnership) {
      toast.error("Please verify that you own this Facebook page");
      return;
    }

    const isValid = (facebookFormData.facebookPageUrl.includes("facebook.com") || facebookFormData.facebookPageUrl.includes("fb.com"))
    if (!isValid) {
      toast.error("Please enter a valid Facebook URL");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !invitation) {
    return <InvitationError message={error || "Invitation not found"} />;
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-8 p-6">
        <div className="text-center md:text-left space-y-6 max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Únete al Reto de Creadores de Pinterest y Gana
          </h1>
          
          <div className="prose prose-pink">
            <p className="text-gray-600">
              ¡Pinterest está buscando creadores como tú! Crea una cuenta de Pinterest, 
              conéctala a tu Instagram y estarás participando por un giftcard de $1,000 USD 
              en Amazon o una de las 10 giftcards de $100 USD que tenemos para ti.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="font-semibold text-lg text-gray-800">Beneficios:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-green-100 p-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">Llega a nuevas audiencias en Pinterest</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-green-100 p-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">Participa por premios de hasta $2,000 USD</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-green-100 p-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">¡Invitación a un Webinar exclusivo junto a Pinterest!</span>
              </li>
            </ul>
          </div>
        </div>

        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-6">
            <Stepper steps={stepList} currentStep={currentStep.id} />
            
            {currentStep.id === "welcome" && (
              <PinterestWelcomeForm
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

            {currentStep.id === "connected" &&
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
    </div>
  );
}
