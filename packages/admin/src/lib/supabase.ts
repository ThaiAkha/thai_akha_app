import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual environment variables
// Falling back to hardcoded values from old app if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mtqullobcsypkqgdkaob.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cXVsbG9iY3N5cGtxZ2RrYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDEwMzgsImV4cCI6MjA4NDMxNzAzOH0.nPpgbaFS8A6HTKZ6jr6a9YePXIKak3UMtsY1N_5f_Io';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Disable navigator.locks — it conflicts with React StrictMode's
        // double-mount causing AbortError on getSession() and all queries.
        // The no-op lock just executes the callback directly.
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
            return await fn();
        },
    },
});
