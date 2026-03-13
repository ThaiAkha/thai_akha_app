import { createClient } from '@supabase/supabase-js';

/**
 * Unified Supabase client for thaiakha-cherry-2026 monorepo.
 * Supports both Vite (import.meta.env) and Node (process.env) environments.
 */

// Helper per environment variables cross-platform
const getEnvVar = (key: string, fallback: string): string => {
  // Vite environment (browser)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key] || fallback;
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

const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing! Check your .env files.');
}

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
