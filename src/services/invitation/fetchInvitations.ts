
import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";

export const fetchInvitationByCode = async (code: string): Promise<CreatorInvitation | null> => {
  try {
    const { data, error } = await findInvitationByCode(code);

    if (error) {
      console.error('Error fetching invitation by code:', error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0] as CreatorInvitation;
    }

    return null;
  } catch (err) {
    console.error('Unexpected error in fetchInvitationByCode:', err);
    return null;
  }
};

export const fetchInvitationById = async (id: string): Promise<CreatorInvitation | null> => {
  try {
    const { data, error } = await supabase
      .from('creator_invitations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching invitation by ID:', error);
      return null;
    }

    return data as CreatorInvitation | null;
  } catch (err) {
    console.error('Unexpected error in fetchInvitationById:', err);
    return null;
  }
};

export const fetchInvitationsWithPagination = async (
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc',
  statusFilter?: "pending" | "accepted" | "rejected" | "completed" | "in process" | "sended",
  searchQuery?: string,
): Promise<{ data: CreatorInvitation[], count: number }> => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const likeFilter = searchQuery?.trim()
      ? `first_name.ilike.%${searchQuery.trim()}%,last_name.ilike.%${searchQuery.trim()}%,email.ilike.%${searchQuery.trim()}%,invitation_code.ilike.%${searchQuery.trim()}%`
      : undefined;

    let countQuery = supabase
      .from('creator_invitations')
      .select('*', { count: 'exact', head: true });

    if (statusFilter) {
      countQuery = countQuery.eq('status', statusFilter);
    }

    if (likeFilter) {
      countQuery = countQuery.or(likeFilter);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching invitations count:', countError);
      return { data: [], count: 0 };
    }

    let dataQuery = supabase
      .from('creator_invitations')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (statusFilter) {
      dataQuery = dataQuery.eq('status', statusFilter);
    }

    if (likeFilter) {
      dataQuery = dataQuery.or(likeFilter);
    }

    const { data, error } = await dataQuery;

    if (error) {
      console.error('Error fetching paginated invitations:', error);
      return { data: [], count: count || 0 };
    }

    return {
      data: data as CreatorInvitation[],
      count: count || 0
    };
  } catch (err) {
    console.error('Unexpected error in fetchInvitationsWithPagination:', err);
    return { data: [], count: 0 };
  }
};

export const fetchAllInvitations = async (): Promise<CreatorInvitation[]> => {
  const { data, error } = await supabase
    .from('creator_invitations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all invitations:', error);
    throw new Error(error.message);
  }

  return data as CreatorInvitation[];
};

export const fetchInvitationsByRange = async (projectId: string, fechaDesde: Date): Promise<CreatorInvitation[]> => {
  const { data, error } = await supabase
    .from('creator_invitations')
    .select(`
    *,
    projects(*)
  `)
    .eq('project_id', projectId)
    .gte('created_at', fechaDesde.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all invitations:', error);
    throw new Error(error.message);
  }

  return data as CreatorInvitation[];
};

export const fetchInvitationsWithProfile = async (projectId: string): Promise<CreatorInvitation[]> => {
  const { data, error } = await supabase
  .from('creator_invitations')
  .select(`
    *,
    projects (
      name
    ),
    project_stages (
      name
    )
  `)
  .eq('project_id', projectId)
  .eq('status', 'completed')
  .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all invitations:', error);
    throw new Error(error.message);
  }

  return data as CreatorInvitation[];
};

export const fetchInvitations = async (): Promise<CreatorInvitation[]> => {
  const { data } = await fetchInvitationsWithPagination(1, 10);
  return data;
};
