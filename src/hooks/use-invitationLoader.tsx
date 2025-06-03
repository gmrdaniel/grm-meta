
import { findInvitationByCode } from "@/integrations/supabase/client";
import { fetchProjectStages } from "@/services/project/projectService";
import { useEffect, useState } from "react";

interface UseInvitationLoaderProps {
  invitation_code: string | undefined;
  setFormData: (data: any) => void;
  setInvitation: (data: any) => void;
  setProjectStages: (data: any[]) => void;
  setCurrentStep: (step: any) => void;
  stepList: readonly { id: string; [key: string]: any }[];
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
        
        setInvitation(invitationData);
        setFormData({
          firstName: invitationData.first_name ?? "",
          lastName: invitationData.last_name ?? "",
          email: invitationData.email ?? "",
          socialMediaHandle: invitationData.social_media_handle ?? "",
          termsAccepted: false,
          phoneNumber: invitationData.phone_number ?? "",
          phoneCountryCode: invitationData.phone_country_code ?? "",
          countryOfResidenceId: "",
          instagramUser: invitationData.instagram_user ?? "",
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
  }, [invitation_code, stepList]);

  return { loading, error };
};
