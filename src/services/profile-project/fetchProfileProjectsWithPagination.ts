import { supabase } from "@/integrations/supabase/client";

interface ProfileProjectsWithProfile {
  id: string;
  project_id: string;
  profile_id: string;
  fb_profile_id: string;
  fb_profile_owner_id: string;
  status: string;
  joined_at: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const fetchProfileProjectsWithPagination = async (
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = "joined_at",
  sortOrder: "asc" | "desc" = "desc",
  statusFilter?: string,
  projectFilter?: string,
  searchQuery?: string
): Promise<{ data: ProfileProjectsWithProfile[]; count: number }> => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const likeFilter = searchQuery?.trim()
      ? `profile.first_name.ilike.%${searchQuery.trim()}%,profile.last_name.ilike.%${searchQuery.trim()}%,profile.email.ilike.%${searchQuery.trim()}%`
      : undefined;

    // Count query
    let countQuery = supabase
      .from("profile_projects")
      .select("id", { count: "exact", head: true });

    if (statusFilter) countQuery = countQuery.eq("status", statusFilter);
    if (projectFilter) countQuery = countQuery.eq("project_id", projectFilter);
    if (likeFilter) countQuery = countQuery.or(likeFilter);

    const { count, error: countError } = await countQuery;
    if (countError) {
      console.error("Error fetching profile_projects count:", countError);
      return { data: [], count: 0 };
    }

    // Data query with JOIN
    let dataQuery = supabase
      .from("profile_projects")
      .select(
        `
        id,
        project_id,
        profile_id,
        fb_profile_id,
        fb_profile_owner_id,
        status,
        joined_at,
        profile:profiles!profile_projects_profile_id_fkey (
      first_name,
      last_name,
      email
    )
      `
      )
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    if (statusFilter) dataQuery = dataQuery.eq("status", statusFilter);
    if (projectFilter) dataQuery = dataQuery.eq("project_id", projectFilter);
    if (likeFilter) dataQuery = dataQuery.or(likeFilter);

    const { data, error } = await dataQuery;

    if (error) {
      console.error("Error fetching profile_projects data:", error);
      return { data: [], count: count || 0 };
    }

    return {
      data: data as ProfileProjectsWithProfile[],
      count: count || 0,
    };
  } catch (err) {
    console.error(
      "Unexpected error in fetchProfileProjectsWithPagination:",
      err
    );
    return { data: [], count: 0 };
  }
};
