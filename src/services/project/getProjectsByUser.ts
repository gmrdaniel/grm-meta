import { supabase } from "@/integrations/supabase/client";

type ProjectInvitation = {
  id: string;
  projectName: string;
  invitation_link: string;
  status: string
  created_at: string
};

export const fetchProjectsByEmail = async (
  email: string
): Promise<ProjectInvitation[]> => {
  if (!email) {
    console.error("Email is null");
    throw new Error("Email is null");
  }

  const { data, error } = await supabase
    .from("creator_invitations")
    .select("invitation_url,status, created_at, projects(id, name)")
    .eq("email", email);

  if (error || !data) {
    console.error("Error fetching invitations with projects:", error);
    throw new Error(error?.message ?? "No invitations found");
  }

  const projects = data
    .filter((item) => item.projects)
    .map((item) => ({
      id: item.projects.id,
      projectName: item.projects.name,
      status:item.status,
      invitation_link: item.invitation_url,
      created_at: item.created_at, 
    }));

  return projects;
};