import { createClient } from '@supabase/supabase-js';

/**
 * Unified Supabase client for thaiakha-cherry-2026 monorepo.
 * Supports both Vite (import.meta.env) and Node (process.env) environments.
 */

// Helper per environment variables cross-platform
const getEnvVar = (key: string, fallback: string): string => {
  // Vite environment (browser)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback;
  }
  // Node environment (SSR/Edge Functions)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  return fallback;
};

const supabaseUrl = getEnvVar(
  'VITE_SUPABASE_URL',
  'https://mtqullobcsypkqgdkaob.supabase.co'
);

const supabaseAnonKey = getEnvVar(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cXVsbG9iY3N5cGtxZ2RrYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDEwMzgsImV4cCI6MjA4NDMxNzAzOH0.nPpgbaFS8A6HTKZ6jr6a9YePXIKak3UMtsY1N_5f_Io'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Fix per React StrictMode double-mount issue
    // Previene "navigator.locks is not available" in alcuni browser
    lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
      return await fn();
    },
  },
});

// Re-export types utili
export type { SupabaseClient } from '@supabase/supabase-js';
