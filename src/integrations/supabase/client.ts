// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://icyajoecmxqjgyuhpqaa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeWFqb2VjbXhxamd5dWhwcWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMTkwMjAsImV4cCI6MjA1Njc5NTAyMH0._QpqRVEtP3_eUQTaHTsQVylRO0iTFGbYdrs_89WljP8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);