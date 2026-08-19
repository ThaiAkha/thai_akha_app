import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon, Typography, Badge } from '../ui/index';
import AkhaPixelPattern from '../divider/AkhaPixelPattern';
import { cn } from '@thaiakha/shared/lib/utils';

// ── Category metadata ─────────────────────────────────────────────────────
// Fallback order used when no categories prop is provided
const CATEGORY_ORDER_FALLBACK = ['appetizer', 'dessert', 'akha_specialty', 'curry', 'soup', 'stirfry'];

// ── Category type (from content_categories DB table) ──────────────────────
export interface RecipeCategoryInfo {
  id: string;
  title: string;
  title_highlight?: string | null;
  display_order?: number;
}

function normalizeCatKey(cat: string): string {
  const c = (cat || '').toLowerCase();
  if (c.includes('curry'))     return 'curry';
  if (c.includes('soup'))      return 'soup';
  if (c.includes('stir'))      return 'stirfry';
  if (c.includes('akha'))      return 'akha_specialty';
  if (c.includes('appetizer')) return 'appetizer';
  if (c.includes('dessert'))   return 'dessert';
  return cat;
}

// ── Pill button styles (mirrors Tabs variant="pills") ─────────────────────
const pillBase = 'relative z-10 flex items-center justify-center rounded-full transition-all duration-300 select-none cursor-pointer whitespace-nowrap';
// Icon buttons: equal padding on all sides + aspect-square = perfect circle
// Mobile: 2xs (compact, matches StickyTabNav mobile) | Desktop: same
const pillIcon = '[padding:var(--space-fluid-2xs)] aspect-square';
// Name pill: mobile compact (xs inline) | desktop standard (m inline) — block always 2xs
const pillName = '[padding-block:var(--space-fluid-2xs)] [padding-inline:var(--space-fluid-xs)] md:[padding-inline:var(--space-fluid-m)] flex-1';
const pillOff     = 'bg-white/30 dark:bg-white/5 text-sub border border-action/20 hover:bg-action/5 hover:text-primary dark:hover:text-white';
const pillOn      = 'bg-primary/10 text-primary dark:text-white border border-primary/30 font-bold';
const pillDead    = 'bg-white/10 dark:bg-white/5 text-muted/30 border border-border/20 cursor-not-allowed';
const pillClose   = `${pillOff} hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/30`;

// ── Types ─────────────────────────────────────────────────────────────────
export interface RecipeNavItem {
  id: string;
  name: string;
  slug?: string;
  category: string;
  subtitle?: string | null;
  cover?: { image_url?: string } | null;
}

