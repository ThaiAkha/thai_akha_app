import React from 'react';
import { PageLayout, PageEssentials, SmartHeaderSection, HeaderMenu, SiblingInfoSection } from '../components/layout';
import { AkhaThemedLine, AkhaQuote, FaqBottomPage, GlassCardFull } from '../components/ui';
import { HeroContent } from '../components/classes/HeroContent';
import ClassScheduleTimeline from '../components/classes/ClassScheduleTimeline';
import type { ScheduleStep } from '../components/classes/ClassScheduleTimeline';
import ClassGallery from '../components/classes/ClassGallery';
import ClassInclusions from '../components/classes/ClassInclusions';
import ClassDetails from '../components/classes/ClassDetails';
import AkhaButtonLine from '../components/divider/AkhaButtonLine';
import { useClassPageData } from '../hooks/useClassPageData';
import { t } from '../i18n';

interface MorningClassPageProps {
  onNavigate?: (page: string, topic?: string, sectionId?: string) => void;
}

const MorningClassPage: React.FC<MorningClassPageProps> = ({ onNavigate }) => {
  const {
    classData,
    gallery1,
    gallery2,
    pickupSection,
    exclusionsSection,
    classSections,
    loading,
  } = useClassPageData('morning');

  return (
    <PageLayout
      slug="morning-cooking-class-market-tour"
      loading={loading}
      showPatterns={true}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="morning-cooking-class-market-tour" />}
    >
      {/* SEO: interamente di SEOHead (globale, slug-based). Niente PageSEO qui. */}

      <div className="w-full flex flex-col [gap:var(--space-fluid-xl)]">

        {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
        <HeroContent
          activeTab="morning"
          currentClass={classData}
          sectionId="morning-01"
          audioAssetId="class-02"
        />

        {/* ── 2. Gallery 1 — 8 photos + Book CTA ─────────────────────────── */}
        <div className="flex flex-col [gap:var(--space-fluid-m)]">
          <SmartHeaderSection sectionId="morning-02" variant="section" align="center" />
          <ClassGallery items={gallery1} />
          <AkhaButtonLine
            label={t('classes:bookYourClass')}
            icon="calendar_month"
            href="/booking"
            onClick={() => onNavigate?.('booking')}
            theme="akha"
            buttonVariant="brand"
          />
        </div>

        <AkhaThemedLine theme="akha" />

        {/* ── 3. Daily Schedule Timeline ──────────────────────────────────── */}
        {classData && (classData.schedule_items ?? []).length > 0 && (
          <ClassScheduleTimeline
            steps={(classData.schedule_items ?? []) as unknown as ScheduleStep[]}
            color="primary"
            sectionId="morning-03"
            onNavigate={onNavigate}
          />
        )}

        {/* ── 4. Gallery 2 + Quote (morning-04 header) ────────────────────── */}
        <AkhaThemedLine theme="akha" />

        <div className="flex flex-col [gap:var(--space-fluid-l)]">
          <SmartHeaderSection sectionId="morning-04" variant="section" align="center" />
          <ClassGallery items={gallery2} />

          {classData?.tagline && (
            <div className="flex justify-center [padding-inline:var(--space-fluid-xl)] [padding-top:var(--space-fluid-l)] [padding-bottom:var(--space-fluid-m)]">
              <AkhaQuote variant="main" className="max-w-2xl">
                {classData.tagline}
              </AkhaQuote>
            </div>
          )}
        </div>

        <AkhaButtonLine
          label={t('classes:bookYourClass')}
          icon="calendar_month"
          href="/booking"
          onClick={() => onNavigate?.('booking')}
          theme="akha"
          buttonVariant="brand"
        />

        {/* ── 5. Inclusions (morning-05 header) ─────────────────────────────
            La AkhaButtonLine "Book Your Class" qui sopra fa già da separatore
            di sezione → niente AkhaThemedLine aggiuntiva (evita doppio divider). */}
        <div className="flex flex-col [gap:var(--space-fluid-l)]">
          <SmartHeaderSection sectionId="morning-05" variant="section" align="center" />
          <ClassInclusions items={(classData?.inclusions ?? []) as string[]} />
        </div>

        {/* ── 5b. Class Flow — class_sections (flusso classe, pagamenti, diete, walk-in) ── */}
        {classSections.length > 0 && (
          <>
            <AkhaThemedLine theme="akha" />
            <div className="flex flex-col w-full max-w-3xl mx-auto">
              <ClassDetails color="primary" classSections={classSections} />
            </div>
          </>
        )}

        {/* ── 6. Pickup — GlassCard ───────────────────────────────────────── */}
        <GlassCardFull
          sectionId="morning-06"
          prefetchedData={pickupSection}
          glassVariant="action"
          imagePosition="left"
          onNavigate={(path) => onNavigate?.(path)}
        />

        <AkhaThemedLine theme="akha" />

        {/* ── 7. Universal Exclusions ─────────────────────────────────────── */}
        <GlassCardFull
          sectionId="universal_exclusions"
          prefetchedData={exclusionsSection}
          glassVariant="action"
          imagePosition="right"
          onNavigate={(path) => onNavigate?.(path)}
        />

        <PageEssentials slug="morning-cooking-class-market-tour" />

        <FaqBottomPage
          slug="morning-cooking-class-market-tour"
          onNavigate={onNavigate}
        />

        {onNavigate && (
          <SiblingInfoSection
            currentSlug="morning-cooking-class-market-tour"
            onNavigate={onNavigate}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default MorningClassPage;
