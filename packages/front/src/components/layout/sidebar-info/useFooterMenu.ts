import { useQuery, keepPreviousData } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import type { MenuItem } from '../sidebar/useSidebarMenuData';

export type FooterItem = Pick<MenuItem, 'page_slug' | 'menu_label'>;

const NO_ITEMS: FooterItem[] = [];

export const footerMenuQueryKey = (lang: string) => ['footer_menu', lang] as const;

/**
 * Voci del menu footer (About, Contact, Terms...) nella lingua corrente, per il
 * pannello "Information" delle info-page. Era `useEffect + useState + cancelled` dentro
 * SidebarMenu (CLAUDE.md #17). Al cambio lingua resta la lista precedente finche' arriva la nuova.
 */
export function useFooterMenu(lang: string) {
  const query = useQuery({
    queryKey: footerMenuQueryKey(lang),
    // Righe non tipizzate dal service: stesso cast dei due lettori di sidebar.
    queryFn: async () => (await contentService.getFooterItems(lang)) as unknown as FooterItem[],
    placeholderData: keepPreviousData,
  });
  return { footerItems: query.data ?? NO_ITEMS };
}
