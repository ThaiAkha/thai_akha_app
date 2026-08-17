import React from 'react';
import { Typography, Icon, SmartInput } from '../ui';
import { t } from '../../i18n';

/**
 * 🔎 FAQ SEARCH — barra ricerca + filtri categoria della pagina FAQ hub.
 *
 * Componente PRESENTAZIONALE e controllato: non possiede i dati né filtra.
 * La pagina (FAQPage) tiene lo stato e applica il filtro sulle FAQ già in memoria
 * (i ~65 hub caricati da getFaqData) → filtro istantaneo, nessuna chiamata di rete.
 *
 * Accento del mondo info/FAQ: ocean. Mobile-first: chip in scroll orizzontale
 * sotto sm, touch target >= 44px.
 */

export interface FaqSearchCategory {
  id: string;
  label: string;
  /** Quante FAQ restano visibili in questa categoria col filtro corrente */
  count: number;
}

export interface FaqSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  categories: FaqSearchCategory[];
  /** id delle categorie attive; vuoto = tutte */
  activeCategories: string[];
  onToggleCategory: (id: string) => void;
  onReset: () => void;
  shown: number;
  total: number;
  className?: string;
}

const FaqSearch: React.FC<FaqSearchProps> = ({
  query,
  onQueryChange,
  categories,
  activeCategories,
  onToggleCategory,
  onReset,
  shown,
  total,
  className,
}) => {
  const isFiltered = query.trim().length > 0 || activeCategories.length > 0;
  const allActive = activeCategories.length === 0;

  return (
    <div
      className={`rounded-[2rem] border border-ocean-blue/15 bg-surface shadow-theme-sm [padding:var(--space-fluid-m)] flex flex-col [gap:var(--space-fluid-s)] ${className ?? ''}`}
    >
      {/* ── Campo ricerca (+ clear) ─────────────────────────────────────── */}
      <div className="relative">
        <SmartInput
          id="faq-search"
          type="search"
          icon="search"
          label={t('faq:searchLabel')}
          placeholder={t('faq:searchPlaceholder')}
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          autoComplete="off"
          className={query ? 'pr-12' : undefined}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label={t('faq:searchClear')}
            className="absolute right-3 bottom-0 h-14 flex items-center justify-center size-11 text-muted hover:text-ocean-blue transition-colors"
          >
            <Icon name="close" size="sm" />
          </button>
        )}
      </div>

      {/* ── Chip categorie — scroll-x su mobile, wrap da sm ─────────────── */}
      <div
        role="group"
        aria-label={t('faq:filterAll')}
        className="flex sm:flex-wrap [gap:var(--space-fluid-2xs)] overflow-x-auto sm:overflow-visible -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* "All topics" = nessun filtro categoria */}
        <button
          type="button"
          onClick={onReset}
          aria-pressed={allActive}
          className={`shrink-0 min-h-11 rounded-2xl border [padding-inline:var(--space-fluid-s)] transition-colors ${
            allActive
              ? 'bg-ocean-blue border-ocean-blue text-inverse'
              : 'bg-surface border-border text-desc hover:border-ocean-blue/40 hover:text-ocean-blue'
          }`}
        >
          <Typography as="span" variant="caption" className={allActive ? 'text-inverse font-semibold' : 'font-semibold'}>
            {t('faq:filterAll')}
          </Typography>
        </button>

        {categories.map(cat => {
          const active = activeCategories.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggleCategory(cat.id)}
              aria-pressed={active}
              className={`shrink-0 min-h-11 rounded-2xl border [padding-inline:var(--space-fluid-s)] flex items-center [gap:var(--space-fluid-2xs)] transition-colors ${
                active
                  ? 'bg-ocean-blue border-ocean-blue text-inverse'
                  : 'bg-surface border-border text-desc hover:border-ocean-blue/40 hover:text-ocean-blue'
              }`}
            >
              <Typography as="span" variant="caption" className={active ? 'text-inverse font-semibold' : 'font-semibold'}>
                {cat.label}
              </Typography>
              <Typography as="span" variant="caption" className={active ? 'text-inverse/70' : 'text-muted'}>
                {cat.count}
              </Typography>
            </button>
          );
        })}
      </div>

      {/* ── Riga risultati (solo quando un filtro è attivo) ─────────────── */}
      {isFiltered && (
        <div className="flex items-center justify-between [gap:var(--space-fluid-s)]">
          <Typography variant="paragraphS" color="muted">
            {t('faq:resultsCount', { shown, total })}
          </Typography>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center [gap:var(--space-fluid-2xs)] min-h-11 text-ocean-blue hover:opacity-75 transition-opacity"
          >
            <Icon name="restart_alt" size="sm" />
            <Typography as="span" variant="caption" className="font-semibold">
              {t('faq:filterReset')}
            </Typography>
          </button>
        </div>
      )}
    </div>
  );
};

export default FaqSearch;
