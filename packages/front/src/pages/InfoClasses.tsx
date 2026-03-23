
import React, { useState, useEffect } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { PageLayout, SmartHeaderSection, HeaderMenu, StickyTabNav } from '../components/layout';
import {
  Button, InfoCard, StatCard,
  VideoModal, PhotoModal, AkhaPixelLine
} from '../components/ui/index';
import GalleryModal, { GalleryItem } from '../components/modal/GalleryModal';
import { CookingClassDB } from '@thaiakha/shared';

import { HeroContent } from '../components/classes/HeroContent';
import ClassDetails from '../components/classes/ClassDetails';
import ClassSectionBlock, { ClassSection } from '../components/classes/ClassSectionBlock';
import { Photo } from '../components/modal/Photo';
import { Gallery } from '../components/modal/Gallery';
import { Video } from '../components/modal/Video';

interface InfoClassesProps {
  onNavigate: (page: string, topic?: string) => void;
}

type TabMode = 'overview' | 'morning' | 'evening';

const REASONS_ASSETS = [
  'class-01', // Akha Heritage
  'class-02', // Akha Cooking Class Experience
  'class-03', // Fresh Thai Chilies
  'class-04', // Wok Cooking Mastery
  'class-05', // Hand-pounded Curry Paste
  'class-06', // Local Market Tour
];

const getTabFromUrl = (): TabMode => {
  const slug = window.location.pathname.split('/')[2];
  if (slug === 'morning_class') return 'morning';
  if (slug === 'evening_class') return 'evening';
  return 'overview';
};

