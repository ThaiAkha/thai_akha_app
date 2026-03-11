
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Nota: In un ambiente di produzione reale, questi valori dovrebbero essere in variabili d'ambiente.
// Per questo progetto, assumiamo che le chiavi siano fornite dall'infrastruttura.
const supabaseUrl = 'https://mtqullobcsypkqgdkaob.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cXVsbG9iY3N5cGtxZ2RrYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDEwMzgsImV4cCI6MjA4NDMxNzAzOH0.nPpgbaFS8A6HTKZ6jr6a9YePXIKak3UMtsY1N_5f_Io';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
