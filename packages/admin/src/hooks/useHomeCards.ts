import { useQuery, keepPreviousData } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import { useTranslation } from 'react-i18next';
import type { HomeCard } from '../components/dashboard/FeatureCardsGrid';

/**
 * Card della home per un ruolo, da `home_cards` (B2B - da non confondere con
 * `home_cards_front`, che e' il B2C).
 *
 * Prima del 2026-08-25 le 6 home facevano ognuna il proprio `useEffect` + `useState`
 * con lo stesso identico corpo: sei copie dello stesso fetch, fuori dal data layer
 * unico (CLAUDE.md #17). Ora e' una query sola, condivisa e cachata per lingua:
 * ruoli diversi che chiedono la stessa lingua riusano la stessa risposta.
 */
export const adminHomeCardsQueryKey = (lang: string) => ['home_cards', lang] as const;

export function useHomeCards(role: string) {
    const { i18n } = useTranslation();
    const query = useQuery({
        queryKey: adminHomeCardsQueryKey(i18n.language),
        // Al cambio lingua la chiave cambia: senza questo le griglie restano vuote
        // per qualche frame (HEAD teneva le card in useState fino al nuovo fetch).
        placeholderData: keepPreviousData,
        queryFn: async () => {
            // getHomeCards restituisce record generici: un cast unico alla forma usata dalle home.
            const cards = await contentService.getHomeCards(i18n.language);
            return cards as unknown as HomeCard[];
        },
    });
    const all = query.data ?? [];
    return {
        homeCards: all.filter((card) => card.role === role),
        loading: query.isLoading,
    };
}
