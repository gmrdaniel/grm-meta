// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cyzrcfumjijffbzzrmia.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5enJjZnVtamlqZmZienpybWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTAzNTIsImV4cCI6MjA1OTYyNjM1Mn0.Ub4ksQsvqC4qd8dR-v1YYaDGdHV_1mCo1MgaUSATGvo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);