
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment configuration
const ENV = import.meta.env.VITE_APP_ENV || 'development';

// Supabase configuration by environment
const SUPABASE_CONFIG = {
  production: {
    url: "https://ovyakbwetiwkmpqjdhme.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eWFrYndldGl3a21wcWpkaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMjkzMTksImV4cCI6MjA1NDgwNTMxOX0.2JIEJzWigGcyb46r7iK-H5PIwYK04SzWaKHb7ZZV2bw"
  },
  development: {
    // Replace these with your development/staging Supabase project credentials
    url: import.meta.env.VITE_SUPABASE_URL || "https://rbxnfzieayzwjursprgx.supabase.co",
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJieG5memllYXl6d2p1cnNwcmd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NDkzODQsImV4cCI6MjA1NjUyNTM4NH0.NbniNSVDvK7etyZFnDTCU2Z133C1_hsGzG7NFaQ84M8"
  }
};

// Select configuration based on environment
const { url: SUPABASE_URL, key: SUPABASE_PUBLISHABLE_KEY } =
  SUPABASE_CONFIG[ENV === 'production' ? 'production' : 'development'];

console.log(`Using Supabase environment: ${ENV}`);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
