import React, { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { FaqCardUI } from '@thaiakha/shared';
import { getPageFaqs, getEntityFaqs } from '../../services/infoPages.service';
import { useMediaAsset } from '../../hooks/useMediaAsset';
import { Typography, Card } from '../ui/index';
import { AkhaPixelPattern, AkhaPixelLine } from '../divider';
import { SmartHeaderSection } from '../layout/SmartHeaderSection';
import { CherryEntryCard } from '../chat/CherryEntryCard';

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
  /** Legacy bridge: embedded jsonb items — usati SOLO come fallback se la
   *  centrale non risponde (rimosso a fine migrazione, deploy #2). */
  items?: FaqItem[];
  /** Modalità ENTITÀ (recipe | news | culture | ingredient | category):
   *  con entityType, `slug` = entity_slug e le FAQ arrivano dalla centrale
   *  faq_questions via getEntityFaqs (avatar inclusi). */
  entityType?: string;
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg';
}

// ─── FAQ card — avatar risolto da avatar_asset_id via media_assets (frozen) ─────
// Deterministico: nessun Math.random. L'avatar arriva dal DB (getPageFaqs) o è
// assente per le pagine non ancora migrate (fallback legacy site_metadata.faq).
const FaqCard: React.FC<{ card: FaqCardUI }> = ({ card }) => {
  const { asset } = useMediaAsset({ assetId: card.avatarAssetId });
  const avatarUrl = asset?.image_url ?? '';

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
        <AkhaPixelPattern variant="line_divider" size={6} opacity={0.9} theme="block_faq" animateInView />
      </div>

      {/* ── Answer ──────────────────────────────────────────────── */}
      <div className="flex-1" style={{ padding: 'var(--space-fluid-m)' }}>
        <div
          className="leading-relaxed [font-size:var(--text-fluid-paragraphM)] font-sans text-muted [&_b]:font-bold [&_strong]:font-bold [&_em]:italic [&_i]:italic [&_a]:font-bold [&_a]:text-ocean-blue [&_a]:no-underline hover:[&_a]:opacity-75 [&_a]:transition-opacity"
          dangerouslySetInnerHTML={{ __html: card.answerHtml }}
        />
      </div>
    </Card>
  );
};

// ─── Module-level fetch cache ─────────────────────────────────────────────────
// In modalità slug recuperiamo da site_metadata sia le FAQ sia l'entry-point Cherry
// (prompt/response/button_ids) in un'unica query. La card Cherry viene mostrata in
// cima al blocco FAQ. NB: i single (culture/news) passano `items` → niente fetch
// cherry qui (la loro card è montata separatamente dalla riga di contenuto).

interface PageCherry { prompt?: string | null; response?: string | null; buttonIds?: string[] | null; }

const _faqCache = new Map<string, FaqItem[]>();
const _cherryCache = new Map<string, PageCherry>();
const _cardsCache = new Map<string, FaqCardUI[]>();

/** Legacy site_metadata.faq item → FaqCardUI (nessun avatar: pagina non migrata). */
const legacyToCard = (f: FaqItem): FaqCardUI => ({ name: f.name, answerHtml: f.acceptedAnswer.text });

async function fetchPageData(slug: string): Promise<{ faq: FaqItem[]; cherry: PageCherry }> {
  if (_faqCache.has(slug) && _cherryCache.has(slug)) {
    return { faq: _faqCache.get(slug)!, cherry: _cherryCache.get(slug)! };
  }
  const { data, error } = await supabase
    .from('site_metadata')
    .select('faq, cherry_prompt, cherry_response, cherry_button_ids')
    .eq('page_slug', slug)
    .maybeSingle();
  if (error || !data) {
    _faqCache.set(slug, []); _cherryCache.set(slug, {});
    return { faq: [], cherry: {} };
  }
  const faq = ((data.faq as unknown as FaqItem[]) ?? []).filter(f => f?.name && f?.acceptedAnswer?.text);
  const cherry: PageCherry = {
    prompt: (data as Record<string, unknown>).cherry_prompt as string | null,
    response: (data as Record<string, unknown>).cherry_response as string | null,
    buttonIds: (data as Record<string, unknown>).cherry_button_ids as string[] | null,
  };
  _faqCache.set(slug, faq); _cherryCache.set(slug, cherry);
  return { faq, cherry };
}



