import { supabase } from "@/integrations/supabase/client";
import { ProjectSummary } from "@/types/project";

interface RawInvitation {
  project_id: string;
  project_name: string;
  status: string;
  invitation_count: number;
}

export const fetchProjectInvitationSummaries = async (): Promise<ProjectSummary[]> => {
  try {
    const { data, error } = await supabase
      .rpc<RawInvitation>('get_admin_invitation_stats');

    if (error) {
      console.error('Error fetching stats:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    const projectMap = new Map<string, ProjectSummary>();

    for (const row of data) {
      const { project_name, status, invitation_count,project_id } = row;

      // Si el proyecto aún no está en el mapa, lo agregamos
      if (!projectMap.has(project_name)) {
        projectMap.set(project_name, {
          project_id,
          project_name,
          total: 0,
          invitations: [],
        });
      }

      const project = projectMap.get(project_name)!;

      // Agregar invitación por estado
      project.invitations.push({ status, invitation_count });

      // Sumar al total
      project.total += invitation_count;
    }

    const projectSummaries = Array.from(projectMap.values());

    console.log("Project summaries fetched successfully:", projectSummaries);
    return projectSummaries;

  } catch (err) {
    console.error("Unexpected error fetching projects summary:", err);
    return [];
  }
};
