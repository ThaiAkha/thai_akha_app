/**
 * Shared cache utilities for content services.
 * Stale-while-revalidate: returns cached value immediately, fetches fresh in background.
 *
 * ROBUSTNESS: a caching failure (e.g. localStorage QuotaExceededError) must NEVER
 * discard freshly-fetched data or break a page load. setCache is best-effort and
 * self-evicting; fetchWithCache only returns null on an actual fetch failure.
 *
 * COSTO (2026-09-06). Tutte le voci vivono in UNA chiave di localStorage, e fino a
 * oggi ogni lettura la ricaricava per intero da disco (JSON.parse del blob) e ogni
 * scrittura la riscriveva per intero (JSON.stringify + setItem, sincrono). Misurato
 * sui dati veri: una pagina che tocca dodici chiavi costava 24 parse e 12 scritture
 * del blob, cioe' circa 70 ms sul thread principale e 28 MB scritti, a ogni apertura.
 * Ora il blob si legge e si converte UNA volta e resta in memoria; le scritture si
 * raggruppano in una sola, poco dopo l'ultima modifica. Stesso formato su disco,
 * stessa chiave: nessuna migrazione. Il caso "due schede aperte" e' coperto
 * dall'evento `storage`, che il browser manda alle ALTRE schede quando una scrive.
 */

// Bumped v15 → v16 to drop the previously bloated monolithic blob on first load.
const GLOBAL_CACHE_KEY = 'akha_cache_content_v16';

// One-time cleanup: remove stale cache versions (e.g. the bloated v15) so they
// don't keep consuming the per-origin localStorage quota alongside the new key.
try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('akha_cache_content_v') && k !== GLOBAL_CACHE_KEY) {
            localStorage.removeItem(k);
        }
    }
} catch {
    /* localStorage unavailable — ignore */
}

type CacheEntry = { value: unknown; timestamp: number };
type CacheMap = Record<string, CacheEntry>;

// ── Copia in memoria ─────────────────────────────────────────────────────────
// `null` = non ancora letta da disco. Dopo la prima lettura e' la fonte di verita'
// di questa scheda: disco e altre schede si allineano da soli (vedi sotto).
let memo: CacheMap | null = null;

const readFromDisk = (): CacheMap => {
    try {
        const data = localStorage.getItem(GLOBAL_CACHE_KEY);
        return data ? (JSON.parse(data) as CacheMap) : {};
    } catch {
        return {};
    }
};

/** L'oggetto e' CONDIVISO fra i lettori: si legge, non si modifica (solo setCache scrive). */
const getCache = (): CacheMap => {
    if (memo === null) memo = readFromDisk();
    return memo;
};

// ── Scrittura raggruppata ────────────────────────────────────────────────────
// Le risposte di rete arrivano a grappolo: si aspetta un attimo dopo l'ultima
// modifica e si scrive una volta sola. Se la pagina viene nascosta o chiusa prima
// che scada il timer, si scrive subito (pagehide/visibilitychange, in fondo).
const FLUSH_DELAY_MS = 150;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
/** Chiavi modificate in memoria e non ancora su disco: servono allo sfratto e alla fusione fra schede. */
const pendingKeys = new Set<string>();

const writeToDisk = (map: CacheMap): boolean => {
    try {
        localStorage.setItem(GLOBAL_CACHE_KEY, JSON.stringify(map));
        return true;
    } catch {
        return false;
    }
};

/**
 * Best-effort write. On QuotaExceededError, evict the oldest half of the cache and
 * retry once; if it still fails, drop the cache on disk. Never throws.
 * La copia in memoria resta comunque valida per questa scheda: sono dati buoni,
 * e il prossimo flush riuscito li riporta su disco.
 */
const flush = (): void => {
    if (flushTimer !== null) { clearTimeout(flushTimer); flushTimer = null; }
    if (memo === null || pendingKeys.size === 0) return;
    const dirty = Array.from(pendingKeys);
    pendingKeys.clear();
    try {
        if (writeToDisk(memo)) return;
        // Quota exceeded → keep the newest half + the entries we are writing.
        const entries = Object.entries(memo).sort((a, b) => a[1].timestamp - b[1].timestamp);
        const pruned: CacheMap = Object.fromEntries(entries.slice(Math.floor(entries.length / 2)));
        for (const k of dirty) if (memo[k]) pruned[k] = memo[k];
        if (writeToDisk(pruned)) { memo = pruned; return; }
        try { localStorage.removeItem(GLOBAL_CACHE_KEY); } catch { /* noop */ }
    } catch {
        /* caching is best-effort — never let it break the app */
    }
};

