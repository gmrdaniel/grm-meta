import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";

export const fetchInProcessInvitationsByProjects = async (
  projectIds: string[]
): Promise<
  {
    projectId: string;
    invitations: CreatorInvitation[];
  }[]
> => {
  try {
    const results = await Promise.all(
      projectIds.map(async (projectId) => {
        const { data, error } = await supabase
          .from("creator_invitations")
          .select("*")
          .eq("project_id", projectId)
          .eq("status", "in process");

        if (error) {
          console.error(
            `Error fetching in process invitations for project ${projectId}:`,
            error
          );
          return { projectId, invitations: [] };
        }

        return { projectId, invitations: data ?? [] };
      })
    );

    return results;
  } catch (err) {
    console.error("Unexpected error fetching in process invitations:", err);
    return [];
  }
};
