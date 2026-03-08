import { useEffect, useState } from 'react';
import { contentService } from '../services/content.service';

/**
 * Hook per pagine che hanno bisogno di metadata locale
 * Carica metadata dal database e lo restituisce per uso nel rendering
 *
 * Esempio: AgencyHome usa metadata per popolare WelcomeHero component
 *
 * @param slug - Page slug (es. 'agency-home', 'agency-news')
 * @returns { pageMeta, loading } - metadata e loading state
 *
 * **Nota:** AppHeader gestisce automaticamente setPageHeader()
 * Questo hook serve SOLO per ottenere metadata per rendering locale
 */
export function usePageMetadata(slug: string) {
    const [pageMeta, setPageMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMetadata = async () => {
            setLoading(true);
            try {
                const meta = await contentService.getPageMetadata(slug);
                setPageMeta(meta);
            } catch (error) {
                console.error(`Failed to load metadata for ${slug}:`, error);
            } finally {
                setLoading(false);
            }
        };

        loadMetadata();
    }, [slug]);

    return { pageMeta, loading };
}
