import { useEffect, useState } from 'react';
import { newsService } from '@thaiakha/shared/services';
import { FrontHomeCard } from '@thaiakha/shared/types';

export type { FrontHomeCard };

// ─── Module-level cache ────────────────────────────────────────────
const _caches = new Map<string, FrontHomeCard[]>();
const _promises = new Map<string, Promise<FrontHomeCard[]>>();

async function fetchFrontHomeCards(cardIds?: string[]): Promise<FrontHomeCard[]> {
  const cacheKey = cardIds ? JSON.stringify(cardIds) : 'all';

  if (_caches.has(cacheKey)) {
    return _caches.get(cacheKey)!;
  }

  if (_promises.has(cacheKey)) {
    return _promises.get(cacheKey)!;
  }

  const promise = (async () => {
    const cards = await newsService.getFrontHomeCards(cardIds);
    _caches.set(cacheKey, cards);
    return cards;
  })();

  _promises.set(cacheKey, promise);

  promise.finally(() => {
    _promises.delete(cacheKey);
  });

  return promise;
}

export function useFrontHomeCards(cardIds?: string[]) {
  const cacheKey = cardIds ? JSON.stringify(cardIds) : 'all';

  const [cards, setCards] = useState<FrontHomeCard[]>(() => {
    return _caches.get(cacheKey) || [];
  });
  const [loading, setLoading] = useState(!_caches.has(cacheKey));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (_caches.has(cacheKey)) {
      setCards(_caches.get(cacheKey)!);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchFrontHomeCards(cardIds)
      .then(data => {
        if (!cancelled) {
          setCards(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [cacheKey]);

  return { cards, loading, error };
}
