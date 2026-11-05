import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
// A missing deployment configuration must show an empty/error state, not crash React.
const url = supabaseUrl || 'https://unconfigured.invalid';
const key = supabaseAnonKey || 'not-configured';

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Public pages never inherit an administrator's session or draft visibility.
export const publicSupabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'portfolio-public' },
});
