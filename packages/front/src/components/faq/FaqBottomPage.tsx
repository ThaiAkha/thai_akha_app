import React, { useMemo } from 'react';
import type { FaqCardUI } from '@thaiakha/shared';
import { useQuery } from '@thaiakha/shared/query';
import { getFaqsByRefs, getEntityFaqs } from '../../services/infoPages.service';
import { useLanguage } from '../../context/LanguageContext';
import { useMediaAssets } from '../../hooks/useMediaAsset';
import { useSiteMetadata } from '../../hooks/useSiteMetadata';
import { Typography, Card } from '../ui/index';
import { AkhaPixelPattern, AkhaPixelLine } from '../divider';
import { SmartHeaderSection } from '../layout/SmartHeaderSection';
import { CherryEntryCard } from '../chat/CherryEntryCard';
import { handleFaqAnswerClick } from './faqLinkNav';
import { cn } from '@thaiakha/shared/lib/utils';
import { sanitizeHtml } from '../../lib/sanitizeHtml';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  name: string;
  acceptedAnswer: { text: string };
}

export interface FaqBottomPageProps {
  slug?: string;
  className?: string;
  onNavigate?: (page: string) => void;
  hideTopDivider?: boolean;
  /** SOLO demo/mock (ZZStyleCards): card iniettate senza lettura DB.
   *  Il vecchio fallback embedded è stato rimosso con la migrazione single-source
   *  (#58): la centrale faq_questions è l'unica fonte dati. */
  items?: FaqItem[];
  /** Modalità ENTITÀ (recipe | news | culture | ingredient | category):
   *  con entityType, `slug` = entity_slug e le FAQ arrivano dalla centrale
   *  faq_questions via getEntityFaqs (avatar inclusi). */
  entityType?: string;
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg';
}

// ─── FAQ card — avatar risolto da avatar_asset_id via media_assets (frozen) ─────
// Deterministico: nessun Math.random. L'avatar arriva dalla centrale faq_questions
// (getPageFaqs/getEntityFaqs); assente solo per gli items di demo/mock.
// L'avatar arriva gia' risolto dal padre (UNA query batch per tutte le card, non N singole).
const FaqCard: React.FC<{ card: FaqCardUI; avatarUrl: string; onNavigate?: (path: string) => void }> = ({ card, avatarUrl, onNavigate }) => {

  return (
    <Card variant="glass" padding="none" rounded="2xl" className="flex flex-col">
      {/* ── Question — avatar + text ──────────────────────────────── */}
      <div
        className="flex items-center"
        style={{ padding: 'var(--space-fluid-m)', gap: 'var(--space-fluid-m)' }}
      >
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-[88px] h-[88px] rounded-2xl object-cover shrink-0 ring-2 ring-ocean-blue/20"
          />
        )}
        <Typography variant="h4" as="h3" color="title" className="font-bold leading-snug flex-1">
          {card.name}
        </Typography>
      </div>

      {/* ── Inner divider ───────────────────────────────────────── */}
      <div className="overflow-hidden" style={{ margin: 'var(--space-fluid-xs) var(--space-fluid-m) 0' }}>
        <AkhaPixelPattern variant="line_divider" size={6} opacity={0.9} theme="block_faq" fill animateInView />
      </div>

      {/* ── Answer ──────────────────────────────────────────────── */}
      <div className="flex-1" style={{ padding: 'var(--space-fluid-m)' }}>
        {/* link interni nell'HTML → SPA navigation (click delegato, no full reload) */}
        <div
          onClick={(e) => handleFaqAnswerClick(e, onNavigate)}
          className="leading-relaxed [font-size:var(--text-fluid-paragraphM)] font-sans text-muted [&_b]:font-bold [&_strong]:font-bold [&_em]:italic [&_i]:italic [&_a]:font-bold [&_a]:text-ocean-blue [&_a]:no-underline hover:[&_a]:opacity-75 [&_a]:transition-opacity [&_a]:cursor-pointer"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.answerHtml) }}
        />
      </div>
    </Card>
  );
};

// ─── Data (TanStack, #86) ─────────────────────────────────────────────────────
// Modalità slug-pagina: entry-point Cherry (prompt/response/button_ids) e faq_refs
// arrivano dalla riga site_metadata condivisa (useSiteMetadata), le card dalla
// centrale faq_questions per refs. NB: i single (culture/news) passano `items` →
// niente Cherry qui (la loro card è montata separatamente dalla riga di contenuto).

interface PageCherry { prompt?: string | null; response?: string | null; buttonIds?: string[] | null; }

/** items espliciti (solo demo/mock, es. ZZStyleCards) → FaqCardUI. */
const legacyToCard = (f: FaqItem): FaqCardUI => ({ name: f.name, answerHtml: f.acceptedAnswer.text });