// ─── Component ────────────────────────────────────────────────────────────────

const FaqBottomPage: React.FC<FaqBottomPageProps> = ({
  slug,
  className,
  hideTopDivider = false,
  items: itemsProp,
  entityType,
}) => {
  const slugKey = slug ?? '';
  // Cache key distinta per modalità entità (stesso slug possibile su tabelle diverse).
  const cacheKey = entityType ? `${entityType}:${slugKey}` : slugKey;

  // Card model unificato (FaqCardUI). Sorgenti in ordine:
  // 1. entityType → centrale faq_questions (entity_type+entity_slug, avatar frozen);
  // 2. slug (pagina) → site_metadata.faq_refs → centrale;
  // 3. fallback legacy embedded (items o site_metadata.faq) finché la migrazione
  //    non è verificata live (deploy #2 li rimuove).
  const [cards, setCards] = useState<FaqCardUI[]>(() => {
    if (_cardsCache.has(cacheKey)) return _cardsCache.get(cacheKey)!;
    if (itemsProp && !entityType) return itemsProp.filter(f => f?.name && f?.acceptedAnswer?.text).map(legacyToCard);
    return [];
  });
  // Entry-point Cherry: solo in modalità slug-pagina (entità e items → null:
  // i single montano la propria card Cherry separatamente).
  const [cherry, setCherry] = useState<PageCherry | null>(() =>
    itemsProp || entityType ? null : (_cherryCache.get(slugKey) ?? null),
  );
  const [loading, setLoading] = useState(!_cardsCache.has(cacheKey) && (!!entityType || !itemsProp));

  useEffect(() => {
    if (_cardsCache.has(cacheKey)) {
      setCards(_cardsCache.get(cacheKey)!);
      setCherry(entityType || itemsProp ? null : (_cherryCache.get(slugKey) ?? null));
      setLoading(false);
      return;
    }
    let cancelled = false;

    // ── Modalità ENTITÀ: centrale via entity_type+entity_slug ──
    if (entityType && slugKey) {
      setLoading(true);
      getEntityFaqs(entityType, slugKey).then(entity => {
        // Bridge transizione: centrale vuota → embedded items (se forniti).
        const resolved: FaqCardUI[] = entity.length > 0
          ? entity
          : (itemsProp ?? []).filter(f => f?.name && f?.acceptedAnswer?.text).map(legacyToCard);
        _cardsCache.set(cacheKey, resolved);
        if (!cancelled) { setCards(resolved); setCherry(null); setLoading(false); }
      });
      return () => { cancelled = true; };
    }

    // ── Modalità items pura (legacy, senza entityType) ──
    if (itemsProp !== undefined) {
      setCards(itemsProp.filter(f => f?.name && f?.acceptedAnswer?.text).map(legacyToCard));
      setCherry(null);
      setLoading(false);
      return;
    }

    // ── Modalità slug-pagina: refs → centrale, fallback embedded ──
    setLoading(true);
    Promise.all([fetchPageData(slugKey), getPageFaqs(slugKey)]).then(([{ faq, cherry: c }, entity]) => {
      // Migrata → entity rows (con avatar); non migrata → fallback legacy JSONB (no avatar).
      const resolved: FaqCardUI[] = entity.length > 0 ? entity : faq.map(legacyToCard);
      _cardsCache.set(cacheKey, resolved);
      if (!cancelled) { setCards(resolved); setCherry(c); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [cacheKey, slugKey, itemsProp, entityType]);

  const hasCherry = !!(cherry && (cherry.prompt || cherry.response));
  if (!loading && cards.length === 0 && !hasCherry) return null;

  return (
    <div className={className}>

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
            <FaqCard key={idx} card={card} />
          ))}
        </div>
      )}
      </>)}

    </div>
  );
};

export default FaqBottomPage;
