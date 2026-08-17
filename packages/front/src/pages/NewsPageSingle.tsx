import React, { useState, useCallback, useEffect } from 'react';
import { PageLayout, StickyTabNav, PageSEO } from '../components/layout';
import { Typography, Button, Icon, FaqBottomPage, TableOfContents } from '../components/ui/index';

import { AuthorBlock, ContentRenderer, parseContent, slugify, ArticleBody } from '../components/blog';
import { CherryEntryCard } from '../components/chat/CherryEntryCard';
import { ArticleDetailSkeleton } from '../components/skeleton';
import { useNewsDetail } from '../hooks/useNewsDetail';
import { NewsArticle } from '../hooks/useNewsFeed';
import { NewsHeaderSinglePost } from '../components/news/NewsHeaderSinglePost';
import SiblingPostNav from '../components/layout/SiblingPostNav';
import { useAudioAsset } from '../hooks/useAudioAsset';
import { t } from '../i18n';

interface TabItem {
  value: string;
  label: string;
  icon?: string;
}

interface NewsPageSingleProps {
  slug: string;
  onBack: () => void;
  onOpen?: (slug: string) => void;
  articles?: NewsArticle[];
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
  onNavigate?: (page: string) => void;
  tabItems?: TabItem[];
}

const NewsPageSingle: React.FC<NewsPageSingleProps> = ({
  slug,
  onBack,
  onOpen,
  articles = [],
  activeCategory = 'all',
  onCategoryChange,
  onNavigate,
  tabItems = [],
}) => {
  const {
    detail,
    previous,
    next,
    loading: dataLoading,
    error
  } = useNewsDetail(slug, articles);

  // Audio asset support
  const audioId = detail?.audio_asset_id ?? undefined;
  const { asset: audioAsset } = useAudioAsset({ assetId: audioId });

  const [copied, setCopied] = useState(false);

  // Share logic
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: detail?.title ?? 'Thai Akha News',
        text: detail?.excerpt ?? '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [detail]);

  const handleSiblingOpen = useCallback((newSlug: string) => {
    if (onOpen) onOpen(newSlug);
  }, [onOpen]);

  // ── SEO: canonical + og:url — force-set after detail loads to win the race
  //    against SEOHead (App.tsx), which injects parent-page canonical first.
  useEffect(() => {
    if (!detail) return;
    const canonical =
      detail.canonical_url ||
      `https://www.thaiakha.com/thai-cooking-tips-news/${detail.slug}`;
    const canonEl = document.querySelector('link[rel="canonical"]');
    if (canonEl) canonEl.setAttribute('href', canonical);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical);
  }, [detail]);

  // ── JSON-LD: remove parent CollectionPage block injected by SEOHead,
  //    then inject article-specific Article @graph block.
  useEffect(() => {
    if (!detail) return;
    // Remove parent-page JSON-LD (SEOHead injects it for thai-cooking-tips-news)
    document.querySelector('script[data-seo-json-ld="true"]')?.remove();
    // Inject article JSON-LD
    if (detail.json_ld && Object.keys(detail.json_ld).length > 0) {
      document.querySelector('script[data-page-ld="true"]')?.remove();
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-page-ld', 'true');
      script.text = JSON.stringify(detail.json_ld);
      document.head.appendChild(script);
    }
    return () => {
      document.querySelector('script[data-page-ld="true"]')?.remove();
    };
  }, [detail]);

  return (
    <PageLayout
      slug="news-single"
      customMetadata={detail ? {
        titleMain: detail.title,
        description: detail.seo_description || detail.excerpt || '',
        imageUrl: detail.cover_data?.image_url || '',
      } : undefined}
      showPatterns={true}
      hideDefaultHeader={true}
    >
      {/* JSON-LD is managed by the dedicated useEffect above (removes parent
          CollectionPage block + injects article Article @graph).
          PageSEO handles only title / description / og:* / canonical here.
          jsonLd prop intentionally omitted to avoid double <script> injection. */}
      {detail && (
        <PageSEO
          title={detail.seo_title || detail.title}
          description={detail.seo_description || detail.excerpt || ''}
          canonical={detail.canonical_url || `https://www.thaiakha.com/thai-cooking-tips-news/${detail.slug}`}
          ogImage={detail.cover_data?.image_url || ''}
          ogType="article"
        />
      )}
      <div className="contents">
        {onCategoryChange && (
          <StickyTabNav
            items={tabItems}
            value={detail?.category?.id || activeCategory}
            onChange={onCategoryChange}
          />
        )}

        <div className="w-full max-w-6xl mx-auto">
          {dataLoading && <ArticleDetailSkeleton />}

          {!dataLoading && (error || !detail) && (
            <div className="flex flex-col items-center justify-center py-24 text-center [gap:var(--space-fluid-s)]">
              <Icon name="wifi_off" size="xl" className="text-primary/40" />
              <Typography variant="h5" color="sub">Error loading News.</Typography>
              <Button variant="outline" size="sm" onClick={onBack} icon="arrow_back">Back to News</Button>
            </div>
          )}

          {!dataLoading && detail && (() => {
            const parsedBlocks = detail.content ? parseContent(detail.content) : [];
            const tocItems = parsedBlocks.filter(b => b.type === 'heading' && b.level === 2) as any[];

            return (
              <div className="flex flex-col [gap:var(--space-fluid-m)] animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* 1. FULL WIDTH HEADER BLOCK */}
                <NewsHeaderSinglePost
                  title={detail.title}
                  subtitle={detail.excerpt ?? undefined}
                  coverImageUrl={detail.cover_data?.image_url ?? undefined}
                  coverImageAlt={detail.cover_data?.alt_text ?? undefined}
                  authorName={detail.author?.name}
                  categoryName={detail.category?.title}
                  audioAssetId={audioId}
                  hasAudio={!!audioAsset}
                  quote={detail.ui_quote ?? undefined}
                  onShare={handleShare}
                  isCopied={copied}
                  theme="news"
                />

                {/* 2. BODY BLOCK — layout condiviso ArticleBody (9/12 + ToC sticky 3/12) */}
                <ArticleBody
                  mainAs="article"
                  mainGap="m"
                  aside={tocItems.length > 0 ? (
                    <TableOfContents
                      items={tocItems.map((block: any) => ({
                        id: block.anchorId || slugify(block.text),
                        label: block.text,
                      }))}
                      title={t('blog:contents')}
                      dividerTheme="news"
                      accent="brand"
                    />
                  ) : undefined}
                >
                  {detail.content && (
                    <div className="w-full flex flex-col [gap:var(--space-fluid-m)]">
                      <ContentRenderer content={detail.content} theme="news" />

                      {/* --- AUTHOR & VERIFICATION BOX --- */}
                      <AuthorBlock
                        author={detail.author}
                        auditDate={detail.last_content_audit_ai}
                        theme="news"
                        className="[margin-top:var(--space-fluid-m)]"
                      />
                    </div>
                  )}
                </ArticleBody>

              </div>
            );
          })()}
        </div>

        {/* Ask Cherry entry card — standard, subito prima del blocco FAQ */}
        {!dataLoading && detail && (detail.cherry_prompt || detail.cherry_response) && (
          <div className="w-full max-w-6xl mx-auto [margin-bottom:var(--space-fluid-l)]">
            <CherryEntryCard
              cherry_prompt={detail.cherry_prompt}
              cherry_response={detail.cherry_response}
              cherry_button_ids={detail.cherry_button_ids}
            />
          </div>
        )}

        {/* FAQ — full page width (main provides container + gutter) */}
        {!dataLoading && detail && (
          <div className="w-full">
            <FaqBottomPage
              entityType="news"
              slug={detail.slug}
              onNavigate={onNavigate}
            />
          </div>
        )}

        {/* Sibling nav — tier di chiusura --container-section (più stretto del corpo 6xl) */}
        {!dataLoading && detail && (previous || next) && (
          <>
            <SiblingPostNav
              sectionId="sibiling_news"
              onOpen={handleSiblingOpen}
              previous={previous ? {
                title: previous.title,
                subtitle: previous.excerpt ?? null,
                imageUrl: previous.cover_data?.image_url ?? null,
                href: `/news/${previous.slug}`,
                slug: previous.slug,
              } : null}
              next={next ? {
                title: next.title,
                subtitle: next.excerpt ?? null,
                imageUrl: next.cover_data?.image_url ?? null,
                href: `/news/${next.slug}`,
                slug: next.slug,
              } : null}
            />
          </>
        )}

      </div>
    </PageLayout>
  );
};

export default NewsPageSingle;
