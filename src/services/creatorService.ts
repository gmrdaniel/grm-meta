
import { supabase } from "@/integrations/supabase/client";
import { Creator } from "@/types/creator";

/**
 * Fetch all creators
 */
export const fetchCreators = async (): Promise<Creator[]> => {
  const { data, error } = await supabase
    .from('inventario_creadores')
    .select('*')
    .order('fecha_creacion', { ascending: false });
  
  if (error) {
    console.error('Error fetching creators:', error);
    throw new Error(error.message);
  }
  
  return data as Creator[];
};

/**
 * Create a new creator
 */
export const createCreator = async (creator: Omit<Creator, 'id' | 'fecha_creacion'>): Promise<Creator> => {
  const { data, error } = await supabase
    .from('inventario_creadores')
    .insert(creator)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating creator:', error);
    throw new Error(error.message);
  }
  
  return data as Creator;
};

/**
 * Update a creator
 */
export const updateCreator = async (id: string, updates: Partial<Creator>): Promise<Creator> => {
  const { data, error } = await supabase
    .from('inventario_creadores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating creator:', error);
    throw new Error(error.message);
  }
  
  return data as Creator;
};

/**
 * Delete a creator
 */
export const deleteCreator = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('inventario_creadores')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting creator:', error);
    throw new Error(error.message);
  }
};
