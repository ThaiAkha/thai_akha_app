/**
 * useFrontHomeCards - card B2C `home_cards_front` (#86 F3).
 *
 * Prima: Map a livello modulo + `let cancelled`, e la home faceva 1 batch + 5
 * singole (SmartHomeCard) per le stesse card. Ora TanStack: il batch semina
 * `['front_home_card', id]` e ogni SmartHomeCard che chiede una card gia' vista
 * non fa nessuna query.
 *
 * Usage:
 *   const { cards, loading, error } = useFrontHomeCards(['home-card-01', 'home-card-02']);
 *   const { cards } = useFrontHomeCards();   // tutte le card attive
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@thaiakha/shared/query';
import { newsService } from '@thaiakha/shared/services';
import { FrontHomeCard } from '@thaiakha/shared/types';

export type { FrontHomeCard };

export const frontHomeCardQueryKey = (cardId: string) => ['front_home_card', cardId] as const;

const NO_CARDS: FrontHomeCard[] = [];

export function useFrontHomeCards(cardIds?: readonly string[]): {
  cards: FrontHomeCard[];
  loading: boolean;
  error: Error | null;
} {
  const queryClient = useQueryClient();
  // Lista vuota/assente = tutte le card attive (come newsService.getFrontHomeCards).
  const wantedIds = cardIds ? Array.from(new Set(cardIds.filter(Boolean))) : [];
  const idsKey = wantedIds.length > 0 ? wantedIds.join(',') : '__all__';

  const query = useQuery({
    queryKey: ['front_home_cards', idsKey] as const,
    queryFn: async (): Promise<FrontHomeCard[]> => {
      if (idsKey === '__all__') {
        const all = await newsService.getFrontHomeCards();
        for (const c of all) if (c.card_id) queryClient.setQueryData(frontHomeCardQueryKey(c.card_id), c);
        return all;
      }
      const wanted = idsKey.split(',');
      const found = new Map<string, FrontHomeCard>();
      const missing: string[] = [];
      for (const id of wanted) {
        const state = queryClient.getQueryState<FrontHomeCard | null>(frontHomeCardQueryKey(id));
        if (state?.data) found.set(id, state.data);
        else if (state?.data !== null) missing.push(id);
      }
      if (missing.length > 0) {
        const rows = await newsService.getFrontHomeCards(missing);
        for (const c of rows) {
          if (!c.card_id) continue;
          found.set(c.card_id, c);
          queryClient.setQueryData(frontHomeCardQueryKey(c.card_id), c);
        }
        for (const id of missing) {
          if (!found.has(id)) queryClient.setQueryData(frontHomeCardQueryKey(id), null);
        }
      }
      // Ordine = ordine richiesto (come il service).
      return wanted.map(id => found.get(id)).filter((c): c is FrontHomeCard => !!c);
    },
  });

  const cards = useMemo(() => query.data ?? NO_CARDS, [query.data]);
  return {
    cards,
    loading: query.isPending,
    error: query.error ? (query.error instanceof Error ? query.error : new Error(String(query.error))) : null,
  };
}
