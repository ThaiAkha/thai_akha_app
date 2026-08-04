import React, { useEffect, useState } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { Typography, Icon } from '../../ui';
import type { TocAccent } from '../../ui';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '@thaiakha/shared/lib/ui-strings';
import SidebarCard from './SidebarCard';

interface FooterItem {
  page_slug: string;
  menu_label: string;
}

interface SidebarMenuProps {
  /** Slug pagina corrente → evidenzia la voce. */
  currentSlug: string;
  onNavigate: (slug: string) => void;
  accent?: TocAccent;
  title?: string;
}

// Accento a riempimento (per mondo) — classi LETTERALI (JIT-safe).
const MENU_ACCENT: Record<TocAccent, { active: string; hover: string; ring: string }> = {
  ocean:  { active: 'bg-ocean-blue/10 text-ocean-blue', hover: 'hover:bg-ocean-blue/5 hover:text-ocean-blue', ring: 'focus-visible:ring-ocean-blue/50' },
  sunset: { active: 'bg-sunset-6/10 text-sunset-6',     hover: 'hover:bg-sunset-6/5 hover:text-sunset-6',     ring: 'focus-visible:ring-sunset-6/50' },
  brand:  { active: 'bg-primary/10 text-primary',       hover: 'hover:bg-primary/5 hover:text-primary',       ring: 'focus-visible:ring-primary/50' },
  ingredients: { active: 'bg-pantry-4/10 text-pantry-4', hover: 'hover:bg-pantry-4/5 hover:text-pantry-4',     ring: 'focus-visible:ring-pantry-4/50' },
};

/**
 * SidebarMenu — menu "Information" (pagine del menu footer: About, Contact, Terms…),
 * dentro SidebarCard (header + divider a tema, come il TOC). Base condivisa col TOC.
 */
export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  currentSlug,
  onNavigate,
  accent = 'ocean',
  title = t.components.sidebarInfo.menuTitle,
}) => {
  const [footer, setFooter] = useState<FooterItem[]>([]);
  const a = MENU_ACCENT[accent];

  useEffect(() => {
    let cancelled = false;
    contentService.getFooterItems().then((items: any[]) => {
      if (!cancelled && items?.length) setFooter(items as FooterItem[]);
    });
    return () => { cancelled = true; };
  }, []);

  if (footer.length === 0) return null;

  return (
    <SidebarCard title={title} icon="info" accent={accent}>
      <ul className="flex flex-col [gap:2px]">
        {footer.map(f => {
          const active = f.page_slug === currentSlug;
          return (
            <li key={f.page_slug}>
              <a
                href={`/${f.page_slug}`}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey) return; // nuova scheda nativa
                  e.preventDefault();
                  onNavigate(f.page_slug);
                }}
                className={cn(
                  'flex items-center [gap:var(--space-fluid-2xs)] rounded-xl transition-colors duration-200',
                  '[padding-block:var(--space-fluid-2xs)] [padding-inline:var(--space-fluid-s)]',
                  'focus:outline-none focus-visible:ring-2', a.ring,
                  active ? cn(a.active, 'font-bold') : cn('text-desc', a.hover)
                )}
              >
                <Icon name="chevron_right" size="sm" className="shrink-0 opacity-60" />
                <Typography as="span" variant="paragraphS" color="inherit" className="font-accent tracking-wide [font-size:var(--text-fluid-paragraphM)] leading-snug">{f.menu_label}</Typography>
              </a>
            </li>
          );
        })}
      </ul>
    </SidebarCard>
  );
};

export default SidebarMenu;
