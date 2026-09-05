import { useQuery, keepPreviousData } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import { useTranslation } from 'react-i18next';

/** Forma dell'articolo consumata da AgencyNews e ArticleModal. */
export interface AgencyArticle {
    id: string;
    title: string;
    content: string;
    cover_image_url?: string;
    category?: string;
    created_at: string;
    author?: string;
    reading_time?: string;
}

/**
 * News per l'agenzia, da `akha_news` + sidecar `akha_news_translations`.
 *
 * Perche' esiste (2026-09-04): la pagina leggeva con `useEffect` + `useState` e
 * chiamava `getLatestNews()` senza lingua. Risultato: un'agenzia con l'interfaccia
 * in spagnolo leggeva gli articoli in inglese, pur essendoci la traduzione nel DB
 * da mesi. Il sidecar copre tutte e 11 le lingue: mancava solo chi la chiedesse.
 *
 * La lingua sta nella chiave, non solo nella query: senza, al cambio lingua la
 * cache servirebbe la risposta precedente. `keepPreviousData` evita che la lista
 * sfarfalli a vuoto nel frattempo (stessa scelta di `useHomeCards`).
 *
 * Le lingue dell'admin sono quattro (EN·TH·ES·ZH sui namespace agency); il merge
 * e' per campo, quindi un articolo tradotto a meta' esce coi campi tradotti che ha
 * e l'inglese sul resto - mai una scheda vuota.
 */
export const agencyNewsQueryKey = (lang: string) => ['agency_news', lang] as const;

export function useAgencyNews() {
    const { i18n } = useTranslation();
    const query = useQuery({
        queryKey: agencyNewsQueryKey(i18n.language),
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const rows = await contentService.getLatestNews(i18n.language);
            return rows as unknown as AgencyArticle[];
        },
    });
    return { news: query.data ?? [], loading: query.isLoading };
}
