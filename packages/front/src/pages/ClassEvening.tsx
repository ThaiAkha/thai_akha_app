import React from 'react';
import { PageLayout, PageEssentials, SmartHeaderSection, HeaderMenu, PageSEO, SiblingInfoSection } from '../components/layout';
import { AkhaThemedLine, AkhaQuote, FaqBottomPage, GlassCardFull } from '../components/ui';
import { HeroContent } from '../components/classes/HeroContent';
import ClassScheduleTimeline from '../components/classes/ClassScheduleTimeline';
import type { ScheduleStep } from '../components/classes/ClassScheduleTimeline';
import ClassGallery from '../components/classes/ClassGallery';
import ClassInclusions from '../components/classes/ClassInclusions';
import AkhaButtonLine from '../components/divider/AkhaButtonLine';
import { useClassPageData } from '../hooks/useClassPageData';
import { t } from '@thaiakha/shared/lib/ui-strings';

interface EveningClassPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
}

const EveningClassPage: React.FC<EveningClassPageProps> = ({ onNavigate }) => {
  const {
    classData,
    gallery1,
    gallery2,
    pickupSection,
    exclusionsSection,
    seoMetadata,
    loading,
  } = useClassPageData('evening');

  const inclusions = (classData?.inclusions ?? []) as string[];

  return (
    <PageLayout
      slug="evening-cooking-class-dinner"
      loading={loading}
      showPatterns={true}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="evening-cooking-class-dinner" />}
    >
      {/* JSON-LD is handled exclusively by SEOHead (global, slug-based).
          PageSEO manages only meta/og/twitter tags here to avoid duplicate structured data. */}
      <PageSEO
        title={seoMetadata?.seo_title || t.seo.evening.title}
        description={seoMetadata?.seo_description || t.seo.evening.description}
        canonical={seoMetadata?.canonical_url || t.seo.evening.canonical}
        ogTitle={seoMetadata?.og_title || seoMetadata?.seo_title || undefined}
        ogDescription={seoMetadata?.og_description || seoMetadata?.seo_description || undefined}
        ogImage={seoMetadata?.og_image || t.seo.ogDefault}
        ogType={(seoMetadata?.og_type as 'website' | 'article' | 'profile') || 'website'}
      />

      <div className="w-full flex flex-col [gap:var(--space-fluid-xl)]">

        {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
        <HeroContent
          activeTab="evening"
          currentClass={classData}
          sectionId="evening-01"
          audioAssetId="class-03"
        />

        {/* ── 2. Gallery 1 — 8 photos + Book CTA ─────────────────────────── */}
        <div className="flex flex-col [gap:var(--space-fluid-m)]">
          <SmartHeaderSection sectionId="evening-02" variant="section" align="center" />
          <ClassGallery items={gallery1} />
          <AkhaButtonLine
            label={t.classes.bookYourClass}
            icon="calendar_month"
            href="/booking"
            onClick={() => onNavigate('booking')}
            theme="akha"
          />
        </div>

        {/* ── 3. Daily Schedule Timeline ──────────────────────────────────── */}
        {classData && (classData.schedule_items ?? []).length > 0 && (
          <ClassScheduleTimeline
            steps={(classData.schedule_items ?? []) as unknown as ScheduleStep[]}
            color="secondary"
            sectionId="evening-03"
            onNavigate={onNavigate}
          />
        )}

        {/* ── 4. Gallery 2 + Quote (evening-04 header) ────────────────────── */}
        <AkhaThemedLine theme="akha" />

        <div className="flex flex-col [gap:var(--space-fluid-l)]">
          <SmartHeaderSection sectionId="evening-04" variant="section" align="center" />
          <ClassGallery items={gallery2} />

          {classData?.tagline && (
            <div className="flex justify-center [padding-inline:var(--space-fluid-xl)] [padding-top:var(--space-fluid-l)] [padding-bottom:var(--space-fluid-m)]">
              <AkhaQuote variant="main" className="max-w-2xl">
                {classData.tagline}
              </AkhaQuote>
            </div>
          )}
        </div>

        {/* ── 5. Inclusions ───────────────────────────────────────────────── */}
        {inclusions.length > 0 && (
          <>
            <AkhaThemedLine theme="akha" />

            <div className="flex flex-col [gap:var(--space-fluid-l)]">
              <SmartHeaderSection sectionId="evening-05" variant="section" align="center" />
              <ClassInclusions items={inclusions} />
            </div>
          </>
        )}

        {/* ── 6. Pickup — GlassCard ───────────────────────────────────────── */}
        <GlassCardFull
          sectionId="evening-06"
          prefetchedData={pickupSection}
          glassVariant="secondary"
          imagePosition="right"
          onNavigate={(path) => onNavigate(path)}
        />

        <AkhaThemedLine theme="akha" />

        {/* ── 7. Universal Exclusions ─────────────────────────────────────── */}
        <GlassCardFull
          sectionId="universal_exclusions"
          prefetchedData={exclusionsSection}
          glassVariant="primary"
          imagePosition="left"
          onNavigate={(path) => onNavigate(path)}
        />

        <PageEssentials slug="evening-cooking-class-dinner" />

        <FaqBottomPage
          slug="evening-cooking-class-dinner"
          onNavigate={onNavigate}
        />

        <SiblingInfoSection
          currentSlug="evening-cooking-class-dinner"
          onNavigate={onNavigate}
        />
      </div>
    </PageLayout>
  );
};

export default EveningClassPage;
