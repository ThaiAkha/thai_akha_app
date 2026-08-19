/**
 * Data layer unico (TanStack Query) - #86 F1.
 *
 * Un solo QueryClient per app (front e admin lo montano via <AppQueryProvider>).
 * I default replicano il comportamento delle vecchie cache a mano
 * (Map a livello modulo, `let cancelled`): un fetch per chiave e per sessione,
 * nessun refetch al focus della finestra, nessun retry aggressivo.
 *
 * - staleTime 5 min: i contenuti CMS (page_sections, media_assets, site_metadata)
 *   cambiano raramente; entro 5 minuti nessuna richiesta di rete duplicata.
 * - gcTime 30 min: la voce resta in memoria per il back/forward tra pagine.
 * - StrictMode: il doppio mount in dev condivide la stessa query in volo,
 *   quindi UNA sola chiamata a Supabase.
 */
import { QueryClient } from '@tanstack/react-query';

export const QUERY_STALE_TIME_MS = 5 * 60 * 1000;
export const QUERY_GC_TIME_MS = 30 * 60 * 1000;

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        gcTime: QUERY_GC_TIME_MS,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
}
