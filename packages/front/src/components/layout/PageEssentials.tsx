import React from 'react';
import type { EssentialsData } from '@thaiakha/shared/types';
import { useSiteMetadata } from '../../hooks/useSiteMetadata';
import { Typography, Icon, Card } from '../ui';
import AkhaPixelPattern from '../divider/AkhaPixelPattern';
import AkhaThemedLine from '../divider/AkhaThemedLine';
import { SmartHeaderSection } from './SmartHeaderSection';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../i18n';
import { renderInline } from '../ui/inlineMarkdown';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageEssentialsProps {
  /** Fetch page_essentials from site_metadata by slug (unless data is provided) */
  slug?: string;
  /** Pass data directly — bypasses the DB fetch (same pattern as FaqBottomPage) */
  data?: EssentialsData;
  className?: string;
  hideTopDivider?: boolean;
  /** Accento per mondo: 'brand' (default) | 'ocean' (pagine info a tema FAQ). */
  accent?: 'brand' | 'ocean';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// "Jan 1, 2026" — stesso formato usato ovunque per le date pagina.
function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ icon: string; label: string; className?: string }> = ({ icon, label, className }) => (
  <div className={cn("flex flex-col [gap:var(--space-fluid-xs)]", className)}>
    <div className="flex items-center [gap:var(--space-fluid-xs)]">
      <Icon name={icon} size="md" className="text-action" />
      {/* as="h3": keeps h6 visual size, emits semantic <h3> (under section H2).
          Fixes D04 H2→H6 heading-level skip. */}
      <Typography variant="h6" as="h3" color="title" className="uppercase tracking-widest">
        {label}
      </Typography>
    </div>
    {/* Consistent divider for all cards */}
    <AkhaPixelPattern
      variant="line_simple_medium"
      size={6}
      opacity={0.6}
    />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const PageEssentials: React.FC<PageEssentialsProps> = ({
  slug,
  data: dataProp,
  className,
  hideTopDivider = false,
  accent = 'brand',
}) => {
  const isOcean = accent === 'ocean';
  // Ocean: divider block_faq + rimappa i token accent (primary/action) → ocean
  // sull'intero sottoalbero (tutte le classi -action/-primary diventano ocean).
  const oceanVars = isOcean ? '[--color-action:var(--color-ocean-blue)] [--color-primary:var(--color-deep-ocean)]' : '';
  const dividerTheme = isOcean ? 'block_faq' : 'akha';
  // Data layer (#86): page_essentials + date pagina dalla riga site_metadata
  // condivisa (useSiteMetadata: una query per slug, per tutti i consumer).
  // `data` esplicito bypassa il fetch (stesso pattern di FaqBottomPage).
  const fetchMode = dataProp === undefined && !!slug;
  // Le date si leggono dallo slug anche quando `data` e' passato (contratto invariato).
  const { extras, loading: extrasLoading } = useSiteMetadata(slug);
  const data: EssentialsData = dataProp ?? ((extras?.essentials as EssentialsData | null) ?? {});
  const loading = fetchMode && extrasLoading;
  // Date pagina — da site_metadata.date_published/date_modified (colonne dedicate,
  // fonte unica per TUTTE le pagine): rese come righe in coda ai Key Facts.
  const dates = slug ? (extras?.dates ?? null) : null;

  const hasFacts = data.facts && data.facts.length > 0;
  const hasRefs = data.references && data.references.length > 0;
  // About AI card: ai_note è la copy primaria; author_note resta come fallback legacy
  const aboutAiText = data.ai_note || data.author_note;
  const hasAuthor = !!aboutAiText;
  const hasContent = hasFacts || hasRefs || hasAuthor;

  if (!loading && !hasContent) return null;

  return (
    <div className={cn(oceanVars, className)}>
      {/* ── Top divider ─────────────────────────────────────────────────── */}
      {!hideTopDivider && (
        <div className="[margin-bottom:var(--space-fluid-xl)]">
          <AkhaThemedLine theme={dividerTheme} />
        </div>
      )}

      {/* ── Title ─────────────────────────────────────────────────────── */}
      <div className="[margin-bottom:var(--space-fluid-m)]">
        <SmartHeaderSection
          sectionId="universal_essentials"
          variant="section"
          align="center"
          hideDescription
        />
      </div>

      {/* ── Content grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] [gap:var(--space-fluid-m)]">
          {[1, 2].map(i => (
            <div key={i} className="rounded-[2rem] overflow-hidden border border-action/15 animate-pulse">
              <div className="h-48 bg-white/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(
          'grid grid-cols-1 [gap:var(--space-fluid-m)]',
          // 2 colonne: Key Facts | colonna destra impilata (References + About AI)
          hasFacts && (hasRefs || hasAuthor)
            ? 'md:grid-cols-[1fr_1fr]'
            : 'md:grid-cols-1',
        )}>

          {/* ── Key Facts ─────────────────────────────────────────────── */}
          {hasFacts && (
            <Card variant="glass" padding="md" rounded="2xl" className="flex flex-col [gap:var(--space-fluid-s)]">
              <SectionLabel icon="info" label={t('components:essentials.keyFacts')} />
              <div className="flex flex-col">
                {data.facts!.map((fact, idx) => (
                  <div key={idx}>
                    <div className="flex items-start justify-between [gap:var(--space-fluid-s)] [padding-block:var(--space-fluid-xs)]">
                      <Typography variant="microLabel" color="muted" className="uppercase tracking-wider shrink-0 w-28 [margin-top:2px]">
                        {fact.label}
                      </Typography>
                      <Typography variant="paragraphS" color="title" className="text-right flex-1 font-medium">
                        {fact.value}
                      </Typography>
                    </div>
                    {(idx < data.facts!.length - 1 || dates?.published || dates?.modified) && (
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border/90 to-transparent" />
                    )}
                  </div>
                ))}

                {/* Date pagina — da site_metadata (date_published/date_modified),
                    stesse righe label/value dei facts. Fonte unica per tutte le pagine. */}
                {dates?.published && (
                  <div>
                    <div className="flex items-start justify-between [gap:var(--space-fluid-s)] [padding-block:var(--space-fluid-xs)]">
                      <Typography variant="microLabel" color="muted" className="uppercase tracking-wider shrink-0 w-28 [margin-top:2px]">
                        {t('components:essentials.published')}
                      </Typography>
                      <Typography variant="paragraphS" color="title" className="text-right flex-1 font-medium">
                        {formatDate(dates.published)}
                      </Typography>
                    </div>
                    {dates.modified && (
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border/90 to-transparent" />
                    )}
                  </div>
                )}
                {dates?.modified && (
                  <div className="flex items-start justify-between [gap:var(--space-fluid-s)] [padding-block:var(--space-fluid-xs)]">
                    <Typography variant="microLabel" color="muted" className="uppercase tracking-wider shrink-0 w-28 [margin-top:2px]">
                      {t('components:essentials.updated')}
                    </Typography>
                    <Typography variant="paragraphS" color="title" className="text-right flex-1 font-medium">
                      {formatDate(dates.modified)}
                    </Typography>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ── Colonna destra: References sopra + About AI sotto ──────── */}
          {(hasRefs || hasAuthor) && (
            <div className="flex flex-col [gap:var(--space-fluid-m)]">

              {/* ── References ──────────────────────────────────────────── */}
              {hasRefs && (
                <Card variant="glass" padding="md" rounded="2xl" className="flex flex-col">
                  <SectionLabel icon="link" label={t('components:essentials.references')} className="[margin-bottom:var(--space-fluid-m)]" />
                  <div className="flex flex-col [gap:var(--space-fluid-xs)]">
                    {data.references!.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center [gap:var(--space-fluid-2xs)] pointer-coarse:min-h-11',
                          'rounded-xl border border-border/20 bg-white/5',
                          '[padding:var(--space-fluid-2xs)_var(--space-fluid-xs)]',
                          'hover:border-action/40 hover:bg-action/5 transition-all duration-200',
                          'group',
                        )}
                      >
                        <Icon
                          name={ref.icon ?? 'open_in_new'}
                          size="sm"
                          className="text-action shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                        <Typography
                          variant="paragraphS"
                          className="text-action group-hover:text-action leading-tight line-clamp-2"
                        >
                          {ref.label}
                        </Typography>
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              {/* ── About AI — come l'AI supporta il servizio ──────────── */}
              {hasAuthor && (
                <Card variant="glass" padding="md" rounded="2xl" className="flex flex-col flex-1">
                  <SectionLabel icon="smart_toy" label={t('components:essentials.aboutAi')} className="[margin-bottom:var(--space-fluid-m)]" />

                  <div className="flex flex-col [gap:var(--space-fluid-xs)] flex-1">
                    {(aboutAiText || '').split('\n\n').map((para, i) => (
                      <Typography key={i} variant="paragraphS" color="sub" className="leading-relaxed">
                        {renderInline(para, accent)}
                      </Typography>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PageEssentials;
