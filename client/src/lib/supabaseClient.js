import { createClient } from '@supabase/supabase-js';

// Try to get environment variables from both import.meta.env and process.env
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging
console.log('Environment variables:', {
  import_meta_env_url: import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  process_env_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  import_meta_env_key: import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process_env_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  final_url: supabaseUrl,
  final_key: supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure you have:\n' +
    'NEXT_PUBLIC_SUPABASE_URL\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
