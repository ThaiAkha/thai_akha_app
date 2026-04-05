
import React, { useState, useEffect } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { PageLayout, SmartHeaderSection, HeaderMenu } from '../components/layout';
import {
  Button, InfoCard, StatCard,
  VideoModal, PhotoModal, AkhaPixelLine
} from '../components/ui/index';
import GalleryModal, { GalleryItem } from '../components/modal/GalleryModal';

import { HeroContentOverview } from '../components/classes/HeroContentOverview';
import ClassSectionBlock, { ClassSection } from '../components/classes/ClassSectionBlock';
import { Photo } from '../components/modal/Photo';
import { Gallery } from '../components/modal/Gallery';
import { Video } from '../components/modal/Video';
import { t } from '@thaiakha/shared/lib/ui-strings';

interface InfoClassesProps {
  onNavigate: (page: string, topic?: string) => void;
}

const REASONS_ASSETS = [
  'class-01', // Akha Heritage
  'class-02', // Akha Cooking Class Experience
  'class-03', // Fresh Thai Chilies
  'class-04', // Wok Cooking Mastery
  'class-05', // Hand-pounded Curry Paste
  'class-06', // Local Market Tour
];

const InfoClasses: React.FC<InfoClassesProps> = ({ onNavigate }) => {
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [pageMetadata, setPageMetadata] = useState<{ imageUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharedSections, setSharedSections] = useState<ClassSection[]>([]);

  // Media modal state
  const [showVideo, setShowVideo] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const [gallery, metadata, morningSections] = await Promise.all([
          contentService.getGalleryItems('kitchen_stream'),
          contentService.getPageMetadata('classes'),
          contentService.getClassSections('morning_class'),
        ]);

        // Shared sections are those assigned to both classes
        const shared = morningSections.filter((s: ClassSection) =>
          s.assigned_classes?.includes('evening_class')
        );

        setGalleryData(gallery);
        setPageMetadata(metadata);
        setSharedSections(shared);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const handleAskCherry = () => {
    window.dispatchEvent(new CustomEvent('trigger-chat-topic', {
      detail: { topic: 'Tell me about the cooking school philosophy kha' }
    }));
  };

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

        {/* 1. HERO CONTENT */}
        <section className="mt-8 space-y-12 pb-12 md:pb-16">
          <HeroContentOverview
            imageUrl={pageMetadata?.imageUrl || g(2).image_url}
            onAskCherry={handleAskCherry}
          />

          {/* Shared sections — always visible */}
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

          {/* Book CTA */}
          <div className="flex justify-center pt-4">
            <Button
              variant="brand"
              size="lg"
              icon="calendar_month"
              onClick={() => onNavigate('booking')}
            >
              {t.classes.bookYourClass}
            </Button>
          </div>
        </section>

        <AkhaPixelLine />

        {/* 2. KITCHEN LIFE STREAM */}
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

        {/* 3. 6 Reasons to Join */}
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

        {/* 4. EXPLORE MORE - VIDEO */}
        <section className="space-y-12 py-12 md:py-16">
          <SmartHeaderSection
            sectionId="class-03"
            variant="section"
            align="center"
            gradientFrom="quiz-p"
            gradientTo="quiz-s"
            hideTitle={false}
            hideSubtitle={false}
            hideDivider={false}
            hideDescription={false}
          />
          <div className="w-full max-w-4xl mx-auto items-center">
            <Video
              variant="inline"
              videoId="j7kN7fw5OfY"
              title={t.classes.kitchenSpirit}
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
              card={{ id: 'm', title: t.classes.fullMenu, desc: t.classes.fullMenuDesc, link: 'recipes', image: g(0).image_url, icon: 'restaurant_menu' }}
            />
            <InfoCard
              layout="vertical"
              onNavigate={onNavigate}
              card={{ id: 'l', title: t.classes.location, desc: t.classes.locationDesc, link: 'location', image: g(1).image_url, icon: 'location_on' }}
            />
            <Video imageUrl={g(3).image_url} onClick={() => setShowVideo(true)} />
          </div>
        </section>

        {/* MODALS */}
        <VideoModal
          isOpen={showVideo}
          onClose={() => setShowVideo(false)}
          videoId="j7kN7fw5OfY"
          title={t.classes.kitchenSpirit}
          backgroundImage={g(3).image_url}
        />
        {selectedPhoto && (
          <PhotoModal
            isOpen={!!selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            image={selectedPhoto.image_url}
            title={selectedPhoto.title}
            description={selectedPhoto.description}
          />
        )}
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          items={galleryData}
          startIndex={0}
        />
      </div>
    </PageLayout>
  );
};

export default InfoClasses;