const NO_CARDS: FaqCardUI[] = [];

// ─── Component ────────────────────────────────────────────────────────────────

const FaqBottomPage: React.FC<FaqBottomPageProps> = ({
  slug,
  className,
  hideTopDivider = false,
  items: itemsProp,
  entityType,
  onNavigate,
}) => {
  const slugKey = slug ?? '';
  // Card model unificato (FaqCardUI). Fonte UNICA = centrale faq_questions:
  // 1. entityType → getEntityFaqs (entity_type+entity_slug);
  // 2. slug (pagina) → site_metadata.faq_refs (useSiteMetadata) → getFaqsByRefs;
  // 3. items espliciti → SOLO demo/mock (nessuna lettura embedded DB).
  const entityMode = !!entityType && slugKey.length > 0;
  const itemsMode = !entityMode && itemsProp !== undefined;
  const pageMode = !entityMode && !itemsMode && slugKey.length > 0;

  const { lang } = useLanguage();
  const { extras, loading: extrasLoading } = useSiteMetadata(slugKey, { enabled: pageMode });
  const refs = extras?.faqRefs ?? [];
  const refsKey = refs.join(',');

  const entityQuery = useQuery({
    queryKey: ['entity_faqs', lang, entityType ?? '', slugKey] as const,
    queryFn: () => getEntityFaqs(entityType!, slugKey, lang),
    enabled: entityMode,
  });
  const pageQuery = useQuery({
    queryKey: ['page_faqs', lang, refsKey] as const,
    queryFn: () => getFaqsByRefs(refsKey.split(','), lang),
    enabled: pageMode && refsKey.length > 0,
  });

  const itemCards = useMemo(
    () => (itemsMode ? (itemsProp ?? []).filter(f => f?.name && f?.acceptedAnswer?.text).map(legacyToCard) : NO_CARDS),
    [itemsMode, itemsProp],
  );
  const cards: FaqCardUI[] = entityMode
    ? (entityQuery.data ?? NO_CARDS)
    : pageMode
      ? (refsKey.length > 0 ? (pageQuery.data ?? NO_CARDS) : NO_CARDS)
      : itemCards;
  const cherry: PageCherry | null = pageMode ? (extras?.cherry ?? null) : null;
  const loading = entityMode
    ? entityQuery.isPending
    : pageMode
      ? (extrasLoading || (refsKey.length > 0 && pageQuery.isPending))
      : false;

  // Avatar delle card: una sola query batch (prima: una query per card, 8+ sulla home).
  const avatarIds = useMemo(() => cards.map(c => c.avatarAssetId).filter((id): id is string => !!id), [cards]);
  const { assets: avatarAssets } = useMediaAssets(avatarIds);

  const hasCherry = !!(cherry && (cherry.prompt || cherry.response));
  if (!loading && cards.length === 0 && !hasCherry) return null;

  return (
    // Self-sizing: closing-block tier, one step narrower than page content (--container-section)
    <div className={cn('w-full max-w-[var(--container-section)] mx-auto', className)}>

      {/* ── Ask Cherry entry card — subito prima del blocco FAQ ── */}
      {hasCherry && (
        <div className="[margin-bottom:var(--space-fluid-xl)]">
          <CherryEntryCard
            cherry_prompt={cherry!.prompt}
            cherry_response={cherry!.response}
            cherry_button_ids={cherry!.buttonIds}
          />
        </div>
      )}

      {(loading || cards.length > 0) && (<>
      {/* ── TOP DIVIDER ─────────────────────────────────────────────────── */}
      {!hideTopDivider && (
        <div className="w-full overflow-hidden [margin-bottom:var(--space-fluid-xl)]">
          <AkhaPixelLine geometry="flower" length="medium" theme="block_faq" size={10} opacity={0.9} animate />
        </div>
      )}

      {/* ── HEADER BLOCK ────────────────────────────────────────────────── */}
      <div className="[margin-bottom:var(--space-fluid-m)]">
        <SmartHeaderSection
          sectionId="universal_faq"
          variant="section"
          align="center"
          gradientFrom="ocean-blue"
          gradientTo="deep-ocean"
          dividerTheme="block_faq"
        />
      </div>

      {/* ── Cards ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-m)]">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="rounded-[2rem] overflow-hidden border border-ocean-blue/15 animate-pulse"
            >
              <div className="h-24 bg-white/5" />
              <div className="h-px" />
              <div className="h-20 bg-white/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-m)]">
          {cards.map((card, idx) => (
            <FaqCard key={idx} card={card} avatarUrl={card.avatarAssetId ? (avatarAssets[card.avatarAssetId]?.image_url ?? '') : ''} onNavigate={onNavigate} />
          ))}
        </div>
      )}
      </>)}

    </div>
  );
};

export default FaqBottomPage;
