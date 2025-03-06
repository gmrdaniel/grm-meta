
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment configuration
const ENV = import.meta.env.VITE_APP_ENV || 'development';

// Default Supabase URLs and keys for the Lovable environment
const DEFAULT_SUPABASE_URL = "https://icyajoecmxqjgyuhpqaa.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeWFqb2VjbXhxamd5dWhwcWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMTkwMjAsImV4cCI6MjA1Njc5NTAyMH0._QpqRVEtP3_eUQTaHTsQVylRO0iTFGbYdrs_89WljP8";

// Supabase configuration by environment
const SUPABASE_CONFIG = {
  production: {
    url: import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
  },
  development: {
    url: import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
  }
};

// Select configuration based on environment
const { url: SUPABASE_URL, key: SUPABASE_PUBLISHABLE_KEY } = 
  SUPABASE_CONFIG[ENV === 'production' ? 'production' : 'development'];

console.log(`Using Supabase environment: ${ENV}`);
console.log(`Supabase URL: ${SUPABASE_URL.split('//')[1].split('.')[0]}...`); // Log partial URL for debugging without exposing full URL

// Create and export the supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
