import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";
import { ProjectSummary } from "@/types/project";

export const fetchProjectsWithInvitationsSummary = async (): Promise<ProjectSummary[]> => {
  try {
    // 1. Traer todos los proyectos
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, name");

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return [];
    }
    if (!projects || projects.length === 0) {
      return [];
    }

    // 2. Por cada proyecto, consultar invitaciones y agrupar por estado
    const projectSummaries: ProjectSummary[] = [];

    for (const project of projects) {
      const { data: invitations, error: invitationsError } = await supabase
        .from("creator_invitations")
        .select("status")
        .eq("project_id", project.id);

      if (invitationsError) {
        console.error(`Error fetching invitations for project ${project.id}:`, invitationsError);
        continue; // continuar con el siguiente proyecto
      }

      // Contar según estado
      const approvedInvitations = invitations?.filter(inv => inv.status === "approved").length || 0;
      const completedInvitations = invitations?.filter(inv => inv.status === "completed").length || 0;
      const inProcessInvitations = invitations?.filter(inv => inv.status === "in process").length || 0;
      const rejectedInvitations = invitations?.filter(inv => inv.status === "rejected").length || 0;
      const acceptedInvitations = invitations?.filter(inv => inv.status === "accepted").length || 0;
      const pendingInvitations = invitations?.filter(inv => inv.status === "pending").length || 0;

      projectSummaries.push({
        projectId: project.id,  // <--- Agrega esto
        totalInvitations: invitations?.length || 0,
        projectName: project.name,
        approvedInvitations,
        acceptedInvitations,
        rejectedInvitations,
        pendingInvitations,
        completedInvitations,
        inProcessInvitations,
      });
    }

    return projectSummaries;
    console.log("Project summaries fetched successfully:", projectSummaries);
    

  } catch (err) {
    console.error("Unexpected error fetching projects summary:", err);
    return [];
  }
};
