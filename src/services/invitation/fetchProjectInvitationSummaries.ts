import { supabase } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";
import { ProjectSummary } from "@/types/project";

export const fetchProjectInvitationSummaries = async (
  projectId: string,
  dateFrom?: Date,
  dateTo?: Date,
  statusList: readonly string[] = []
): Promise<CreatorInvitation[]> => {
  let allInvitations: CreatorInvitation[] = [];
  let from = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('creator_invitations')
      .select(`
        *,
        projects(*)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom.toISOString());
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo.toISOString());
    }

    if (statusList.length > 0) {
      query = query.in('status', statusList);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invitations by range:', error);
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      allInvitations = [...allInvitations, ...data as CreatorInvitation[]];
      from += limit;
      hasMore = data.length === limit; // If it brings less than 1000, there are no more
    } else {
      hasMore = false;
    }
  }

  return allInvitations;
};

