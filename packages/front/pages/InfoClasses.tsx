
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/layout/PageLayout';
import { 
  Button, Card, Typography, Badge, Icon, InfoCard, 
  VideoModal, PhotoModal, Tabs 
} from '../components/ui/index';
import GalleryModal, { GalleryItem } from '../components/ui/GalleryModal';
import { CookingClassDB } from '../types/index';
import { cn } from '../lib/utils';
import HeaderMenu from '../components/layout/HeaderMenu';

// --- FALLBACK DATA ---
const GALLERY_FALLBACK: GalleryItem[] = [
  {
    image_url: "https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Recipes01.jpg",
    title: "Market Fresh",
    description: "We select herbs daily at 08:30 am.",
    quote: "Freshness is the soul of Akha food.",
    icons: ["storefront", "eco"]
  },
  {
    image_url: "https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Spice04.jpg",
    title: "Mortar Rhythm",
    description: "Hand-pounded pastes release true flavor."
  },
  {
    image_url: "https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg",
    title: "Open Kitchen",
    description: "Cooking with the breeze."
  },
  {
    image_url: "https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Spice02.jpg",
    title: "Essential Spice",
    description: "Chili is life."
  },
];

interface InfoClassesProps {
  onNavigate: (page: string, topic?: string) => void;
}

type TabMode = 'overview' | 'morning' | 'evening';

