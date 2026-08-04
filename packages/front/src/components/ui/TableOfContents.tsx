import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Typography } from './Typography';
import AkhaPixelPattern, { AkhaTheme } from '../divider/AkhaPixelPattern';
import { cn } from '@thaiakha/shared/lib/utils';

export interface TocItem {
  /** DOM id dell'ancora (heading/section). */
  id: string;
  label: string;
}

export type TocAccent = 'ocean' | 'sunset' | 'brand' | 'ingredients';

// Classi LETTERALI (JIT-safe): accento per mondo (attivo/hover/focus).
const ACCENT: Record<TocAccent, { text: string; border: string; hoverText: string; hoverBorder: string; ring: string }> = {
  ocean:  { text: 'text-ocean-blue', border: 'border-ocean-blue', hoverText: 'hover:text-ocean-blue', hoverBorder: 'hover:border-ocean-blue/40', ring: 'focus-visible:ring-ocean-blue/50' },
  sunset: { text: 'text-sunset-6',   border: 'border-sunset-6',   hoverText: 'hover:text-sunset-6',   hoverBorder: 'hover:border-sunset-6/40', ring: 'focus-visible:ring-sunset-6/50' },
  brand:  { text: 'text-primary',    border: 'border-primary',    hoverText: 'hover:text-primary',    hoverBorder: 'hover:border-primary/40', ring: 'focus-visible:ring-primary/50' },
  // Ingredients Pantry Set — accento Paprika (pantry-4, come 'ocean' usa ocean-blue).
  ingredients: { text: 'text-pantry-4', border: 'border-pantry-4', hoverText: 'hover:text-pantry-4', hoverBorder: 'hover:border-pantry-4/40', ring: 'focus-visible:ring-pantry-4/50' },
};

interface TableOfContentsProps {
  items: TocItem[];
  /** Titolo del blocco (es. "On this page" / "Contents"). */
  title?: string;
  /** Colore del divider Akha (per mondo): 'block_faq', 'history', 'akha'… */
  dividerTheme?: AkhaTheme;
  /** Accento link attivo/hover (per mondo). */
  accent?: TocAccent;
  /** Scroll-spy: evidenzia la sezione attualmente in vista (default true). */
  spy?: boolean;
  /** Numerazione automatica delle voci (1., 2., …) — coincide col rail delle sezioni. */
  numbered?: boolean;
  /** Mostra header (titolo + divider). false = solo lista (dentro una card che dà l'header). */
  showHeader?: boolean;
  /** Classe extra sul testo delle voci (es. 'font-accent' per la sidebar info-page). */
  labelClassName?: string;
  className?: string;
}