const scheduleFlush = (): void => {
    if (flushTimer !== null) return;
    flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
};

const setCache = (key: string, value: unknown): void => {
    try {
        getCache()[key] = { value, timestamp: Date.now() };
        pendingKeys.add(key);
        scheduleFlush();
    } catch {
        /* caching is best-effort — never let it break the app */
    }
};

// ── Altre schede e chiusura pagina ───────────────────────────────────────────
if (typeof window !== 'undefined') {
    // Un'altra scheda ha scritto: si rilegge il disco e si tengono sopra le nostre
    // modifiche non ancora scritte, cosi' non si perde niente da nessuna parte.
    // `key === null` e' localStorage.clear().
    window.addEventListener('storage', (e) => {
        if (e.key !== null && e.key !== GLOBAL_CACHE_KEY) return;
        const disk = readFromDisk();
        if (memo !== null) for (const k of pendingKeys) if (memo[k]) disk[k] = memo[k];
        memo = disk;
    });
    window.addEventListener('pagehide', flush);
}
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flush();
    });
}

// In-flight request dedup: on a cold cache, multiple components can request the
// same key in the same tick (e.g. SEOHead + the page both reading the SEO slug).
// Without this map each one fires its own network round-trip. We keep a single
// pending promise per key and share it, deleting the entry once it settles.
const inFlight = new Map<string, Promise<unknown>>();

export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T | null>,
): Promise<T | null> {
    const cache = getCache();

    const revalidate = async (): Promise<T | null> => {
        const fresh = await fetcher();
        // Never persist an empty array: an empty list is almost always a transient
        // failure (auth/RLS race, network blip), and caching it would poison every
        // later read until a hard refresh — and would overwrite a previously-good
        // cached value during stale-while-revalidate. Skipping the write is safe:
        // a genuinely-empty list just re-fetches (cheap) instead of serving a stale [].
        const isEmptyArray = Array.isArray(fresh) && fresh.length === 0;
        // setCache never throws, so a caching failure can never discard `fresh`.
        if (fresh !== null && fresh !== undefined && !isEmptyArray) setCache(key, fresh);
        return fresh;
    };

    if (cache[key]) {
        // Background revalidation — swallow errors, keep serving the cached value.
        // Deduped via inFlight: N readers of the same key in the same tick (multiple
        // components, or StrictMode double-mount in dev) coalesce into ONE fetch.
        if (!inFlight.has(key)) {
            const p = revalidate()
                .catch((e) => { console.error(`Revalidate error for ${key}:`, e); return null; })
                .finally(() => inFlight.delete(key));
            inFlight.set(key, p);
        }
        return cache[key].value as T;
    }

    // Cache miss: dedup concurrent callers behind a single in-flight promise so
    // the same key fetched twice in the same tick only hits the network once.
    const pending = inFlight.get(key);
    if (pending) return pending as Promise<T | null>;

    const promise = (async (): Promise<T | null> => {
        try {
            return await revalidate();
        } catch (e) {
            console.error(`Fetch error for ${key}:`, e);
            return null;
        } finally {
            inFlight.delete(key);
        }
    })();

    inFlight.set(key, promise);
    return promise;
}

/**
 * Synchronous read of an already-cached value — no fetch, no revalidation.
 *
 * Needed where a decision must be made BEFORE the first paint and an async
 * round-trip would show a loader for something we already know (the language
 * slug map: the router must pick the page synchronously). Returns null on a
 * cache miss; the caller then falls back and re-resolves once the async load
 * lands. Never throws.
 */
export function peekCache<T>(key: string): T | null {
    try {
        const entry = getCache()[key];
        return entry ? (entry.value as T) : null;
    } catch {
        return null;
    }
}

/**
 * Normalizzazione lingua: 'th-TH' -> 'th'. Era una copia identica di
 * normalizeLangTag (lib/i18n): un solo corpo, un solo DEFAULT_LANG.
 */
export { normalizeLangTag as normalizeLang } from '../lib/i18n';