interface RecipeNavProps {
  recipeName: string;
  currentRecipeId: string;
  allRecipes: RecipeNavItem[];
  previous: RecipeNavItem | null;
  next: RecipeNavItem | null;
  onClose: () => void;
  onNavigate: (slugOrId: string) => void;
  /** Categories from content_categories DB (domain='recipe'), sorted by display_order */
  categories?: RecipeCategoryInfo[];
  /** True while allRecipes is still loading in background — disables prev/next/panel */
  navLoading?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────
const RecipeNav: React.FC<RecipeNavProps> = ({
  recipeName,
  currentRecipeId,
  allRecipes,
  previous,
  next,
  onClose,
  onNavigate,
  categories,
  navLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const handleClose = () => setIsOpen(false);

  // Sentinel — detect sticky (same pattern as StickyTabNav)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) handleClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock body scroll while panel open
  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => { document.body.style.overflow = 'hidden'; });
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Dynamic category order from DB (sorted by display_order), fallback to static list
  const categoryOrder = useMemo(() => {
    if (categories?.length) {
      return [...categories]
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map(c => normalizeCatKey(c.id));
    }
    return CATEGORY_ORDER_FALLBACK;
  }, [categories]);

  // Dynamic label map: normalizedKey → { title, highlight } from DB
  const categoryLabelMap = useMemo<Record<string, { title: string; highlight: string }>>(() => {
    if (categories?.length) {
      return Object.fromEntries(
        categories.map(c => [
          normalizeCatKey(c.id),
          { title: c.title, highlight: c.title_highlight ?? '' },
        ])
      );
    }
    return {};
  }, [categories]);

  // Group recipes by normalized category key
  const groupedRecipes = useMemo(() => {
    const groups: Record<string, RecipeNavItem[]> = {};
    categoryOrder.forEach(c => { groups[c] = []; });
    allRecipes.forEach(r => {
      const key = normalizeCatKey(r.category);
      if (groups[key]) groups[key].push(r);
    });
    return groups;
  }, [allRecipes, categoryOrder]);

  const handleNavItem = (item: RecipeNavItem) => {
    onNavigate(item.slug || item.id);
    handleClose();
  };

  // ── Shared pill bar — identical markup for mobile & desktop ───────────
  //   Inner ring mirrors Tabs container: p-1 mobile (compact) → p-2 desktop (standard)
  const pillBar = (
    <div className="bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-1 md:p-2 rounded-full flex items-center [gap:var(--space-fluid-2xs)] md:[gap:var(--space-fluid-xs)] w-full">

      {/* CLOSE × */}
      <button
        onClick={onClose}
        aria-label="Back to recipes"
        title="Back to recipes"
        className={cn(pillBase, pillIcon, pillClose)}
      >
        <Icon name="close" size="xs" />
      </button>

      {/* ← PREV */}
      <button
        onClick={() => previous && !navLoading && handleNavItem(previous)}
        disabled={!previous || navLoading}
        aria-label={previous ? `Previous: ${previous.name}` : 'No previous'}
        title={previous?.name}
        className={cn(pillBase, pillIcon, previous && !navLoading ? pillOff : pillDead)}
      >
        <Icon name="chevron_left" size="xs" />
      </button>

      {/* CENTER — full recipe name, no truncation */}
      <button
        onClick={() => !navLoading && setIsOpen(v => !v)}
        className={cn(pillBase, pillName, isOpen ? pillOn : pillOff, 'text-center')}
      >
        <Typography
          variant="badge"
          color="inherit"
          className="leading-none font-bold uppercase"
        >
          {recipeName}
        </Typography>
      </button>

      {/* NEXT → */}
      <button
        onClick={() => next && !navLoading && handleNavItem(next)}
        disabled={!next || navLoading}
        aria-label={next ? `Next: ${next.name}` : 'No next'}
        title={next?.name}
        className={cn(pillBase, pillIcon, next && !navLoading ? pillOff : pillDead)}
      >
        <Icon name="chevron_right" size="xs" />
      </button>
    </div>
  );

  return (
    <>
      {/* Sentinel pixel (mobile only) */}
      <div
        ref={sentinelRef}
        className="h-px w-full absolute pointer-events-none md:hidden"
        style={{ top: '-1px' }}
      />

      {/* ── MOBILE — sticky top-0, no shadow ────────────────────────── */}
      <div className="md:hidden sticky top-0 z-[100] w-full flex flex-col items-center pointer-events-none">
        {/* Gradient overlay — fades in when stuck */}
        <div className={cn(
          'absolute inset-x-0 top-0 h-32 pointer-events-none transition-opacity duration-700',
          'bg-gradient-to-b from-surface via-surface/80 to-transparent dark:from-black dark:via-black/60',
          isSticky ? 'opacity-100' : 'opacity-0',
        )} />

        <div ref={navRef} className="relative z-10 w-full flex justify-center py-2 px-4 pointer-events-auto">
          {/* Outer ring — no shadow (matches desktop StickyTabNav style) */}
          <div className={cn(
            'bg-surface/80 dark:bg-black/60 backdrop-blur-2xl border border-white/10 p-1 rounded-full w-full max-w-sm transition-all duration-500',
            isSticky && 'scale-95',
          )}>
            {pillBar}
          </div>
        </div>

        {/* Mobile panel — fixed fullscreen below nav */}
        {isOpen && (
          <div className="fixed inset-x-3 top-[72px] z-[101] h-[calc(100dvh-80px)] pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300 origin-top">
            <RecipePanel
              allRecipes={allRecipes}
              groupedRecipes={groupedRecipes}
              categoryOrder={categoryOrder}
              categoryLabelMap={categoryLabelMap}
              currentRecipeId={currentRecipeId}
              onSelectItem={handleNavItem}
            />
          </div>
        )}
      </div>

      {/* ── DESKTOP — sticky top-[20px], same margin-bottom as StickyTabNav ── */}
      <div className="hidden md:flex sticky top-[20px] z-[100] w-full justify-center [margin-bottom:var(--space-fluid-l)] mb-8 px-2 pointer-events-none">
        <div ref={navRef} className="pointer-events-auto w-full max-w-2xl relative">
          {/* Outer ring — matches StickyTabNav desktop: bg-white/90 p-[2xs] rounded-full shadow-lg scale-110 */}
          <div className="bg-white/90 dark:bg-black/90 backdrop-blur-xl [padding:var(--space-fluid-2xs)] rounded-full shadow-lg md:scale-110 md:origin-top transition-transform">
            {pillBar}
          </div>

          {/* Desktop dropdown */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-3 z-40 animate-in fade-in slide-in-from-top-4 duration-300 origin-top">
              <RecipePanel
                allRecipes={allRecipes}
                groupedRecipes={groupedRecipes}
                categoryOrder={categoryOrder}
                categoryLabelMap={categoryLabelMap}
                currentRecipeId={currentRecipeId}
                onSelectItem={handleNavItem}
              />
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-[4px] cursor-pointer"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </>
  );
};

// ── Recipe panel ──────────────────────────────────────────────────────────
interface RecipePanelProps {
  allRecipes: RecipeNavItem[];
  groupedRecipes: Record<string, RecipeNavItem[]>;
  categoryOrder: string[];
  categoryLabelMap: Record<string, { title: string; highlight: string }>;
  currentRecipeId: string;
  onSelectItem: (item: RecipeNavItem) => void;
}

const RecipePanel: React.FC<RecipePanelProps> = ({
  groupedRecipes, currentRecipeId, allRecipes, categoryOrder, categoryLabelMap, onSelectItem,
}) => (
  <div className="bg-surface/90 backdrop-blur-3xl border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100dvh-100px)] md:max-h-[calc(100dvh-160px)]">
    {/* Panel header */}
    <div className="flex items-center justify-between [padding:var(--space-fluid-m)] border-b border-border/40 shrink-0">
      <Typography variant="h5" color="title" className="italic">All Recipes</Typography>
      <Badge variant="mineral">{allRecipes.length} recipes</Badge>
    </div>

    {/* Panel body */}
    <div className="flex-1 overflow-y-auto custom-scrollbar [padding:var(--space-fluid-m)] flex flex-col [gap:var(--space-fluid-l)]">
      {categoryOrder.map(catKey => {
        const catRecipes = groupedRecipes[catKey];
        if (!catRecipes?.length) return null;
        const label = categoryLabelMap[catKey];
        return (
          <div key={catKey} className="flex flex-col [gap:var(--space-fluid-s)]">

            {/* Category heading — line above, then title + title_highlight from DB */}
            <div className="flex flex-col items-center [gap:var(--space-fluid-2xs)]">
              <AkhaPixelPattern
                variant="line_divider"
                theme="kitchen"
                size={6}
                fill
                className="[padding-block:var(--space-fluid-xs)]"
              />
              <Typography
                variant="caption"
                color="muted"
                className="uppercase tracking-widest text-center leading-tight"
              >
                {label ? (
                  <>{label.title}{label.highlight && <> <span className="text-action">{label.highlight}</span></>}</>
                ) : catKey}
              </Typography>
            </div>

            {/* 2-column grid */}
            <div className="grid grid-cols-2 [gap:var(--space-fluid-xs)]">
              {catRecipes.map(item => {
                const isActive = item.id === currentRecipeId;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={cn(
                      // InfoCard horizontal pattern: full border-2, action on hover
                      'group relative flex flex-row items-stretch overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left cursor-pointer min-h-[64px]',
                      isActive
                        ? 'bg-action/10 border-action shadow-[0_4px_20px_-6px_rgba(var(--action-ch)/0.30)]'
                        : 'bg-surface border-border/40 hover:border-action hover:shadow-[0_6px_24px_-8px_rgba(var(--action-ch)/0.30)]',
                    )}
                  >
                    {/* Photo — full-bleed lateral, no padding (InfoCard style) */}
                    <div className="relative w-16 shrink-0 self-stretch overflow-hidden bg-surface-elevated">
                      {/* Flash overlay on hover */}
                      <div className="absolute inset-0 z-20 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-[0.10] pointer-events-none" />
                      {item.cover?.image_url ? (
                        <img
                          src={item.cover.image_url}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="restaurant" size="sm" className="text-muted/40" />
                        </div>
                      )}
                    </div>

                    {/* Title + Subtitle */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center [padding:var(--space-fluid-xs)] gap-0.5">
                      <Typography
                        variant="microLabel"
                        color={isActive ? 'action' : 'title'}
                        className="font-black uppercase truncate leading-tight group-hover:text-action transition-colors duration-300"
                      >
                        {item.name}
                      </Typography>
                      {item.subtitle && (
                        <Typography
                          variant="microLabel"
                          color="muted"
                          className="line-clamp-2 leading-tight opacity-70 normal-case font-normal"
                        >
                          {item.subtitle}
                        </Typography>
                      )}
                    </div>

                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default RecipeNav;
