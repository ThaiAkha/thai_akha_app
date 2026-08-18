// Path: supabase/functions/_shared/edgeGuard.ts
// Guardie condivise per le edge function esposte al pubblico (audit 2026-08, #85).
//
//  - rateLimit(): finestra scorrevole in memoria per isolate. Non e' un limite globale
//    (ogni istanza edge ha la sua mappa) ma taglia il grosso: script che martellano
//    lo stesso endpoint colpiscono quasi sempre la stessa istanza calda.
//  - isAllowedRedirect(): allowlist degli origin verso cui una edge puo' costruire link
//    con token (reset password). Senza, chiunque puo' farsi consegnare il token della
//    vittima su un dominio suo. Estendibile via env ALLOWED_REDIRECT_ORIGINS (csv).
//  - clientIp(): IP del chiamante dietro il gateway Supabase.

const buckets = new Map<string, number[]>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= max) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)
  // igiene: la mappa non deve crescere all'infinito
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k)
  }
  return true
}

const DEFAULT_ORIGINS = [
  'https://www.thaiakha.com',
  'https://thaiakha.com',
  'https://admin.thaiakha.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
]

export function allowedOrigins(): Set<string> {
  const extra = (Deno.env.get('ALLOWED_REDIRECT_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return new Set([...DEFAULT_ORIGINS, ...extra])
}

export function isAllowedRedirect(url: string): boolean {
  try {
    const u = new URL(url)
    return allowedOrigins().has(u.origin)
  } catch {
    return false
  }
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ??
    'unknown'
  ) || 'unknown'
}
