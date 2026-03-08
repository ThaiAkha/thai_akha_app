
import React, { useEffect, useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import InfoCard from '../components/ui/InfoCard';
import { Typography, Button, Icon, Badge, Card } from '../components/ui/index';
import { contentService } from '../services/contentService';
import AkhaPixelPattern from '../components/ui/AkhaPixelPattern';

const HomePage: React.FC<{ onNavigate: (p: string, t?: string) => void }> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const siteCards = await contentService.getHomeCards();
        setCards(siteCards || []);
      } catch (e) { 
        console.error("Failed to load home cards:", e); 
        // Fallback to empty to allow page to render
        setCards([]);
      } finally { 
        setLoading(false); 
      }
    };
    init();
  }, []);

  const mapData = (c: any) => ({
    id: c.id, title: c.title, desc: c.description || c.desc || "",
    link: c.link, image: c.image_url, icon: c.icon_name
  });

  return (
    <PageLayout slug="home" loading={loading} showPatterns={true}>
      <div className="space-y-24 pb-32">
        
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-12 md:pt-20">
          <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-center mb-4">
              <Badge variant="brand" icon="star" pulse>Award Winning School</Badge>
            </div>
            
            <Typography variant="display1" className="text-white drop-shadow-2xl">
              Master the Art of <span className="text-primary italic">Akha</span> Cooking
            </Typography>
            
            <Typography variant="paragraphL" className="text-white/80 max-w-2xl mx-auto">
              A unique culinary journey from the misty mountains of the North to your personal cooking station in Chiang Mai.
            </Typography>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
              <Button 
                variant="brand" 
                size="xl" 
                icon="calendar_month" 
                onClick={() => onNavigate('booking')}
                className="shadow-brand-glow hover:scale-105 transition-transform"
              >
                Book Your Class
              </Button>
              <Button 
                variant="mineral" 
                size="xl" 
                icon="chat" 
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic: "Tell me about the cooking school experience kha" } }))}
                className="hover:scale-105 transition-transform"
              >
                Talk to Cherry
              </Button>
            </div>
          </div>
          
          <div className="mt-16 opacity-30">
            <AkhaPixelPattern variant="mountain" size={10} speed={60} expandFromCenter={true} />
          </div>
        </section>

        {/* --- MEET CHERRY SECTION --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <Icon name="face" />
              <span className="font-accent font-black uppercase text-xs tracking-widest">AI Cultural Guide</span>
            </div>
            
            <Typography variant="h2" className="text-white italic">
              Meet <span className="text-primary">Cherry</span>, Your Digital Host
            </Typography>
            
            <Typography variant="paragraphM" className="text-desc leading-relaxed">
              Available 24/7 via text or <strong>live voice</strong>, Cherry is our official cultural ambassador. She can help you choose recipes, manage dietary restrictions, or tell you the ancestral stories behind every dish.
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="glass" padding="sm" className="bg-white/5 border-white/10">
                <Icon name="mic" className="text-primary mb-2" />
                <Typography variant="h6" className="text-white">Voice Live</Typography>
                <Typography variant="caption" className="text-white/40">Real-time low-latency voice interaction.</Typography>
              </Card>
              <Card variant="glass" padding="sm" className="bg-white/5 border-white/10">
                <Icon name="menu_book" className="text-action mb-2" />
                <Typography variant="h6" className="text-white">Recipe Expert</Typography>
                <Typography variant="caption" className="text-white/40">Deep knowledge of our 11 signature dishes.</Typography>
              </Card>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative aspect-square rounded-[4rem] overflow-hidden border-2 border-white/10 shadow-2xl group">
            <img 
              src="https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg" 
              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" 
              alt="Cherry Assistant" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="flex items-center gap-4">
                 <div className="size-12 rounded-full bg-primary flex items-center justify-center animate-pulse">
                   <Icon name="graphic_eq" />
                 </div>
                 <div>
                   <Typography variant="h5" className="font-black italic">CHERRY V5.0</Typography>
                   <Typography variant="caption" className="opacity-60">Low Latency Mode Enabled</Typography>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- EXPLORE SECTION --- */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-primary pl-6">
            <div className="space-y-2">
              <Typography variant="h2" className="text-white uppercase tracking-tighter">
                Explore the <span className="text-primary">Kitchen</span>
              </Typography>
              <Typography variant="paragraphM" className="text-desc">Discover our classes, recipes, and heritage.</Typography>
            </div>
            <Button variant="mineral" icon="arrow_forward" onClick={() => onNavigate('classes')}>View All Info</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.length > 0 ? (
              cards.map((card, i) => (
                <InfoCard key={i} card={mapData(card)} onNavigate={onNavigate} layout="vertical" />
              ))
            ) : (
              // Skeletons if no cards found
              [1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
              ))
            )}
          </div>
        </section>

        {/* --- TESTIMONIAL / CTA SECTION --- */}
        <section className="relative py-20 px-8 rounded-[4rem] overflow-hidden text-center bg-primary/5 border border-primary/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <Icon name="format_quote" size="xl" className="text-primary opacity-50" />
            <Typography variant="h3" className="text-white italic font-light leading-relaxed">
              "An unforgettable experience that goes far beyond just cooking. It's a deep immersion into a beautiful, resilient culture."
            </Typography>
            <div className="space-y-1">
              <Typography variant="h6" className="text-primary">Sarah Jenkins</Typography>
              <Typography variant="caption" className="text-white/40">Professional Food Traveler</Typography>
            </div>
            
            <div className="pt-8">
              <Button variant="brand" size="xl" onClick={() => onNavigate('booking')}>Start Your Journey</Button>
            </div>
          </div>
        </section>

      </div>
    </PageLayout>
  );
};

export default HomePage;
