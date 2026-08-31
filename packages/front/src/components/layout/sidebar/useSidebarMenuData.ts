/**
 * Menu della sidebar (desktop + mobile) da site_metadata.
 * Era copiato identico in Sidebar.tsx e SidebarMobile.tsx (#16 split monstre), poi un solo
 * useEffect con retry/backoff a mano. Ora una useQuery (CLAUDE.md #17) con la stessa
 * semantica: 3 tentativi a 400/800/1200 ms se il menu arriva vuoto, e "mai svuotare un
 * menu buono" al cambio lingua o ruolo (il precedente resta finche' arriva il nuovo).
 */
import { useRef } from 'react';
import { useQuery, keepPreviousData } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';

export interface MenuItem {
  id: string;
  page_slug: string;
  menu_label: string;
  header_icon: string;
  menu_order: number;
  access_level: 'public' | 'user' | 'admin' | 'agency';
  header_badge?: string;
  is_highlighted?: boolean;
  parent_id?: string | null;
}

const NO_ITEMS: MenuItem[] = [];
const MAX_RETRIES = 3;
/** Sentinella interna: un menu vuoto e' un errore "da ritentare", non da loggare. */
const EMPTY_MENU = 'sidebar-menu-empty';

export const sidebarMenuQueryKey = (lang: string, reloadKey: string) =>
  ['sidebar_menu', lang, reloadKey] as const;

/**
 * @param lang      lingua corrente: al cambio il menu si ricarica dal sidecar
 * @param reloadKey chiave extra che forza il ricaricamento (desktop: ruolo utente)
 * @param logLabel  etichetta del console.error (invariata rispetto ai due file di origine)
 */
export function useSidebarMenuData(lang: string, reloadKey = '', logLabel = 'Menu error') {
  // L'etichetta serve solo al log: in un ref, cosi' non entra nella chiave della query.
  const logLabelRef = useRef(logLabel);
  logLabelRef.current = logLabel;

  const query = useQuery({
    queryKey: sidebarMenuQueryKey(lang, reloadKey),
    queryFn: async () => {
      try {
        const [items, footer] = await Promise.all([
          contentService.getMenuItems('site_metadata', lang),
          contentService.getFooterItems(lang),
        ]);
        // Un menu vuoto qui e' quasi sempre una race transitoria (la Sidebar monta prima
        // che la sessione Supabase sia ripristinata → RLS restituisce 0 righe): si lancia,
        // cosi' TanStack ritenta col backoff di sotto e il menu si riempie da solo.
        if (!items || items.length === 0) throw new Error(EMPTY_MENU);
        // contentService ritorna righe non tipizzate (Record<string, unknown>): il doppio
        // passaggio via unknown e' l'unico cast lecito finche' il service non e' tipizzato (P6 audit 2026-08).
        return {
          menuItems: items as unknown as MenuItem[],
          footerItems: (footer ?? []) as unknown as MenuItem[],
        };
      } catch (error) {
        if (!(error instanceof Error && error.message === EMPTY_MENU)) {
          console.error(logLabelRef.current, error);
        }
        throw error;
      }
    },
    retry: MAX_RETRIES,
    retryDelay: (attempt) => 400 * (attempt + 1),
    placeholderData: keepPreviousData,
  });

  return {
    menuItems: query.data?.menuItems ?? NO_ITEMS,
    footerItems: query.data?.footerItems ?? NO_ITEMS,
    // Come prima: "caricato" = c'e' un menu da mostrare, anche quello precedente durante un cambio lingua.
    isLoaded: query.data !== undefined,
  };
}
