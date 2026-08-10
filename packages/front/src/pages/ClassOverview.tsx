import React, { useState } from 'react';
import { PageLayout, PageEssentials, SmartHeaderSection, HeaderMenu, ScrollEntrance, SiblingInfoSection } from '../components/layout';
import {
  Typography, AkhaThemedLine, AkhaPixelPattern, AkhaQuote, Card, MediaImage, GlassCardFull, SmartHomeCard, FaqBottomPage, ShareButton
} from '../components/ui';
import { HeroContentOverview } from '../components/classes';
import { NewsCard } from '../components/news/NewsCard';
import AudioPlayer from '../components/modal/AudioPlayer';
import VideoPlayer from '../components/modal/VideoPlayer';
import PhotoModal from '../components/modal/PhotoModal';
import { useClassesPageSections } from '../hooks/useClassesPageSections';
import { useClassOverviewExtras } from '../hooks/useClassOverviewExtras';
import { useMediaAsset } from '../hooks/useMediaAsset';
import { useShareLink } from '../hooks/useShareLink';
import { t } from '@thaiakha/shared/lib/ui-strings';

interface InfoClassesProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
}

const InfoClasses: React.FC<InfoClassesProps> = ({ onNavigate }) => {
  const { sections: pageSections, metadata: classesMetadata, loading: sectionsLoading } = useClassesPageSections();
  const { featuredNews, reasons, loading } = useClassOverviewExtras();
  // Blocco confronto Morning vs Evening — dati dalla media asset
  const { asset: compareAsset } = useMediaAsset({ assetId: 'classes-compare-cover-01' });
  const [comparePhotoOpen, setComparePhotoOpen] = useState(false);
  const { handleShare, copied } = useShareLink();

  const pageLoading = sectionsLoading || loading;
  const pageMetadata = classesMetadata;


  return (
    <PageLayout
      slug="thai-cooking-classes-chiang-mai"
      loading={pageLoading}
      showPatterns={true}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="thai-cooking-classes-chiang-mai" />}
    >
      {/* SEO: interamente di SEOHead (globale, slug-based). Niente PageSEO qui. */}


      <div className="contents">
        {/* HERO SECTION */}
        {pageMetadata && (
          <HeroContentOverview
            sectionId="class-00"
            prefetchedData={pageSections['class-00']}
            imageAssetId={pageSections['class-00']?.image_asset_id || undefined}
            imageUrl={!pageSections['class-00']?.image_asset_id ? pageMetadata.imageUrl : undefined}
            audioAssetId="class-00"
          />
        )}

        <AkhaThemedLine theme="akha" />

        {/* 1. KITCHEN LIFE STREAM (class-01) */}
        <ScrollEntrance delay={0.1}>
          <section id="class-01" className="flex flex-col [gap:var(--space-fluid-m)]">
            <SmartHeaderSection
              sectionId="class-01"
              prefetchedData={pageSections['class-01']}
              variant="hero2"
              align="center"
              gradientFrom="primary"
              gradientTo="action"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-m)]">
              <div className="flex flex-col">
                <SmartHomeCard
                  cardId="class-01"
                  layout="vertical"
                  onNavigate={onNavigate}
                  showDivider={true}
                  titleVariant="h3"
                />
              </div>
              <div className="flex flex-col">
                <SmartHomeCard
                  cardId="class-02"
                  layout="vertical"
                  onNavigate={onNavigate}
                  showDivider={true}
                  titleVariant="h3"
                />
              </div>
            </div>
          </section>
        </ScrollEntrance>

        {/* COMPARE — Morning vs Evening (media asset: classes-compare-cover-01) */}
        <AkhaThemedLine theme="akha" />
        <ScrollEntrance delay={0.1}>
          <section className="flex flex-col items-center text-center [gap:var(--space-fluid-l)]">
            <Typography variant="h2" className="text-title max-w-3xl">
              {compareAsset?.title}
            </Typography>

            {/* Photo — larger centered (matches the history-single scale) */}
            <button
              type="button"
              onClick={() => setComparePhotoOpen(true)}
              aria-label={compareAsset?.alt_text || compareAsset?.title || 'Open photo'}
              className="w-full md:w-[80%] max-w-4xl mx-auto aspect-[16/9] overflow-hidden rounded-2xl cursor-zoom-in group"
            >
              <MediaImage
                assetId="classes-compare-cover-01"
                showCaption={false}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                fallbackAlt={compareAsset?.alt_text || compareAsset?.title || ''}
              />
            </button>

            {/* Audio + Share — same sequence/treatment as the history-single header */}
            <div className="flex flex-col md:flex-row items-start justify-center [gap:var(--space-fluid-s)] max-w-3xl mx-auto w-full relative z-20">
              <AudioPlayer
                assetId="class-02"
                hideTranscript={false}
                className="w-full md:w-[720px]"
              />
              <ShareButton
                onShare={() => handleShare(compareAsset?.title || 'Thai Cooking Classes — Chiang Mai', compareAsset?.caption || '')}
                isCopied={copied}
              />
            </div>

            {/* Quote — canonical AkhaQuote (Akha pixel line), like every other quote on the site */}
            {compareAsset?.caption && (
              <AkhaQuote variant="base" align="left" className="max-w-3xl mx-auto">
                {compareAsset.caption}
              </AkhaQuote>
            )}
          </section>
        </ScrollEntrance>

        <PhotoModal
          isOpen={comparePhotoOpen}
          onClose={() => setComparePhotoOpen(false)}
          image={compareAsset?.image_url || ''}
          assetId="classes-compare-cover-01"
          title={compareAsset?.title}
          description={compareAsset?.caption}
        />

        <AkhaThemedLine theme="akha" />

        {/* 2. 6 REASONS TO JOIN US (class-02) */}
        <ScrollEntrance delay={0.1}>
          <section id="class-02" className="flex flex-col [gap:var(--space-fluid-m)]">
            <SmartHeaderSection
              sectionId="class-02"
              prefetchedData={pageSections['class-02']}
              variant="hero2"
              align="center"
              gradientFrom="primary"
              gradientTo="action"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 [gap:var(--space-fluid-m)]">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[16/9] bg-surface-2 animate-pulse rounded-xl" />
                ))
              ) : (
                reasons.map((asset) => (
                  <Card
                    key={asset.asset_id}
                    padding="none"
                    rounded="xl"
                    className="overflow-hidden flex flex-col h-full bg-surface-2 border-border/40 pointer-events-none"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <MediaImage
                        assetId={asset.asset_id}
                        className="w-full h-full transform transition-transform duration-500"
                        imgClassName="w-full h-full object-cover"
                        fallbackAlt={asset.alt_text || asset.title}
                      />
                    </div>
                    <div className="[padding:var(--space-fluid-m)] flex flex-col [gap:var(--space-fluid-xs)]">
                      <Typography variant="h4" className="text-title leading-tight font-bold">
                        {asset.title}
                      </Typography>
                      <AkhaPixelPattern variant="line_simple_medium" size={5} opacity={0.9} />
                      {asset.caption && (
                        <Typography variant="paragraphM" className="text-desc line-clamp-3">
                          {asset.caption}
                        </Typography>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        </ScrollEntrance>

        {/* AUDIO STORIES 03 - 6 REASONS / CHOOSE US */}
        <div className="max-w-xl mx-auto w-full relative z-20">
          <AudioPlayer assetId="class-03" hideTranscript />
        </div>

        <AkhaThemedLine theme="akha" />

        {/* 3. THE KITCHEN SPIRIT VIDEO (class-03) */}
        <ScrollEntrance delay={0.1}>
          <section id="class-03" className="flex flex-col [gap:var(--space-fluid-m)]">
            <SmartHeaderSection
              sectionId="class-03"
              prefetchedData={pageSections['class-03']}
              variant="hero2"
              align="center"
              gradientFrom="primary"
              gradientTo="action"
            />

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 [gap:var(--space-fluid-m)]">
                {/* TODO: placeholder — 3 video identici (stesso videoId). Sostituire con videoId diversi. */}
                <VideoPlayer videoId="j7kN7fw5OfY" title={t.alt.classVideo} />
                <VideoPlayer videoId="j7kN7fw5OfY" title={t.alt.classVideo} />
                <VideoPlayer videoId="j7kN7fw5OfY" title={t.alt.classVideo} />
              </div>
            </div>
          </section>
        </ScrollEntrance>

        <AkhaThemedLine theme="akha" />

        {/* 4. IMPORTANT INFO BEFORE YOU COME (class-04) */}
        <ScrollEntrance delay={0.1}>
          <section id="class-04" className="flex flex-col [gap:var(--space-fluid-m)]">
            <SmartHeaderSection
              sectionId="class-04"
              prefetchedData={pageSections['class-04']}
              variant="hero2"
              align="center"
              gradientFrom="primary"
              gradientTo="action"
            />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] [gap:var(--space-fluid-xl)] items-center">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="h-64 bg-surface-2 animate-pulse" />
                    {i < 2 && <div className="hidden md:block w-8" />}
                  </React.Fragment>
                ))
              ) : (
                featuredNews.slice(0, 3).map((article, index) => (
                  <React.Fragment key={article.id}>
                    <div className="h-full">
                      <NewsCard article={article} onOpen={(slug) => onNavigate('news', undefined, slug)} />
                    </div>
                    {index < 2 && (
                      <div className="hidden md:flex items-center justify-center py-4">
                        <AkhaPixelPattern
                          variant="news"
                          size={4}
                          speed={20}
                          animateInView
                          expandFromCenter
                          className="opacity-60"
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </section>
        </ScrollEntrance>

        <AkhaThemedLine theme="akha" />

        {/* 5. MENU (class-05) */}
        <ScrollEntrance delay={0.1}>
          <section id="class-05">
            <GlassCardFull
              sectionId="class-05"
              prefetchedData={pageSections['class-05']}
              buttonVariant="brand"
              onNavigate={(path) => onNavigate(path)}
              imagePosition="right"
              glassVariant="action"
            />
          </section>
        </ScrollEntrance>

        <AkhaThemedLine theme="akha" />

        {/* 6. CERTIFICATE (class-06) */}
        <ScrollEntrance delay={0.1}>
          <section id="class-06">
            <GlassCardFull
              sectionId="class-06"
              prefetchedData={pageSections['class-06']}
              onNavigate={(path) => onNavigate(path)}
              imagePosition="left"
              glassVariant="action"
              gradientFrom="primary"
              gradientTo="action"
            />
          </section>
        </ScrollEntrance>

        <PageEssentials slug="thai-cooking-classes-chiang-mai" />

        <FaqBottomPage slug="thai-cooking-classes-chiang-mai" onNavigate={(page) => onNavigate(page)} />

        <SiblingInfoSection
          currentSlug="thai-cooking-classes-chiang-mai"
          onNavigate={(page) => onNavigate(page)}
        />
      </div>

    </PageLayout>
  );
};

export default InfoClasses;
