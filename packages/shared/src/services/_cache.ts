/**
 * Shared cache utilities for content services.
 * Stale-while-revalidate: returns cached value immediately, fetches fresh in background.
 *
 * ROBUSTNESS: a caching failure (e.g. localStorage QuotaExceededError) must NEVER
 * discard freshly-fetched data or break a page load. setCache is best-effort and
 * self-evicting; fetchWithCache only returns null on an actual fetch failure.
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

const getCache = (): CacheMap => {
    try {
        const data = localStorage.getItem(GLOBAL_CACHE_KEY);
        return data ? (JSON.parse(data) as CacheMap) : {};
    } catch {
        return {};
    }
};

/**
 * Best-effort write. On QuotaExceededError, evict the oldest half of the cache and
 * retry once; if it still fails, drop the cache entirely. Never throws.
 */
const setCache = (key: string, value: unknown): void => {
    try {
        const cache = getCache();
        cache[key] = { value, timestamp: Date.now() };
        try {
            localStorage.setItem(GLOBAL_CACHE_KEY, JSON.stringify(cache));
        } catch {
            // Quota exceeded → keep the newest half + the entry we are writing.
            const entries = Object.entries(cache).sort(
                (a, b) => a[1].timestamp - b[1].timestamp,
            );
            const pruned: CacheMap = Object.fromEntries(
                entries.slice(Math.floor(entries.length / 2)),
            );
            pruned[key] = cache[key];
            try {
                localStorage.setItem(GLOBAL_CACHE_KEY, JSON.stringify(pruned));
            } catch {
                try { localStorage.removeItem(GLOBAL_CACHE_KEY); } catch { /* noop */ }
            }
        }
    } catch {
        /* caching is best-effort — never let it break the app */
    }
};

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

/** Normalize language tag: 'th-TH' → 'th' */
export const normalizeLang = (lang: string): string =>
    lang?.split('-')[0].toLowerCase() || 'en';