/**
 * TableOfContents — TOC unico e riusabile (FAQ, History single, …).
 * Titolo + divider Akha a tema + lista di ancore con scroll-spy.
 * Link `<a href="#id">` REALI (crawlabili) → abilitano gli anchor "jump to" in SERP.
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  title = 'On this page',
  dividerTheme = 'akha',
  accent = 'ocean',
  spy = true,
  numbered = false,
  showHeader = true,
  labelClassName,
  className,
}) => {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const a = ACCENT[accent];

  // ── Indicatore circolare mobile (solo numbered): un cerchio che scivola sul
  //    numero della sezione attiva. Misuriamo il centro della cella-numero attiva
  //    rispetto alla <ul> (offsetParent) → robusto anche con label multi-riga.
  const listRef = useRef<HTMLUListElement>(null);
  const cellRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [dotY, setDotY] = useState<number | null>(null);

  // Lock durante lo scroll da click: impedisce allo scroll-spy di riscrivere
  // activeId mentre lo smooth-scroll attraversa le sezioni intermedie (altrimenti
  // l'indicatore "rimbalza": va giù, torna su di uno, poi giù). Rilasciato quando
  // lo scroll si ferma (debounce), con safety-net se il target è già in vista.
  const clickLockRef = useRef(false);
  const scrollEndTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(scrollEndTimerRef.current), []);

  const measure = useCallback(() => {
    if (!numbered) return;
    const cell = activeId ? cellRefs.current.get(activeId) : null;
    if (cell) setDotY(cell.offsetTop + cell.offsetHeight / 2);
  }, [numbered, activeId]);

  useEffect(() => { measure(); }, [measure, items]);
  useEffect(() => {
    if (!numbered) return;
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [numbered, measure]);

  // Scroll-spy — sezione in vista (root = container di scroll dell'app, fallback viewport)
  useEffect(() => {
    if (!spy) return;
    const sections = items
      .map(t => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const root = document.getElementById('main-scroll-container');
    const io = new IntersectionObserver(
      (entries) => {
        if (clickLockRef.current) return; // durante lo scroll da click, non toccare activeId
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { root: root ?? null, rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    sections.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, [items, spy]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // 1) blocca lo spy e fissa subito l'attivo cliccato
    clickLockRef.current = true;
    setActiveId(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // 2) rilascia il lock quando lo scroll si ferma (debounce sul container)
    const scroller: HTMLElement | Window = document.getElementById('main-scroll-container') ?? window;
    const release = () => {
      clickLockRef.current = false;
      scroller.removeEventListener('scroll', onScroll);
      window.clearTimeout(scrollEndTimerRef.current);
    };
    const onScroll = () => {
      window.clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = window.setTimeout(release, 120);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    // safety-net: se il target è già in vista non parte alcuno scroll → rilascia comunque
    scrollEndTimerRef.current = window.setTimeout(release, 1200);
  };

  if (items.length === 0) return null;

  return (
    <nav aria-label={title} className={cn('flex flex-col [gap:var(--space-fluid-s)]', className)}>
      {showHeader && (
        <div className="flex flex-col [gap:var(--space-fluid-2xs)]">
          <Typography variant="microLabel" color="muted" className="uppercase tracking-widest font-black opacity-80">
            {title}
          </Typography>
          <AkhaPixelPattern variant="line_simple_medium" size={5} opacity={0.6} theme={dividerTheme} />
        </div>
      )}

      <ul ref={listRef} className={cn('relative flex flex-col [gap:2px]', !numbered && 'border-l border-border')}>
        {/* Cerchio mobile — bordo azzurro FAQ, scivola sul numero attivo */}
        {numbered && dotY !== null && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 size-[30px] rounded-full border-2 border-light-blue bg-light-blue/10 transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `translateY(calc(${dotY}px - 50%))` }}
          />
        )}
        {items.map((t, i) => {
          const active = spy && t.id === activeId;
          return (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                aria-current={active ? 'true' : undefined}
                onClick={(e) => { e.preventDefault(); scrollTo(t.id); }}
                className={cn(
                  'transition-colors duration-200 focus:outline-none focus-visible:ring-2 rounded-md', a.ring,
                  numbered
                    ? 'flex items-center [gap:var(--space-fluid-xs)] [padding-block:var(--space-fluid-2xs)]'
                    : 'block -ml-px border-l-2 rounded-r-md [padding-block:var(--space-fluid-2xs)] [padding-inline:var(--space-fluid-s)]',
                  active
                    ? cn(!numbered && a.border, a.text, 'font-semibold')
                    : cn(!numbered && 'border-transparent', 'text-muted', a.hoverText, !numbered && a.hoverBorder)
                )}
              >
                {numbered && (
                  <span
                    ref={(el) => { if (el) cellRefs.current.set(t.id, el); else cellRefs.current.delete(t.id); }}
                    aria-hidden="true"
                    className="relative z-[1] shrink-0 grid place-items-center size-[30px] tabular-nums font-accent font-bold [font-size:var(--text-fluid-paragraphS)]"
                  >
                    {i + 1}
                  </span>
                )}
                <Typography as="span" variant="paragraphS" color="inherit" className={labelClassName}>
                  {t.label}
                </Typography>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TableOfContents;
