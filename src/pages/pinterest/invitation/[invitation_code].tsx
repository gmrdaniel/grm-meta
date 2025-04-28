import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PinterestWelcomeForm } from "@/components/pinterest/PinterestWelcomeForm";
import { PinterestProfileForm } from "@/components/pinterest/PinterestProfileForm";
import { InvitationError } from "@/components/invitation/InvitationError";
import { Stepper } from "@/components/ui/stepper";
import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";

const stepList = [
  { id: "welcome", label: "Crear cuenta" },
  { id: "profile", label: "Perfil" },
  { id: "verification", label: "Verificación" },
] as const;

type Step = (typeof stepList)[number];

const defaultFormData = {
  firstName: "",
  lastName: "",
  email: "",
  socialMediaHandle: "",
  termsAccepted: false,
  phoneNumber: "",
};

export default function InvitationStepperPage() {
  const { invitation_code } = useParams<{ invitation_code: string }>();
  const navigate = useNavigate();

  // State
  const [currentStep, setCurrentStep] = useState<Step>(stepList[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [profileData, setProfileData] = useState({
    pinterestUrl: "",
    contentTypes: [] as string[],
    isConnected: false,
    isAutoPublishEnabled: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [phoneCountryCode, setPhoneCountryCode] = useState<string>("+52"); // ELIMINACIÓN

  useEffect(() => {
    const fetchInvitation = async () => {
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
        console.log("Fetched invitation data:", invitationData);

        if (invitationData.status === "completed") {
          setError("This invitation has already been accepted");
          return;
        }

        setInvitation(invitationData);
        setFormData({
          firstName: invitationData.first_name || "",
          lastName: invitationData.last_name || "",
          email: invitationData.email || "",
          socialMediaHandle: invitationData.instagram_user || "",
          termsAccepted: false,
          phoneNumber: invitationData.phone_number || "",
        });
      } catch (err) {
        console.error("Error loading invitation:", err);
        setError("Failed to load invitation details");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitation_code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, termsAccepted: checked }));
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
    key: "isConnected" | "isAutoPublishEnabled",
    checked: boolean
  ) => {
    setProfileData((prev) => ({ ...prev, [key]: checked }));
  };

  const handleContinueWelcome = async (
    allFormData: typeof defaultFormData & { phoneCountryCode: string }
  ) => {
    // MODIFICACIÓN: Recibimos el objeto completo
    if (!invitation) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("creator_invitations")
        .update({
          status: "accepted",
          first_name: allFormData.firstName,
          last_name: allFormData.lastName,
          social_media_handle: allFormData.socialMediaHandle,
          phone_number: allFormData.phoneNumber,
          phone_country_code: allFormData.phoneCountryCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      if (error) {
        toast.error("Failed to save your information");
        return;
      }

      toast.success("Information saved successfully!");
      setCurrentStep(stepList[1]); // Move to profile step
    } catch (err) {
      toast.error("An error occurred while saving your information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async () => {
    // Simply advance to the next step without validations or saving data
    setCurrentStep(stepList[2]); // Move to verification step
    toast.success("¡Perfil guardado exitosamente!");
  };

  const handleVerificationComplete = async () => {
    if (!invitation) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("creator_invitations")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      if (error) throw error;

      toast.success("¡Verificación completada exitosamente!");
    } catch (err) {
      toast.error("Error al completar la verificación");
    } finally {
      setIsSubmitting(false);
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 py-8 px-4">
        {/* Centered column for text */}
        <div className="w-full max-w-2xl text-center space-y-8">
          <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Únete al Reto de Creadores de Pinterest y Gana
          </h1>

          <div className="prose prose-pink max-w-none">
            <p className="text-lg text-left lg:text-lg text-gray-700 leading-relaxed sm:text-justify">
              ¡Pinterest está buscando creadores como tú! Crea una cuenta de
              Pinterest, conéctala a tu Instagram y estarás participando por un
              giftcard de $1,000 USD en Amazon o una de las 10 giftcards de $100
              USD que tenemos para ti.
            </p>
          </div>
        </div>

        {/* Right column - Form card */}
        <Card className="w-full lg:w-2/4 shadow-2xl bg-white/95 backdrop-blur">
          <div className="p-8">
            <Stepper
              steps={stepList}
              currentStep={currentStep.id}
              variant="pink"
            />

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

            {currentStep.id === "profile" && (
              <PinterestProfileForm
                profileData={profileData}
                onInputChange={handleProfileInputChange}
                onContentTypeChange={handleContentTypeChange}
                onCheckboxChange={handleProfileCheckboxChange}
                onSubmit={handleProfileSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
