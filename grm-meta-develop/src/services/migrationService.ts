
import { supabase } from "@/integrations/supabase/client";

/**
 * Generate migration scripts for all tables in the database
 */
export const generateMigrationScripts = async (): Promise<{ tableName: string; script: string }[]> => {
  try {
    // Fetch table definitions from database
    const tables = [
      'creator_inventory',
      'notifications',
      'profiles',
      'project_stages',
      'projects'
    ];
    
    const migrations: { tableName: string; script: string }[] = [];
    
    // Generate create table scripts for each table
    for (const tableName of tables) {
      const { data, error } = await supabase.rpc('get_table_definition', { 
        table_name: tableName 
      });
      
      if (error) {
        console.error(`Error fetching definition for table ${tableName}:`, error);
        continue;
      }
      
      migrations.push({
        tableName,
        script: data || `-- Definition not found for table ${tableName}`
      });
    }
    
    return migrations;
  } catch (error) {
    console.error('Error generating migration scripts:', error);
    throw new Error('Failed to generate migration scripts');
  }
};

/**
 * Export complete database schema as SQL script
 */
export const exportDatabaseSchema = async (): Promise<string> => {
  try {
    const migrations = await generateMigrationScripts();
    
    // Combine all scripts into a single SQL file
    let fullScript = `-- Database schema export\n-- Generated on ${new Date().toISOString()}\n\n`;
    
    migrations.forEach(({ tableName, script }) => {
      fullScript += `-- Table: ${tableName}\n`;
      fullScript += `${script}\n\n`;
    });
    
    // Add functions and triggers
    fullScript += `
-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'creator');
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_invitation_by_code(code_param TEXT)
RETURNS SETOF creator_invitations AS $$
BEGIN
  -- Try exact match first
  RETURN QUERY 
  SELECT * FROM creator_invitations 
  WHERE invitation_code = code_param;
  
  -- If no rows returned, try case-insensitive match
  IF NOT FOUND THEN
    RETURN QUERY 
    SELECT * FROM creator_invitations 
    WHERE LOWER(invitation_code) = LOWER(code_param);
  END IF;
  
  -- If still no rows, try partial match
  IF NOT FOUND THEN
    RETURN QUERY 
    SELECT * FROM creator_invitations 
    WHERE invitation_code ILIKE '%' || code_param || '%';
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS Policies
-- Add RLS policies for each table here
`;
    
    return fullScript;
  } catch (error) {
    console.error('Error exporting database schema:', error);
    throw new Error('Failed to export database schema');
  }
};

/**
 * Get the SQL needed to create the update_stages_order function
 */
export const getUpdateStagesOrderFunctionSQL = (): string => {
  return `
CREATE OR REPLACE FUNCTION public.update_stages_order(stages_data json[])
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
DECLARE
  stage json;
BEGIN
  FOREACH stage IN ARRAY stages_data
  LOOP
    UPDATE public.project_stages
    SET order_index = (stage->>'order_index')::integer
    WHERE id = (stage->>'id')::uuid;
  END LOOP;
END;
$function$;
`;
};