const InfoClasses: React.FC<InfoClassesProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabMode>(getTabFromUrl);
  const [classes, setClasses] = useState<Record<string, CookingClassDB>>({});
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [pageMetadata, setPageMetadata] = useState<{ imageUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [classSessions, setClassSessions] = useState<Record<string, any>>({});
  const [classSectionsMap, setClassSectionsMap] = useState<Record<string, ClassSection[]>>({});
  const [sharedSections, setSharedSections] = useState<ClassSection[]>([]);

  // Sync tab with browser back/forward
  useEffect(() => {
    const handlePop = () => setActiveTab(getTabFromUrl());
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleTabChange = (tab: string) => {
    const newTab = tab as TabMode;
    if (newTab === activeTab) return;
    const slug = newTab === 'morning' ? 'morning_class' : newTab === 'evening' ? 'evening_class' : null;
    window.history.pushState({}, '', slug ? `/classes/${slug}` : '/classes');
    setActiveTab(newTab);
  };

  // Scroll to tabs when activeTab changes
  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    const contentContainer = document.getElementById('classes-content');

    if (scrollContainer && contentContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const contentRect = contentContainer.getBoundingClientRect();

      const stickyOffset = window.innerWidth < 768 ? 10 : 20;
      const targetScrollTop = scrollContainer.scrollTop + (contentRect.top - containerRect.top) - stickyOffset;
      scrollContainer.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    } else if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Media modal state
  const [showVideo, setShowVideo] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const [classData, gallery, metadata, morningSession, eveningSession, morningSections, eveningSections] = await Promise.all([
          contentService.getCookingClasses(),
          contentService.getGalleryItems('kitchen_stream'),
          contentService.getPageMetadata('classes'),
          contentService.getClassSession('morning_class'),
          contentService.getClassSession('evening_class'),
          contentService.getClassSections('morning_class'),
          contentService.getClassSections('evening_class'),
        ]);

        const map: Record<string, CookingClassDB> = {};
        classData.forEach((item: CookingClassDB) => {
          map[item.id.replace('_class', '')] = item;
        });
        // Split sections: shared = assigned to both classes; class-specific = only one
        const sharedIds = new Set(
          morningSections
            .filter((s: ClassSection) => s.assigned_classes?.includes('evening_class'))
            .map((s: ClassSection) => s.id)
        );
        const shared = morningSections.filter((s: ClassSection) => sharedIds.has(s.id));
        const morningOnly = morningSections.filter((s: ClassSection) => !sharedIds.has(s.id));
        const eveningOnly = eveningSections.filter((s: ClassSection) => !sharedIds.has(s.id));

        setClasses(map);
        setGalleryData(gallery);
        setPageMetadata(metadata);
        setClassSessions({ morning: morningSession, evening: eveningSession });
        setClassSectionsMap({ morning: morningOnly, evening: eveningOnly });
        setSharedSections(shared);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const handleAskCherry = () => {
    const topic = activeTab === 'overview'
      ? "Tell me about the cooking school philosophy kha"
      : `Tell me details about the ${activeTab} class kha`;
    window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
  };

  const currentClass = activeTab === 'overview' ? null : classes[activeTab];

  const NAV_ITEMS = [
    { value: 'overview', label: 'Overview', icon: 'dashboard' },
    { value: 'morning', label: <><span className="md:hidden">Morning</span><span className="hidden md:inline">Morning Class</span></>, icon: 'wb_sunny' },
    { value: 'evening', label: <><span className="md:hidden">Evening</span><span className="hidden md:inline">Evening Class</span></>, icon: 'dark_mode' },
  ];

  // Use gallery items as photo sources — fallback to empty string while loading
  const g = (i: number): GalleryItem => galleryData[i] ?? { image_url: '' };

  return (

    <PageLayout
      slug="classes"
      loading={loading}
      showPatterns={true}
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="classes" />}
    >
      <div id="classes-content" className="w-full flex flex-col">

        {/* 1. TABS - Sticky Super Pill */}
        <StickyTabNav
          items={NAV_ITEMS}
          value={activeTab}
          onChange={handleTabChange}
        />

        {/* 2. HERO CONTENT */}
        <section className="mt-8 space-y-12 pb-12 md:pb-16">
          <HeroContent
            activeTab={activeTab}
            currentClass={currentClass}
            overviewImage={pageMetadata?.imageUrl || g(2).image_url}
            onAskCherry={handleAskCherry}
          />

          {/* Class Details — shown only on morning/evening tabs */}
          {activeTab !== 'overview' && currentClass && (
            <ClassDetails
              color={activeTab === 'morning' ? 'primary' : 'secondary'}
              tags={currentClass.tags ?? []}
              inclusions={currentClass.inclusions ?? []}
              schedule={(currentClass.schedule_items ?? []) as any[]}
              meetingPoints={classSessions[activeTab]?.meeting_points ?? []}
              classSections={classSectionsMap[activeTab] ?? []}
            />
          )}

          {/* Shared sections — always visible on all tabs */}
          {sharedSections.length > 0 && (
            <div className="space-y-3">
              {sharedSections.map((section, idx) => (
                <ClassSectionBlock
                  key={section.id}
                  section={section}
                  color="primary"
                  isLast={idx === sharedSections.length - 1}
                />
              ))}
            </div>
          )}

          {/* Book CTA — always visible in all tabs */}
          <div className="flex justify-center pt-4">
            <Button
              variant="brand"
              size="xl"
              icon="calendar_month"
              onClick={() => onNavigate('booking')}
              className="min-w-[260px]"
            >
              Book Your Class
            </Button>
          </div>
        </section>

        <AkhaPixelLine />

        {/* 3. KITCHEN LIFE STREAM */}
        <section className="space-y-12 py-12 md:py-16">
          <SmartHeaderSection
            sectionId="class-01"
            variant="hero"
            align="center"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {galleryData.slice(0, 4).map((item, index) => {
              if (index === 0) return (
                <Gallery key={item.photo_id ?? index} imageUrl={item.image_url} onClick={() => setIsGalleryOpen(true)} />
              );

              return (
                <Photo key={item.photo_id ?? index} item={item} onClick={setSelectedPhoto} />
              );
            })}
          </div>
        </section>

        <AkhaPixelLine />

        {/* 4. 6 Reasons to Join */}
        <section className="space-y-12 py-12 md:py-12">
          <SmartHeaderSection
            sectionId="class-02"
            variant="section"
            align="center"
            hideTitle={false}
            hideSubtitle={false}
            hideDivider={false}
            hideDescription={false}
          />

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {REASONS_ASSETS.map((assetId, idx) => (
              <StatCard
                key={assetId}
                assetId={assetId}
                iconPosition="top"
                align="center"
                value=""
                color={idx % 2 === 0 ? "primary" : "action"}
                className="h-full rounded-3xl"
              />
            ))}
          </div>
        </section>

        <AkhaPixelLine />

        {/* 5. EXPLORE MORE - VISIBLE TRIGGERS */}
        <section className="space-y-12 py-12 md:py-16">
          <SmartHeaderSection
            sectionId="class-03"
            variant="section"
            align="center"
            hideTitle={false}
            hideSubtitle={false}
            hideDivider={false}
            hideDescription={false}
          />
          <div className="w-full max-w-4xl mx-auto items-center">
            <Video
              variant="inline"
              videoId="j7kN7fw5OfY"
              title="The Kitchen Spirit"
            />
          </div>
        </section>

        <AkhaPixelLine />

        <section className="space-y-12 py-12 md:py-16">
          <SmartHeaderSection
            sectionId="class-04"
            variant="section"
            align="center"
            hideTitle={false}
            hideSubtitle={false}
            hideDivider={false}
            hideDescription={false}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard
              layout="vertical"
              onNavigate={onNavigate}
              card={{ id: 'm', title: 'Full Menu', desc: 'Browse our 11 traditional dishes.', link: 'recipes', image: g(0).image_url, icon: 'restaurant_menu' }}
            />
            <InfoCard
              layout="vertical"
              onNavigate={onNavigate}
              card={{ id: 'l', title: 'Location', desc: 'Pickup details and directions.', link: 'location', image: g(1).image_url, icon: 'location_on' }}
            />
            <Video imageUrl={g(3).image_url} onClick={() => setShowVideo(true)} />
          </div>
        </section>

        <AkhaPixelLine />

        <section className="space-y-12 py-12 md:py-16">
          <SmartHeaderSection
            sectionId="class-05"
            variant="section"
            align="center"
            hideTitle={false}
            hideSubtitle={false}
            hideDivider={false}
            hideDescription={false}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard
              layout="vertical"
              onNavigate={onNavigate}
              card={{ id: 'm', title: 'Full Menu', desc: 'Browse our 11 traditional dishes.', link: 'recipes', image: g(0).image_url, icon: 'restaurant_menu' }}
            />
            <InfoCard
              layout="vertical"
              onNavigate={onNavigate}
              card={{ id: 'l', title: 'Location', desc: 'Pickup details and directions.', link: 'location', image: g(1).image_url, icon: 'location_on' }}
            />
            <Video imageUrl={g(3).image_url} onClick={() => setShowVideo(true)} />
          </div>
        </section>

        {/* MODALS (Global overlays, always at root level) */}
        <VideoModal
          isOpen={showVideo}
          onClose={() => setShowVideo(false)}
          videoId="j7kN7fw5OfY"
          title="The Kitchen Spirit"
          backgroundImage={g(3).image_url}
        />
        {selectedPhoto && (
          <PhotoModal
            isOpen={!!selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            image={selectedPhoto.image_url}
            title={selectedPhoto.title}
            description={selectedPhoto.description}
            quote={selectedPhoto.quote}
          />
        )}
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          items={galleryData}
          startIndex={0}
        />
      </div>
    </PageLayout >
  );
};

export default InfoClasses;
