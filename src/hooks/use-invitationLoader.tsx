import { findInvitationByCode, supabase } from "@/integrations/supabase/client";
import { fetchProjectStages } from "@/services/project/projectService";
import { useEffect, useState } from "react";

interface UseInvitationLoaderProps {
  invitation_code: string | undefined;
  setFormData: (data: any) => void;
  setInvitation: (data: any) => void;
  setProjectStages: (data: any[]) => void;
  setCurrentStep: (step: any) => void;
  stepList: readonly { id: string; [key: string]: any }[]; // Step list is dynamic now
}

export const useInvitationLoader = ({
  invitation_code,
  setFormData,
  setInvitation,
  setProjectStages,
  setCurrentStep,
  stepList,
}: UseInvitationLoaderProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        /* 
          if (invitationData.status === 'completed') {
            setError('This invitation has already been accepted');
            return;
          } */
        setInvitation(invitationData);
        setFormData({
          firstName: invitationData.first_name ?? "",
          lastName: invitationData.last_name ?? "",
          email: invitationData.email ?? "",
          socialMediaHandle: invitationData.social_media_handle ?? "",
          termsAccepted: false,
          phoneNumber: invitationData.phone_number ?? "",
          phoneCountryCode: invitationData.phone_country_code ?? "",
          countryOfResidenceId: invitationData.country_of_residence_id ?? "",
          instagramUser: invitationData.instagram_user ?? "",
        });

        const stagesData = await fetchProjectStages(invitationData.project_id);
        setProjectStages(stagesData);
        if (invitationData.status === "fixing") {
          // Consultar la tabla invitation_fixing para obtener detalles
          const { data, error } = await supabase
            .from("invitation_fixing")
            .select("*")
            .eq("invitation_id", invitationData.id)
            .eq("is_fixed", false)
            .maybeSingle();
          
          if (data) {
            // Configurar la UI según el motivo de la corrección
            switch(data.reason) {
              case "profile":
                // Dirigir al usuario a la edición de perfil
                const profileStep = stepList.find(step => step.id === "completeProfile");
                if (profileStep) setCurrentStep(profileStep);
                break;
              case "page":
                // Dirigir al usuario a la edición de página de Facebook
                const fbStep = stepList.find(step => step.id === "fbcreation");
                if (fbStep) setCurrentStep(fbStep);
                break;
              case "other":
                // Para el caso "other", continuamos con el flujo normal
                break;
            }
          }
        }

        // Continúa con el código existente para establecer el paso actual basado en current_stage_id
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
  }, [invitation_code, stepList]); // stepList now included in deps

  return { loading, error };
};
