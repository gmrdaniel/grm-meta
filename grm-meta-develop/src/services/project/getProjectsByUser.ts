import { supabase } from "@/integrations/supabase/client";

type ProyectoConInvitacion = {
  id: string;
  name: string;
  invitation_link: string;
};

export const fetchProjectsByEmail = async (
  email: string
): Promise<ProyectoConInvitacion[]> => {
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

  const proyectos = data
    .filter((item) => item.projects)
    .map((item) => ({
      id: item.projects.id,
      name: item.projects.name,
      status:item.status,
      invitation_link: item.invitation_url,
      created_at: item.created_at, // Agregado aquí
    }));

  return proyectos;
};
