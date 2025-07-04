
import { supabase, findInvitationByCode } from "@/integrations/supabase/client";
import { CreatorInvitation } from "@/types/invitation";

/**
 * Fetch a single invitation by its code
 */
export const fetchInvitationByCode = async (code: string): Promise<CreatorInvitation | null> => {
  try {
    // Use the RPC function to find invitation by code (fuzzy matching)
    const { data, error } = await findInvitationByCode(code);

    if (error) {
      console.error('Error fetching invitation by code:', error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0] as unknown as CreatorInvitation;
    }

    return null;
  } catch (err) {
    console.error('Unexpected error in fetchInvitationByCode:', err);
    return null;
  }
};

/**
 * Fetch a single invitation by ID
 */
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

/**
 * Fetch all invitations with pagination support
 */
export const fetchInvitationsWithPagination = async (
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc',
  statusFilter?: "pending" | "approved" | "rejected" | "completed" | "in process",
  searchQuery?: string,
  projectFilter?: string, // Nuevo parámetro para filtrar por proyecto
): Promise<{ data: CreatorInvitation[], count: number }> => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const likeFilter = searchQuery?.trim()
      ? `first_name.ilike.%${searchQuery.trim()}%,last_name.ilike.%${searchQuery.trim()}%,email.ilike.%${searchQuery.trim()}%,invitation_code.ilike.%${searchQuery.trim()}%`
      : undefined;

    // --- Paso 1: Obtener el count
    let countQuery = supabase
      .from('creator_invitations')
      .select('*', { count: 'exact', head: true });

    if (statusFilter) {
      countQuery = countQuery.eq('status', statusFilter);
    }

    if (projectFilter && projectFilter !== 'all') {
      countQuery = countQuery.eq('project_id', projectFilter);
    }

    if (likeFilter) {
      countQuery = countQuery.or(likeFilter);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching invitations count:', countError);
      return { data: [], count: 0 };
    }

    // --- Paso 2: Obtener los datos paginados
    let dataQuery = supabase
      .from('creator_invitations')
      .select(`
        *,
        projects(id, name)
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (statusFilter) {
      dataQuery = dataQuery.eq('status', statusFilter);
    }

    if (projectFilter && projectFilter !== 'all') {
      dataQuery = dataQuery.eq('project_id', projectFilter);
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


/**
 * Fetch all invitations (no pagination, for export)
 */
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
export const fetchInvitationsByDateAndStatus = async (
  projectId: string,
  dateFrom?: Date,
  dateTo?: Date,
  statusList: readonly string[] = [],
  pageSize = 1000 // Supabase limit per request
): Promise<CreatorInvitation[]> => {
  let allResults: CreatorInvitation[] = [];
  let from = 0;
  let to = pageSize - 1;
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
      .range(from, to);

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
      console.error('Error fetching invitations by page:', error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      break;
    }

    allResults = allResults.concat(data);
    hasMore = data.length === pageSize;
    from += pageSize;
    to += pageSize;
  }

  return allResults;
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

/**
 * Legacy function for backwards compatibility
 */
export const fetchInvitations = async (): Promise<CreatorInvitation[]> => {
  const { data } = await fetchInvitationsWithPagination(1, 10);
  return data;
};