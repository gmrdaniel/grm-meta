import { supabase } from "@/integrations/supabase/client";

export interface Event {
  id: string;
  id_project: string;
  event_name: string;
  description?: string;
  deadline?: string;
  link_terms?: string;
  projects?: {
    name: string;
  };
}

export interface FetchEventsParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
  projectId?: string;
}

/**
 * Fetch events with pagination
 */
export const fetchEventsWithPagination = async (
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'event_name', 
  sortOrder: 'asc' | 'desc' = 'desc',
  searchQuery?: string,
  projectId?: string,
): Promise<{ data: Event[], count: number }> => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const likeFilter = searchQuery?.trim()
      ? `event_name.ilike.%${searchQuery.trim()}%`
      : undefined;

    // Obtener el count
    let countQuery = supabase
      .from('invitation_events')
      .select('*', { count: 'exact', head: true });

    if (projectId) {
      countQuery = countQuery.eq('id_project', projectId);
    }

    if (likeFilter) {
      countQuery = countQuery.or(likeFilter);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching events count:', countError);
      throw new Error(countError.message);
    }

    // Obtener los datos
    let dataQuery = supabase
      .from('invitation_events')
      .select(`
        *,
        projects (name)
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (projectId) {
      dataQuery = dataQuery.eq('id_project', projectId);
    }

    if (likeFilter) {
      dataQuery = dataQuery.or(likeFilter);
    }

    const { data, error: dataError } = await dataQuery;

    if (dataError) {
      console.error('Error fetching events:', dataError);
      throw new Error(dataError.message);
    }

    return { data: data as Event[], count: count || 0 };
  } catch (err) {
    console.error('Unexpected error in fetchEventsWithPagination:', err);
    throw err;
  }
};

/**
 * Fetch all events
 */
export const fetchAllEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('invitation_events')
    .select(`
      *,
      projects (name)
    `)
    .order('event_name', { ascending: false }); 

  if (error) {
    console.error('Error fetching all events:', error);
    throw new Error(error.message);
  }

  return data as Event[];
};

/**
 * Fetch a single event by ID
 */
export const fetchEventById = async (id: string): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('invitation_events')
      .select(`
        *,
        projects (name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching event by ID:', error);
      return null;
    }

    return data as Event | null;
  } catch (err) {
    console.error('Unexpected error in fetchEventById:', err);
    return null;
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invitation_events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw new Error(error.message);
  }
};

/**
 * Export events to Excel
 */
export const exportEventsToExcel = (events: Event[]) => {
  // Implementar la exportación a Excel similar a exportInvitationsToExcel
  // Puedes usar la librería xlsx como en el caso de las invitaciones
  console.log('Export events to Excel:', events);
  // Implementación pendiente
};