import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

/**
 * Unified Supabase client for thaiakha-cherry-2026 monorepo.
 * Supports both Vite (import.meta.env) and Node (process.env) environments.
 */

// Note: import.meta.env is typed via Vite's built-in ImportMetaEnv

/**
 * Risolve una env cross-platform.
 *
 * ⚠️ Vite inlinea SOLO le espressioni-membro LETTERALI `import.meta.env.VITE_X`
 * a build/transform time. Un accesso dinamico (`import.meta.env[key]` con `key`
 * variabile, o aliasando `import.meta`) NON viene sostituito → il valore resta
 * undefined nel bundle browser. Per questo il valore Vite va passato qui GIÀ
 * letto staticamente dal chiamante (`viteValue`), non per chiave.
 *
 * Ordine: Node/Edge (`process.env[nodeKey]`) → Vite browser (`viteValue`) → fallback.
 */
const resolveEnv = (
  viteValue: string | undefined,
  nodeKey: string,
  fallback: string,
): string => {
  // Node environment (SSR / Supabase Edge Functions)
  if (typeof process !== 'undefined' && process.env && process.env[nodeKey]) {
    return process.env[nodeKey] as string;
  }
  // Vite browser — valore già inlinato staticamente dal chiamante
  if (viteValue) return viteValue;
  return fallback;
};

// Accesso LETTERALE `import.meta.env.VITE_X` → Vite lo inlina a build/transform
// time (niente chiave dinamica/alias, che NON verrebbe sostituita). Il try/catch
// rende sicuro il contesto Node/Deno (Edge Functions) dove `import.meta.env` è
// assente: lì `viteUrl/viteKey` restano undefined e si usa `process.env`.
// NB: i 2 errori tsc "Property 'env' does not exist on ImportMeta" in standalone
// shared sono il baseline noto — nella build front i tipi arrivano da vite/client.
let viteUrl: string | undefined;
let viteKey: string | undefined;
try {
  viteUrl = import.meta.env.VITE_SUPABASE_URL;
  viteKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
} catch {
  /* Node/Deno: import.meta.env assente → fallback a process.env */
}

const supabaseUrl = resolveEnv(
  viteUrl,
  'VITE_SUPABASE_URL',
  'https://mtqullobcsypkqgdkaob.supabase.co',
);

const supabaseAnonKey = resolveEnv(
  viteKey,
  'VITE_SUPABASE_ANON_KEY',
  '',
);

// Senza chiave `createClient` muore comunque, ma con "supabaseKey is required":
// un messaggio che non dice ne' quale variabile manca ne' dove cercarla. Alziamo
// noi l'errore, dicendo entrambe le cose. (2026-08-05: un bundle admin senza
// VITE_SUPABASE_ANON_KEY e' finito in produzione perche' buildato da un git
// worktree, dove gli .env gitignorati non ci sono. Il guard di build vive in
// scripts/viteRequireEnv.ts; questo qui e' la seconda rete, a runtime.)
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
    !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
  ].filter(Boolean).join(', ');
  throw new Error(
    `Supabase non configurato: manca ${missing}. ` +
      'Nel browser arriva da .env / .env.production del package (gitignorati: ' +
      'da copiare a mano se builds da un worktree o da un clone fresco); ' +
      'in Node/Edge da process.env.',
  );
}

export { supabaseUrl, supabaseAnonKey };

/**
 * SICUREZZA guest chat: inietta l'header `x-cherry-token` col guest token da
 * localStorage (`cherry_session_token`) su OGNI richiesta. La RLS su chat_sessions
 * (applicata da /database) confronta `session_token` con
 * `current_setting('request.headers',true)::json->>'x-cherry-token'` → il possesso
 * del token, non la sola esistenza. Letto per-request (dinamico: sempre aggiornato).
 * Node/Edge (no localStorage) → skip; utenti loggati → innocuo (RLS usa auth.uid()).
 * Deploy coordinato: PRIMA questo header, POI la RLS.
 */
const cherryTokenFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  // URL della richiesta (string | URL | Request).
  const url = typeof input === 'string' ? input
    : input instanceof URL ? input.href
    : (input as Request).url;
  // ⚠️ SOLO richieste DB/REST (RLS guest chat). NON le Edge Functions: la loro CORS
  // non permette header custom → l'header romperebbe il preflight (es. gemini-token
  // → voce Cherry bloccata da CORS). Le edge fanno auth propria, non usano il token.
  const isEdgeFunction = url.includes('/functions/v1/');
  try {
    if (!isEdgeFunction) {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cherry_session_token') : null;
      if (token) headers.set('x-cherry-token', token);
    }
  } catch {
    /* localStorage non disponibile (SSR/Node/Deno) → nessun header */
  }
  return fetch(input, { ...init, headers });
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Fix per React StrictMode double-mount issue
    // Previene "navigator.locks is not available" in alcuni browser
    lock: async <T>(_name: string, _acquireTimeout: number, fn: () => Promise<T>): Promise<T> => {
      return await fn();
    },
  },
  global: { fetch: cherryTokenFetch },
});

// Re-export types utili
export type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Estrae il messaggio d'errore leggibile da un fallimento di `supabase.functions.invoke`.
 * Le edge rispondono con status reali (400/401/403/500) e body `{ error }`: supabase-js
 * lo incapsula in un FunctionsHttpError con `context` = Response, che va letto a mano.
 */
export async function getFunctionErrorMessage(err: unknown, fallback = 'Edge function error'): Promise<string> {
  const ctx = (err as { context?: unknown } | null)?.context;
  if (ctx instanceof Response) {
    try {
      const body = await ctx.clone().json();
      if (body && typeof body.error === 'string') return body.error;
    } catch { /* body non JSON */ }
    return `${fallback} (HTTP ${ctx.status})`;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}
