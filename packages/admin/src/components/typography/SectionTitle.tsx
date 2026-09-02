import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

type SectionTitleTag = 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
/** `body` = titolo pieno · `sub` = piu' tenue, per sidebar e sotto-sezioni. Entrambi AA. */
type SectionTitleTone = 'body' | 'sub';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  /** Tag semantico. Default `p`; usare `hN` quando il titolo struttura la pagina. */
  as?: SectionTitleTag;
  tone?: SectionTitleTone;
}

const TONE: Record<SectionTitleTone, string> = {
  body: 'text-body',
  sub: 'text-sub',
};

/**
 * Titolo di sezione standard (card, gruppi di form, inspector): "Pax Count",
 * "Logistics & Notes", ecc. E' l'UNICA implementazione: il vecchio guscio
 * `ui/SectionHeader` e' stato assorbito qui il 2026-09-02 (#114); le etichette
 * di form (ex variante `formfield`) stanno su `form/Label`, non qui.
 *
 * Taglia `text-sm`: lo standard ADMIN_PLANNER_UX fissa il floor a 14px e VIETA
 * `text-xs` per i titoli di sezione. Fino al 2026-08-28 questo componente era a
 * `text-xs`, in contraddizione con lo standard che doveva applicare. Un className
 * con `text-xs` passato dal chiamante vincerebbe per tailwind-merge: non farlo.
 */
const SectionTitle: React.FC<SectionTitleProps> = ({ children, className, as: Tag = 'p', tone = 'body' }) => (
  <Tag className={cn('text-sm font-black uppercase tracking-widest mb-3', TONE[tone], className)}>
    {children}
  </Tag>
);

export default SectionTitle;
