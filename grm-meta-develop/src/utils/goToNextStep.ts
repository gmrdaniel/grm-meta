import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoToNextStepParams {
    invitationId: string;
    projectStages: { id: string; slug: string }[];
    currentStepId: string;
    updateStage: (newStage: { id: string; slug: string }) => void;
  }
  
  export async function goToNextStep({
    invitationId,
    projectStages,
    currentStepId,
    updateStage,
  }: GoToNextStepParams) {
    const currentIndex = projectStages.findIndex(
      (s) => s.slug === currentStepId
    );
    const nextStage = projectStages[currentIndex + 1];
    if (!nextStage) return;
  
    const { error } = await supabase
      .from('creator_invitations')
      .update({
        current_stage_id: nextStage.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitationId);
  
    if (error) {
      toast.error('Failed to save progress');
      return;
    }
  
    // Optional: if you want to immediately update UI
    updateStage(nextStage);
  }
  