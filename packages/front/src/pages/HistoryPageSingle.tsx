import React, { useState, useCallback } from 'react';
import { PageLayout, StickyTabNav, PageSEO } from '../components/layout';
import {
  Typography,
  Button,
  Icon,
  FaqBottomPage,
  TableOfContents,
} from '../components/ui/index';

import { CultureSection } from '@thaiakha/shared/types';
import { useAudioAsset } from '../hooks/useAudioAsset';
import { AuthorBlock, HeaderSinglePost, ContentRenderer, parseContent, slugify, AkhaThemedLine, ArticleBody } from '../components/blog';
import { CherryEntryCard } from '../components/chat/CherryEntryCard';
import { SiblingCardPost, SiblingPost } from '../components/ui/card/SiblingCardPost';
import { SiblingSection } from '../components/layout/SiblingSection';
import { ArticleDetailSkeleton } from '../components/skeleton';
import { useCultureDetail } from '../hooks/useCultureDetail';
import { t } from '@thaiakha/shared/lib/ui-strings';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TabItem {
  value: string;
  label: string;
  icon?: string;
}

interface HistoryPageSingleProps {
  slug: string;
  onBack: () => void;
  onOpen?: (slug: string) => void;
  sections?: CultureSection[];
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
  tabItems?: TabItem[];
  returnTo?: 'history' | 'all' | string;
  onNavigate?: (page: string) => void;
}

// ─── HistoryPageSingle ───────────────────────────────────────────────────────

const HistoryPageSingle: React.FC<HistoryPageSingleProps> = ({
  slug,
  onBack,
  onOpen,
  sections = [],
  activeCategory = 'all',
  onCategoryChange,
  tabItems = [],
  onNavigate,
}) => {
  const {
    section,
    previous,
    next,
    loading: dataLoading,
    error
  } = useCultureDetail(slug, sections);

  const [copied, setCopied] = useState(false);

  // Audio assets
  const audioId = section?.audio_asset_id ?? undefined;
  const { asset: audioAsset } = useAudioAsset({ assetId: audioId });

  // Share logic
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: section?.title ?? 'Thai Akha',
        text: section?.subtitle ?? '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [section]);

  const handleSiblingOpen = useCallback((newSlug: string) => {
    if (onOpen) onOpen(newSlug);
  }, [onOpen]);

  return (
    <PageLayout
      slug="akha-culture-highland-heritage-single"
      customMetadata={section ? {
        titleMain: section.title,
        description: section.seo_description || section.subtitle || '',
        imageUrl: section.cover_data?.image_url || '',
      } : undefined}
      showPatterns={true}
      hideDefaultHeader={true}
    >
      {section && (
        <PageSEO
          title={section.seo_title || section.title}
          description={section.seo_description || section.subtitle || ''}
          canonical={section.canonical_url || `${window.location.origin}/akha-culture-highland-heritage/${section.slug}`}
          ogImage={section.cover_data?.image_url || ''}
          ogType="article"
          jsonLd={section.json_ld || undefined}
          hreflang={section.hreflang as Record<string, string> | undefined}
        />
      )}
      <div className="contents">
        {onCategoryChange && (
          <StickyTabNav
            items={tabItems}
            value={activeCategory}
            onChange={onCategoryChange}
          />
        )}

        <div className="w-full max-w-6xl mx-auto">
          {dataLoading && <ArticleDetailSkeleton />}

          {!dataLoading && (error || !section) && (
            <div className="flex flex-col items-center justify-center py-24 text-center [gap:var(--space-fluid-s)]">
              <Icon name="wifi_off" size="xl" className="text-primary/40" />
              <Typography variant="h5" color="sub">{t.history.chapterLoadError}</Typography>
              <Button variant="outline" size="sm" onClick={onBack} icon="arrow_back">{t.common.goBack}</Button>
            </div>
          )}

          {!dataLoading && section && (
            <article className="flex flex-col [gap:var(--space-fluid-m)] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <HeaderSinglePost
                title={section.title}
                subtitle={section.subtitle ?? undefined}
                primaryImage={section.cover_data?.image_url ?? undefined}
                primaryImageAlt={section.cover_data?.alt_text ?? undefined}
                audioAssetId={audioId}
                hasAudio={!!audioAsset}
                quote={section.ui_quote ?? section.quote ?? undefined}
                authorName={section.author?.name}
                categoryName={section.category?.title}
                onShare={handleShare}
                isCopied={copied}
                theme="history"
              />

              {section.content && (() => {
                const tocItems = parseContent(section.content).filter((b: any) => b.type === 'heading' && b.level === 2) as any[];
                return (
                  <ArticleBody
                    className="pt-8 pb-6"
                    aside={tocItems.length > 0 ? (
                      <TableOfContents
                        items={tocItems.map((block: any) => ({
                          id: block.anchorId || slugify(block.text),
                          label: block.text,
                        }))}
                        title={t.blog.contents}
                        dividerTheme="history"
                        accent="sunset"
                      />
                    ) : undefined}
                  >
                    <ContentRenderer content={section.content} theme="history" />
                    <AuthorBlock
                      author={section.author}
                      auditDate={section.last_content_audit_ai}
                      theme="history"
                      className="[margin-top:var(--space-fluid-m)]"
                    />
                  </ArticleBody>
                );
              })()}

            </article>
          )}
        </div>

        {/* Ask Cherry entry card — standard, subito prima del blocco FAQ */}
        {!dataLoading && section && (section.cherry_prompt || section.cherry_response) && (
          <div className="w-full max-w-6xl mx-auto [margin-bottom:var(--space-fluid-l)]">
            <CherryEntryCard
              cherry_prompt={section.cherry_prompt}
              cherry_response={section.cherry_response}
              cherry_button_ids={section.cherry_button_ids}
            />
          </div>
        )}

        {/* FAQ — full page width (main provides container + gutter) */}
        {!dataLoading && section && (
          <div className="w-full">
            <FaqBottomPage
              entityType="culture"
              slug={section.slug}
              onNavigate={onNavigate}
            />
          </div>
        )}

        {/* Sibling nav — tier di chiusura --container-section (più stretto del corpo 6xl) */}
        {!dataLoading && section && (previous || next) && (
          <>
            <div className="w-full max-w-[var(--container-section)] mx-auto">
              <AkhaThemedLine theme="akha" className="[padding-top:var(--space-fluid-l)] [padding-bottom:var(--space-fluid-xs)]" />
            </div>
            <div className="w-full max-w-[var(--container-section)] mx-auto [padding-bottom:var(--space-fluid-xl)]">
              <SiblingSection sectionId="sibiling_history">
                {previous && (
                  <SiblingCardPost
                    item={{
                      title: previous.title,
                      subtitle: previous.subtitle,
                      imageUrl: previous.cover_data?.image_url ?? null,
                      href: `/akha-culture-highland-heritage/${previous.slug}`,
                      slug: previous.slug,
                    } satisfies SiblingPost}
                    direction="prev"
                    onClick={() => handleSiblingOpen(previous.slug)}
                  />
                )}
                {next && (
                  <SiblingCardPost
                    item={{
                      title: next.title,
                      subtitle: next.subtitle,
                      imageUrl: next.cover_data?.image_url ?? null,
                      href: `/akha-culture-highland-heritage/${next.slug}`,
                      slug: next.slug,
                    } satisfies SiblingPost}
                    direction="next"
                    onClick={() => handleSiblingOpen(next.slug)}
                  />
                )}
              </SiblingSection>
            </div>
          </>
        )}

      </div>
    </PageLayout>
  );
};

export default HistoryPageSingle;
