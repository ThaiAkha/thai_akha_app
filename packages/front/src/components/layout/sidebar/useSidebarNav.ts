/**
 * Sidebar (desktop) - stato di navigazione: menu dal DB (fetch condiviso con SidebarMobile),
 * filtro per ruolo, albero parent/children, reveal a cascata, parent auto-espanso.
 * Estratto da Sidebar.tsx (#16 split monstre) a comportamento invariato.
 */
import { useEffect, useMemo, useState } from 'react';
import type { UserProfile } from '../../../services/auth.service';
import { useSidebarMenuData, type MenuItem } from './useSidebarMenuData';

export type { MenuItem };

export function useSidebarNav(currentPage: string, userProfile: UserProfile | null | undefined, lang: string) {
  // Il menu si ricarica anche al cambio ruolo (login/logout), non solo di lingua.
  const { menuItems, footerItems, isLoaded } = useSidebarMenuData(lang, userProfile?.role ?? '', 'Menu error');
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  const visibleItems = useMemo(() =>
    menuItems.filter(item => {
      const authSlugs = ['auth', 'login', 'logout', 'register', 'sign-in', 'sign-up'];
      if (authSlugs.includes(item.page_slug.toLowerCase())) return false;
      if (item.page_slug?.toLowerCase().includes('student-hub') || item.page_slug?.toLowerCase() === 'hub') return false;
      if (item.page_slug?.toLowerCase() === 'user') return false;
      const level = item.access_level || 'public';
      if (level === 'admin') return false;
      if (level === 'agency') return userProfile?.role === 'agency';
      if (level === 'user') return !!userProfile && (userProfile.role as string) !== 'guest_virtual';
      return true;
    }), [menuItems, userProfile]);

  // Build children map keyed by parent id
  const childrenMap = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    visibleItems.forEach(item => {
      if (item.parent_id) {
        if (!map[item.parent_id]) map[item.parent_id] = [];
        map[item.parent_id].push(item);
      }
    });
    return map;
  }, [visibleItems]);

  const topLevelItems = useMemo(() =>
    visibleItems.filter(item => !item.parent_id),
    [visibleItems]);

  // Cascading reveal — staggered over the ACTUAL rendered list (topLevelItems),
  // so the reveal index lines up 1:1 with the map index in the render. Previously
  // the timers were keyed to `menuItems` indices (incl. filtered/child items),
  // which scheduled stray timers and required an O(n) indexOf lookup per row.
  useEffect(() => {
    if (!isLoaded || topLevelItems.length === 0) return;
    setVisibleIndices([]);
    const timers = topLevelItems.map((_, i) =>
      setTimeout(() => {
        setVisibleIndices(prev => [...prev, i]);
      }, 100 + i * 40)
    );
    return () => timers.forEach(clearTimeout);
  }, [isLoaded, topLevelItems]);

  // Auto-expand parent when current page is a child
  useEffect(() => {
    const parentItem = topLevelItems.find(item =>
      childrenMap[item.id]?.some(child => child.page_slug === currentPage)
    );
    if (parentItem) setExpandedParent(parentItem.id);
  }, [currentPage, topLevelItems, childrenMap]);

  return { footerItems, isLoaded, visibleIndices, expandedParent, setExpandedParent, childrenMap, topLevelItems };
}