const InfoClasses: React.FC<InfoClassesProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabMode>('overview');
  const [classes, setClasses] = useState<Record<string, CookingClassDB>>({});
  const [loading, setLoading] = useState(true);
  
  // Media State
  const [showVideo, setShowVideo] = useState(false);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        // 1. Fetch Classi
        const { data: classData } = await supabase.from('cooking_classes').select('*').eq('is_active', true);
        if (classData) {
          const map: Record<string, CookingClassDB> = {};
          classData.forEach((item: CookingClassDB) => {
            map[item.id.replace('_class', '')] = item;
          });
          setClasses(map);
        }

        // 2. Fetch Gallery
        const { data: galleryRes } = await supabase
          .from('gallery_items')
          .select('image_url, title, description, quote, icons')
          .eq('gallery_id', 'kitchen_stream')
          .order('display_order');
        
        setGalleryData(galleryRes && galleryRes.length > 0 ? galleryRes : GALLERY_FALLBACK);

      } catch (err) {
        setGalleryData(GALLERY_FALLBACK);
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
  
  // Parse sicuro dell'orario
  let startTime = "N/A";
  if (currentClass?.schedule_items) {
    const rawTimeStr = currentClass.schedule_items.find(s => s.label === "Class Time")?.time;
    if (rawTimeStr) {
      startTime = rawTimeStr.includes('>') 
        ? (rawTimeStr.split('>').pop() || rawTimeStr).trim() 
        : rawTimeStr.trim();
    }
  }

  // Configurazione Tabs
  const NAV_ITEMS = [
    { value: 'overview', label: 'Overview', icon: 'dashboard' },
    { value: 'morning', label: 'Morning Class', icon: 'wb_sunny' },
    { value: 'evening', label: 'Evening Class', icon: 'dark_mode' },
  ];

  return (
    <PageLayout 
      slug="classes" 
      loading={loading} // Controlla il sipario globale (Fiore Akha)
      showPatterns={true} 
      hideDefaultHeader={true}
      customHeader={<HeaderMenu customSlug="classes" />} 
    >
      
      {/* 1. DIET TABS (Sticky) */}
      <div className="w-full flex flex-col gap-8 md:gap-12">
      
        <div className="pointer-events-auto drop-shadow-2xl">
           <Tabs 
             items={NAV_ITEMS} 
             value={activeTab} 
             onChange={(v) => setActiveTab(v as TabMode)} 
             variant="pills"
             className="scale-105"
           />
        </div>

        {/* 2. HERO CONTENT */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-[500px] flex">
          
          {activeTab === 'overview' ? (
            // === OVERVIEW CARD ===
            <Card variant="glass" padding="none" className="w-full rounded-[2.5rem] border-white/10 overflow-hidden flex flex-col lg:flex-row group shadow-2xl">
              
              <div className="w-full lg:w-5/12 relative h-64 md:h-96 lg:h-full overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
                <img src="https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="Overview" />
              </div>

              <div className="w-full lg:w-7/12 p-8 md:p-16 flex flex-col justify-center items-start bg-white/5 backdrop-blur-md">
                <span className="text-primary font-accent font-black uppercase tracking-[0.2em] text-xs mb-4">Sawasdee kha!</span>
                <Typography variant="display2" className="text-white italic mb-6 leading-none">
                  Welcome to the <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Family Kitchen</span>
                </Typography>
                
                <Typography variant="paragraphL" className="text-desc opacity-80 mb-10">
                  We are not just a cooking school; we are a family sharing our heritage. Whether you choose the bustling <strong>Morning Market</strong> or the cozy <strong>Evening Feast</strong>, you will master 11 dishes and leave with a full heart.
                </Typography>

                <div className="flex flex-wrap gap-4 mt-auto">
                  <Button variant="brand" onClick={() => setActiveTab('morning')} icon="arrow_forward" iconPosition="right">Explore Classes</Button>
                  <Button variant="mineral" onClick={handleAskCherry} icon="chat">Ask Cherry</Button>
                </div>
              </div>
            </Card>

          ) : currentClass ? (
            // === CLASS DETAILS CARD ===
            <Card variant="glass" padding="none" className="w-full rounded-[3.5rem] border-white/10 overflow-hidden flex flex-col lg:flex-row shadow-2xl">
              
              <div className="w-full lg:w-5/12 relative h-64 md:h-[500px] lg:h-full overflow-hidden group shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
                <img src={currentClass.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={currentClass.title} />
                
                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <Badge variant="solid" className={activeTab === 'morning' ? 'bg-primary mb-4' : 'bg-secondary text-black mb-4'}>
                    {currentClass.badge}
                  </Badge>
                  <h2 className="text-5xl lg:text-6xl font-display font-black text-white italic uppercase tracking-tighter leading-[0.85] drop-shadow-xl">
                    {activeTab}<br/><span className={activeTab === 'morning' ? 'text-primary' : 'text-secondary'}>Session</span>
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
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Icon name="info" size="sm" className="opacity-70"/> About this class</h4>
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

        {/* 3. SHOWROOM STREAM */}
        <section className="space-y-6">
          <Typography variant="h4" className="text-white font-black italic uppercase tracking-tighter px-2">
            Kitchen <span className="text-primary">Life Stream</span>
          </Typography>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => {
              const item = galleryData[index] || GALLERY_FALLBACK[index % GALLERY_FALLBACK.length];
              
              if (index === 0) return (
                <div key={index} onClick={() => setIsGalleryOpen(true)} className="group relative aspect-square rounded-[2.5rem] overflow-hidden border-2 border-primary/30 cursor-pointer shadow-2xl hover:-translate-y-2 transition-all duration-500 isolate">
                  <img src={item.image_url} alt="Gallery" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"/>
                  <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] text-white font-black uppercase border border-white/10">View Gallery</span>
                  </div>
                </div>
              );

              return (
                <div key={index} onClick={() => setSelectedPhoto(item)} className="group relative aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 cursor-pointer shadow-lg hover:-translate-y-2 transition-all duration-500 isolate">
                  <img src={item.image_url} alt="Moment" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"/>
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
          {/* Fix: Accessing first element of GALLERY_FALLBACK array instead of the array itself kha */}
          <InfoCard layout="vertical" onNavigate={onNavigate} card={{ id: 'm', title: 'Full Menu', desc: 'Browse our 11 dishes.', link: 'recipes', image: GALLERY_FALLBACK[0].image_url, icon: 'restaurant_menu' }} />
          <InfoCard layout="vertical" onNavigate={onNavigate} card={{ id: 'l', title: 'Location', desc: 'Pickup details.', link: 'location', image: GALLERY_FALLBACK[1].image_url, icon: 'location_on' }} />
          
          <div onClick={() => setShowVideo(true)} className="relative h-64 rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl border border-white/10">
            <img src={GALLERY_FALLBACK[1].image_url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-[2s]" alt="Watch Trailer" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="size-14 rounded-full bg-primary/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-3 group-hover:bg-white group-hover:text-black transition-all"><Icon name="play_arrow" size="md" /></div>
              <span className="text-white font-black uppercase text-sm tracking-widest italic">Watch Trailer</span>
            </div>
          </div>
        </div>

        {/* MODALS */}
        <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} videoId="j7kN7fw5OfY" title="The Kitchen Spirit" />
        {selectedPhoto && <PhotoModal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} image={selectedPhoto.image_url} title="Kitchen Moment" />}
        <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} items={galleryData} startIndex={0} />

      </div>
    </PageLayout>
  );
};

export default InfoClasses;
