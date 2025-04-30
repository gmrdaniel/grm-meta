import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PinterestWelcomeForm } from "@/components/pinterest/PinterestWelcomeForm";
import { PinterestProfileForm } from "@/components/pinterest/PinterestProfileForm";
import { InvitationError } from "@/components/invitation/InvitationError";
import { Stepper } from "@/components/ui/stepper";
import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";
import { useInvitationLoader } from "@/hooks/use-invitationLoader";
import { ProjectStage } from "@/types/project";
import {
  replaceProfileCategories,
  updatePinterestUrl,
} from "@/services/profile-content-categories/creatorProfileService";
import { getProfileIdByInvitationId } from "@/services/creatorService";
import { PinterestVerificationSuccess } from "@/components/pinterest/PinterestVerificationSuccess";

const stepList = [
  { id: "createAccount", label: "Crear cuenta" },
  { id: "createPinterest", label: "Perfil" },
  { id: "sendedApplication", label: "Iniciar sesión" },
] as const;

type Step = (typeof stepList)[number];

const defaultFormData = {
  firstName: "",
  lastName: "",
  email: "",
  socialMediaHandle: "",
  termsAccepted: false,
  phoneNumber: "",
  phoneCountryCode: "",
  countryOfResidenceId: "",
};

export default function InvitationStepperPage() {
  const { invitation_code } = useParams<{ invitation_code: string }>();

  // State
  const [currentStep, setCurrentStep] = useState<Step>(stepList[0]);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
  const [invitation, setInvitation] = useState<CreatorInvitation | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [profileData, setProfileData] = useState({
    pinterestUrl: "",
    contentTypes: [] as string[],
    isConnected: false,
    isAutoPublishEnabled: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loading, error } = useInvitationLoader({
    invitation_code,
    setFormData,
    setInvitation,
    setProjectStages,
    setCurrentStep,
    stepList,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, termsAccepted: checked }));
  };

  const handleContinueWelcome = async (
    allFormData: typeof defaultFormData & { phoneCountryCode: string }
  ) => {
    if (!invitation) return;
    setIsSubmitting(true);

    try {
      // Paso 1: Actualizar la invitación
      const { error: updateError } = await supabase
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

      if (updateError) {
        toast.error("Failed to save your information");
        return;
      }
      
      // Paso 2: Crear el usuario en Supabase Auth
      const { error: signupError } =
        await supabase.auth.signUp({
          email: allFormData.email,
          password: crypto.randomUUID(),
          options: {
            data: {
              first_name: allFormData.firstName,
              last_name: allFormData.lastName,
              phone_country_code: allFormData.phoneCountryCode,
              phone_number: allFormData.phoneNumber,
              social_media_handle: allFormData.socialMediaHandle,
              country_of_residence_id: allFormData.countryOfResidenceId,
            },
          },
        });

      if (signupError) {
        toast.error("Error creating your account");
        return;
      }

      toast.success("Information saved and account created successfully!");
      goToNextStep(); // Move to profile step
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving your information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextStep = async () => {
    if (!invitation || !projectStages.length) return;
    const currentIndex = projectStages.findIndex(
      (s) => s.slug === currentStep.id
    );
    const nextStage = projectStages[currentIndex + 1];
    if (!nextStage) return;
    console.log("Next stage:", nextStage);
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

  const handleProfileSubmit = async () => {
    try {
      const { pinterestUrl, contentTypes } = profileData;

      if (!invitation.id || !pinterestUrl || !contentTypes?.length) {
        toast.error("Por favor completa todos los campos.");
        return;
      }

      // 1. Buscar el ID del perfil por email
      const profileId = await getProfileIdByInvitationId(invitation.id);
      if (!profileId) {
        toast.error("No se encontró un perfil con este correo.");
        return;
      }

      // 2. Actualizar la URL de Pinterest
      const { error: urlError } = await updatePinterestUrl(
        profileId,
        pinterestUrl
      );

      if (urlError) {
        console.error("Error actualizando URL:", urlError);
        toast.error("No se pudo guardar la URL de Pinterest.");
        return;
      }

      // 3. Reemplazar categorías
      const { error: categoryError } = await replaceProfileCategories(
        profileId,
        contentTypes
      );
      if (categoryError) {
        console.error("Error actualizando categorías:", categoryError);
        toast.error("No se pudieron actualizar las categorías.");
        return;
      }
      
      toast.success("¡Perfil guardado exitosamente!");


    if (error) {
      toast.error("Failed to save progress");
      return;
    }
      console.log(error)
      goToNextStep(); 
    } catch (error) {
      console.error("Error inesperado al guardar el perfil:", error);
      toast.error("Hubo un error inesperado al guardar el perfil.");
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
    return <InvitationError message={error ?? "Invitation not found"} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 py-8 px-4">
        {/* Left column - Text */}

        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 py-8 px-4">
          {/* Left column - Text */}
          <div className="w-full text-center space-y-8">
            <h1 className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Únete al Reto de Creadores de Pinterest y Gana
            </h1>

            <div className="prose prose-pink max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed sm:text-justify">
                ¡Pinterest está buscando creadores como tú! Crea una cuenta de
                Pinterest, conéctala a tu Instagram y estarás participando por
                un giftcard de $1,000 USD en Amazon o una de las 10 giftcards de
                $100 USD que tenemos para ti.
              </p>
            </div>
          </div>

          {/* Right column - Form card */}
          <Card className="w-full shadow-2xl bg-white/95 backdrop-blur">
            <div className="p-8">
              <Stepper
                steps={stepList}
                currentStep={currentStep.id}
                variant="pink"
              />

              {currentStep.id === "createAccount" && (
                <PinterestWelcomeForm
                  invitation={invitation}
                  formData={formData}
                  onInputChange={handleInputChange}
                  onCheckboxChange={handleCheckboxChange}
                  onContinue={handleContinueWelcome}
                  isSubmitting={isSubmitting}
                />
              )}

              {currentStep.id === "createPinterest" && (
                <PinterestProfileForm
                  invitation={invitation}
                  profileData={profileData}
                  setProfileData={setProfileData}
                  onSubmit={handleProfileSubmit}
                  isSubmitting={isSubmitting}
                />
              )}

              {currentStep.id === "sendedApplication" && (
                <PinterestVerificationSuccess />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
