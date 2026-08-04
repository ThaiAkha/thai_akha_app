import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import type { LegalDocument, LegalDocumentSection } from '@thaiakha/shared/types';
import { Typography, Icon } from '../ui/index';
import Tabs, { TabItem } from '../ui/navigation/Tabs';
import { AkhaPixelPattern } from '../divider';
import { renderInline } from '../ui/inlineMarkdown';
import LegalFooterCard from './LegalFooterCard';
import { slugify } from '../blog';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface LegalTabGroup {
  value: string;
  label: string;
  icon?: string;
  /** Indices of sections from doc.sections[] to show in this tab */
  sectionIndices: number[];
}

interface LegalDocumentViewerProps {
  document: LegalDocument;
  tabGroups: LegalTabGroup[];
  /** Extra tabs rendered as placeholders (e.g. Cookies coming soon) */
  placeholderTabs?: Array<{ value: string; label: string; icon?: string; message: string }>;
  className?: string;
}

// ─────────────────────────────────────────────
// CONTENT RENDERER
// ─────────────────────────────────────────────

// Corpo SEMPRE in font normale (paragraphS): l'italic è riservato ai blocchi
// {type:'note'} dal DB (section.notes → variant 'caption').
const ContentBlock: React.FC<{
  content: string | string[];
  variant?: 'caption' | 'paragraphS';
  accent?: 'brand' | 'ocean';
}> = ({ content, variant = 'paragraphS', accent = 'brand' }) => {
  if (typeof content === 'string') {
    return (
      <Typography variant={variant} color="sub" className="leading-relaxed whitespace-pre-wrap">
        {renderInline(content, accent)}
      </Typography>
    );
  }
  return (
    <div className="flex flex-col [gap:var(--space-fluid-xs)]">
      {content.map((line, i) => {
        if (line === '') return <div key={i} className="h-2" />;
        const trimmed = line.trimStart();
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
        if (isBullet) {
          // Lista vera: marker ocean + rientro appeso (il testo che va a capo resta allineato).
          const body = trimmed.replace(/^[•-]\s*/, '');
          return (
            <div key={i} className="flex items-start [gap:var(--space-fluid-xs)]">
              {/* marker: dot tondo 5px, centrato sulla line-height reale della prima riga */}
              <span
                aria-hidden="true"
                className="shrink-0 inline-flex items-center [height:calc(var(--text-fluid-paragraphS)*1.625)]"
              >
                <span className={cn('w-[5px] h-[5px] rounded-full', accent === 'ocean' ? 'bg-ocean-blue' : 'bg-primary')} />
              </span>
              <Typography variant={variant} color="sub" className="leading-relaxed whitespace-pre-wrap flex-1 min-w-0">
                {renderInline(body, accent)}
              </Typography>
            </div>
          );
        }
        return (
          <Typography key={i} variant={variant} color="sub" className="leading-relaxed whitespace-pre-wrap">
            {renderInline(line, accent)}
          </Typography>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// SINGLE SECTION BLOCK
// ─────────────────────────────────────────────

export const SectionBlock: React.FC<{ section: LegalDocumentSection; index: number; accent?: 'brand' | 'ocean' }> = ({
  section,
  index,
  accent = 'brand',
}) => {
  const dividerTheme = accent === 'ocean' ? 'block_faq' : 'akha';
  const hasBody = Boolean(section.content) || Boolean(section.subsections?.length) || Boolean(section.notes?.length);
  return (
    <div
      id={section.anchor ?? slugify(section.title)}
      className={cn(
        'flex items-stretch scroll-mt-24',
        'bg-surface/40 dark:bg-white/[0.02] border border-border/50 dark:border-white/[0.06]',
        'rounded-2xl backdrop-blur-sm overflow-hidden',
        'transition-all duration-300',
      )}
    >
      {/* Number rail — flush a sinistra/sopra/sotto (0 padding), numero centrato Roboto */}
      <div
        className={cn(
          'shrink-0 w-10 flex items-center justify-center',
          accent === 'ocean'
            ? 'bg-gradient-to-b from-ocean-blue/15 to-transparent'
            : 'bg-gradient-to-b from-primary/15 to-transparent',
        )}
      >
        <span
          className={cn(
            'font-accent font-bold text-lg leading-none',
            accent === 'ocean' ? 'text-ocean-blue' : 'text-primary',
          )}
        >
          {index + 1}
        </span>
      </div>

      {/* Colonna contenuto — padding solo qui (rail flush) */}
      <div className="flex-1 min-w-0 flex flex-col [gap:var(--space-fluid-s)] [padding:var(--space-fluid-m)]">
          {/* Titolo + divider raggruppati con gap ridotto (2xs — visibile a ogni viewport) */}
          <div className="flex flex-col [gap:var(--space-fluid-2xs)]">
            {/* Titolo card: Roboto Condensed come header sidebar (22px), kerning +1 step (normal) */}
            <Typography variant="h5" color="title" className="tracking-normal" style={{ fontFamily: 'var(--font-accent)', fontSize: '1.375rem' }}>
              {section.title}
            </Typography>

            {/* Divider Akha a tema — linea tra titolo e descrizione */}
            {hasBody && (
              <div className="overflow-hidden">
                <AkhaPixelPattern variant="line_divider" size={6} opacity={0.9} theme={dividerTheme} animateInView />
              </div>
            )}
          </div>

          {/* Main Content (paragraphS) */}
          {section.content && <ContentBlock content={section.content} variant="paragraphS" accent={accent} />}

          {/* Subsections — corpo in font normale (paragraphS), come il main content */}
          {section.subsections && section.subsections.length > 0 && (
            <div className="flex flex-col [gap:var(--space-fluid-s)]">
              {section.subsections.map((sub, si) => (
                <div
                  key={si}
                  className="flex flex-col [gap:var(--space-fluid-2xs)] [padding-left:var(--space-fluid-s)]"
                >
                  <Typography variant="caption" color="sub" className="font-semibold not-italic">
                    {sub.title}
                  </Typography>
                  <ContentBlock content={sub.content} variant="paragraphS" accent={accent} />
                </div>
              ))}
            </div>
          )}

          {/* Note (type:'note' dal DB) — UNICO contenuto in corsivo (caption) */}
          {section.notes && section.notes.length > 0 && (
            <div className="flex flex-col [gap:var(--space-fluid-2xs)]">
              {section.notes.map((note, ni) => (
                <Typography key={ni} variant="caption" color="sub" className="leading-relaxed whitespace-pre-wrap">
                  {renderInline(note, accent)}
                </Typography>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};

// ─────────────────────────────────────────────
// DOCUMENT VIEWER
// ─────────────────────────────────────────────

const LegalDocumentViewer: React.FC<LegalDocumentViewerProps> = ({
  document: doc,
  tabGroups,
  placeholderTabs = [],
  className,
}) => {
  const [activeTab, setActiveTab] = useState(tabGroups[0]?.value ?? '');
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll content area to top on tab change
  useEffect(() => {
    if (contentRef.current) {
      const scrollContainer = contentRef.current.closest('#main-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeTab]);

  // Build TabItems for the Tabs component
  const allTabItems: TabItem[] = [
    ...tabGroups.map(g => ({ value: g.value, label: g.label, icon: g.icon })),
    ...placeholderTabs.map(p => ({ value: p.value, label: p.label, icon: p.icon })),
  ];

  // Active group content
  const activePlaceholder = placeholderTabs.find(p => p.value === activeTab);
  const activeGroup = tabGroups.find(g => g.value === activeTab);
  const activeSections =
    activeGroup?.sectionIndices
      .map(i => doc.sections[i])
      .filter(Boolean) ?? [];

  return (
    <div className={cn('flex flex-col w-full', className)}>

      {/* Meta Banner */}
      <div className="flex flex-wrap items-center justify-between [gap:var(--space-fluid-xs)] [padding-block:var(--space-fluid-s)] [padding-inline:var(--space-fluid-m)] bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-2xl [margin-bottom:var(--space-fluid-m)]">
        <div className="flex items-center [gap:var(--space-fluid-xs)]">
          <Icon name="info" size="xs" className="text-primary/60" />
          <Typography variant="caption" color="muted">
            Version {doc.version}
          </Typography>
          <span className="text-border">·</span>
          <Typography variant="caption" color="muted">
            Effective: {new Date(doc.effectiveDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </div>
        <div className="flex items-center [gap:var(--space-fluid-2xs)]">
          <Icon name="check_circle" size="xs" className="text-action" />
          <Typography variant="caption" color="muted">
            Last updated: {new Date(doc.lastUpdated).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="[margin-bottom:var(--space-fluid-m)] w-full overflow-hidden">
        <Tabs
          items={allTabItems}
          value={activeTab}
          onChange={setActiveTab}
          variant="pills"
          containerClass="justify-start md:justify-center"
        />
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex flex-col [gap:var(--space-fluid-s)]">
        {activePlaceholder ? (
          <div className="flex flex-col items-center justify-center py-24 text-center [gap:var(--space-fluid-m)]">
            <div className="w-16 h-16 rounded-full bg-border/20 flex items-center justify-center">
              <Icon name="construction" size="lg" className="text-muted" />
            </div>
            <div className="flex flex-col [gap:var(--space-fluid-2xs)]">
              <Typography variant="h5" color="sub">{activePlaceholder.message}</Typography>
              <Typography variant="paragraphS" color="muted">
                This section will be available soon.
              </Typography>
            </div>
          </div>
        ) : (
          activeSections.map((section, i) => (
            <SectionBlock key={`${activeTab}-${i}`} section={section} index={i} />
          ))
        )}
      </div>

      {/* Footer — entità legale dentro card coerente con la MetaBanner */}
      <LegalFooterCard className="[margin-top:var(--space-fluid-l)]" />
    </div>
  );
};

export default LegalDocumentViewer;
