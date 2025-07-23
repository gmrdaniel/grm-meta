// Temporary Supabase client with type bypass for mismatched schemas
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cvejikbbqqlvtsprhddv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZWppa2JicXFsdnRzcHJoZGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDgxMzEsImV4cCI6MjA2ODg4NDEzMX0.ipuBPnVtGfGdJ8YMJtHGXxvj7ierr4SDnAXy1pokWbM";

// Create client without types to bypass schema mismatches
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
}) as any;