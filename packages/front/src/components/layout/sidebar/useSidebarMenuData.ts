/**
 * Menu della sidebar (desktop + mobile) da site_metadata: fetch con retry/backoff.
 * Era copiato identico in Sidebar.tsx e SidebarMobile.tsx (#16 split monstre): ora una sola
 * implementazione, comportamento invariato (stessi tentativi, stesso "mai svuotare un menu buono").
 */
import { useEffect, useRef, useState } from 'react';
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

/**
 * @param lang      lingua corrente: al cambio il menu si ricarica dal sidecar
 * @param reloadKey chiave extra che forza il ricaricamento (desktop: ruolo utente)
 * @param logLabel  etichetta del console.error (invariata rispetto ai due file di origine)
 */
export function useSidebarMenuData(lang: string, reloadKey = '', logLabel = 'Menu error') {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [footerItems, setFooterItems] = useState<MenuItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // L'etichetta serve solo al log: in un ref, cosi' non e' mai una dipendenza del fetch.
  const logLabelRef = useRef(logLabel);
  logLabelRef.current = logLabel;

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    const loadMenu = async () => {
      if (cancelled) return;
      try {
        const [items, footer] = await Promise.all([
          contentService.getMenuItems('site_metadata', lang),
          contentService.getFooterItems(lang),
        ]);
        if (cancelled) return;

        // Never blank a good menu with an empty result: an empty fetch here is
        // almost always a transient race (Sidebar mounts before the Supabase
        // session is restored → RLS yields 0 rows). Keep prior items and retry
        // with backoff so the menu fills in WITHOUT needing a manual refresh.
        if (items && items.length > 0) {
          // contentService ritorna righe non tipizzate (Record<string, unknown>): il doppio
          // passaggio via unknown e' l'unico cast lecito finche' il service non e' tipizzato (P6 audit 2026-08).
          setMenuItems(items as unknown as MenuItem[]);
          setIsLoaded(true);
        } else if (attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setTimeout(loadMenu, 400 * attempts);
          return;
        }
        if (footer && footer.length > 0) setFooterItems(footer as unknown as MenuItem[]);
      } catch (error) {
        console.error(logLabelRef.current, error);
        if (!cancelled && attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setTimeout(loadMenu, 400 * attempts);
        }
      }
    };

    loadMenu();
    return () => { cancelled = true; };
  // `lang` nelle deps: al cambio lingua il menu si ricarica dal sidecar.
  }, [lang, reloadKey]);

  return { menuItems, footerItems, isLoaded };
}
