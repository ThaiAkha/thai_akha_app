
import React, { useState, useEffect } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { PageLayout } from '../components/layout/PageLayout';
import {
  Button, Card, Typography, Badge, Icon, InfoCard,
  VideoModal, PhotoModal, Tabs
} from '../components/ui/index';
import GalleryModal, { GalleryItem } from '../components/modal/GalleryModal';
import { CookingClassDB } from '../types/index';
import { cn } from '@thaiakha/shared/lib/utils';
import HeaderMenu from '../components/layout/HeaderMenu';

interface InfoClassesProps {
  onNavigate: (page: string, topic?: string) => void;
}

type TabMode = 'overview' | 'morning' | 'evening';

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
  const [loading, setLoading] = useState(true);

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

  // Media modal state
  const [showVideo, setShowVideo] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const [classData, gallery] = await Promise.all([
          contentService.getCookingClasses(),
          contentService.getGalleryItems('kitchen_stream'),
        ]);

        const map: Record<string, CookingClassDB> = {};
        classData.forEach((item: CookingClassDB) => {
          map[item.id.replace('_class', '')] = item;
        });
        setClasses(map);
        setGalleryData(gallery);
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

  let startTime = "N/A";
  if (currentClass?.schedule_items) {
    const rawTimeStr = currentClass.schedule_items.find(s => s.label === "Class Time")?.time;
    if (rawTimeStr) {
      startTime = rawTimeStr.includes('>')
        ? (rawTimeStr.split('>').pop() || rawTimeStr).trim()
        : rawTimeStr.trim();
    }
  }

  const NAV_ITEMS = [
    { value: 'overview', label: 'Overview', icon: 'dashboard' },
    { value: 'morning', label: 'Morning Class', icon: 'wb_sunny' },
    { value: 'evening', label: 'Evening Class', icon: 'dark_mode' },
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
      <div className="w-full flex flex-col gap-8 md:gap-12">

        {/* 1. TABS */}
        <div className="pointer-events-auto drop-shadow-2xl">
          <Tabs
            items={NAV_ITEMS}
            value={activeTab}
            onChange={handleTabChange}
            variant="pills"
            className="scale-105"
          />
        </div>

        {/* 2. HERO CONTENT */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-[500px] flex">

          {activeTab === 'overview' ? (
            <Card variant="glass" padding="none" className="w-full rounded-[2.5rem] border-white/10 overflow-hidden flex flex-col lg:flex-row group shadow-2xl">

              <div className="w-full lg:w-5/12 relative h-64 md:h-96 lg:h-full overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
                <img
                  src={g(2).image_url}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                  alt="Overview"
                />
              </div>

              <div className="w-full lg:w-7/12 p-8 md:p-16 flex flex-col justify-center items-start bg-white/5 backdrop-blur-md">
                <span className="text-primary font-accent font-black uppercase tracking-[0.2em] text-xs mb-4">Sawasdee kha!</span>
                <Typography variant="display2" className="text-white italic mb-6 leading-none">
                  Welcome to the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Family Kitchen</span>
                </Typography>
                <Typography variant="paragraphL" className="text-desc opacity-80 mb-10">
                  We are not just a cooking school; we are a family sharing our heritage. Whether you choose the bustling <strong>Morning Market</strong> or the cozy <strong>Evening Feast</strong>, you will master 11 dishes and leave with a full heart.
                </Typography>
                <div className="flex flex-wrap gap-4 mt-auto">
                  <Button variant="brand" onClick={() => handleTabChange('morning')} icon="arrow_forward" iconPosition="right">Explore Classes</Button>
                  <Button variant="mineral" onClick={handleAskCherry} icon="chat">Ask Cherry</Button>
                </div>
              </div>
            </Card>

          ) : currentClass ? (
            <Card variant="glass" padding="none" className="w-full rounded-[3.5rem] border-white/10 overflow-hidden flex flex-col lg:flex-row shadow-2xl">

              <div className="w-full lg:w-5/12 relative h-64 md:h-[500px] lg:h-full overflow-hidden group shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
                <img src={currentClass.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={currentClass.title} />
                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <Badge variant="solid" className={activeTab === 'morning' ? 'bg-primary mb-4' : 'bg-secondary text-black mb-4'}>
                    {currentClass.badge}
                  </Badge>
                  <h2 className="text-5xl lg:text-6xl font-display font-black text-white italic uppercase tracking-tighter leading-[0.85] drop-shadow-xl">
                    {activeTab}<br /><span className={activeTab === 'morning' ? 'text-primary' : 'text-secondary'}>Session</span>
                  </h2>
                </div>
              </div>

              <div className="w-full lg:w-7/12 p-8 lg:p-12 flex flex-col bg-white/5 backdrop-blur-md h-full">
                <div className="flex flex-wrap gap-y-6 justify-between items-end border-b border-white/10 pb-6 mb-6 shrink-0">
                  <div className="flex gap-8 text-center">
                    <div>
                      <span className="block text-[10px] font-black uppercase text-desc/40 tracking-widest mb-1">Duration</span>
                      <span className="text-xl font-bold text-white">{currentClass.duration_text?.replace('duration', '') || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase text-desc/40 tracking-widest mb-1">Start Time</span>
                      <span className="text-xl font-bold text-white">{startTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-black uppercase text-desc/40 tracking-widest mb-1">Price / Person</span>
                    <span className={cn("text-4xl font-display font-black tracking-tight", activeTab === 'morning' ? "text-primary" : "text-secondary")}>
                      {currentClass.price.toLocaleString()} <span className="text-sm text-white/60 font-sans">THB</span>
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                  <div>
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Icon name="info" size="sm" className="opacity-70" /> About this class</h4>
                    <p className="text-desc/80 text-sm leading-relaxed">{currentClass.description}</p>
                  </div>
                  {currentClass.highlights && (
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <ul className="space-y-2">
                        {currentClass.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                            <Icon name="check_circle" size="xs" className={activeTab === 'morning' ? "text-primary shrink-0" : "text-secondary shrink-0"} />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10 shrink-0">
                  <Button variant="mineral" onClick={handleAskCherry} icon="chat" fullWidth>Ask Cherry</Button>
                  <Button
                    variant={activeTab === 'morning' ? 'brand' : 'action'}
                    onClick={() => onNavigate('booking')}
                    icon="calendar_month"
                    fullWidth
                    className={activeTab === 'evening' ? 'bg-secondary text-black hover:bg-white' : ''}
                  >
                    Book {activeTab}
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}
        </div>

        {/* 3. KITCHEN LIFE STREAM */}
        <section className="space-y-6">
          <Typography variant="h4" className="text-white font-black italic uppercase tracking-tighter px-2">
            Kitchen <span className="text-primary">Life Stream</span>
          </Typography>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {galleryData.slice(0, 4).map((item, index) => {
              if (index === 0) return (
                <div
                  key={item.photo_id ?? index}
                  onClick={() => setIsGalleryOpen(true)}
                  className="group relative aspect-square rounded-[2.5rem] overflow-hidden border-2 border-primary/30 cursor-pointer shadow-2xl hover:-translate-y-2 transition-all duration-500 isolate"
                >
                  <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] text-white font-black uppercase border border-white/10">View Gallery</span>
                  </div>
                </div>
              );

              return (
                <div
                  key={item.photo_id ?? index}
                  onClick={() => setSelectedPhoto(item)}
                  className="group relative aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 cursor-pointer shadow-lg hover:-translate-y-2 transition-all duration-500 isolate"
                >
                  <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Icon name="zoom_in" className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard layout="vertical" onNavigate={onNavigate} card={{ id: 'm', title: 'Full Menu', desc: 'Browse our 11 dishes.', link: 'recipes', image: g(0).image_url, icon: 'restaurant_menu' }} />
          <InfoCard layout="vertical" onNavigate={onNavigate} card={{ id: 'l', title: 'Location', desc: 'Pickup details.', link: 'location', image: g(1).image_url, icon: 'location_on' }} />

          <div onClick={() => setShowVideo(true)} className="relative h-64 rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl border border-white/10">
            <img src={g(3).image_url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-[2s]" alt="Watch Trailer" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="size-14 rounded-full bg-primary/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-3 group-hover:bg-white group-hover:text-black transition-all">
                <Icon name="play_arrow" size="md" />
              </div>
              <span className="text-white font-black uppercase text-sm tracking-widest italic">Watch Trailer</span>
            </div>
          </div>
        </div>

        {/* MODALS */}
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
    </PageLayout>
  );
};

export default InfoClasses;
