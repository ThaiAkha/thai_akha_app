
import React, { useRef, useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Typography, Button, Icon, Badge, Card, InfoCard } from '../components/ui/index';
import AkhaPixelPattern from '../components/ui/AkhaPixelPattern';
import { useFrontHomeCards } from '../hooks/useFrontHomeCards';

const ICON_MAP: Record<string, string> = {
  home: 'Home',
  BookOpen: 'BookOpen',
  ChefHat: 'ChefHat',
  CalendarDays: 'CalendarDays',
  landmark: 'Landmark',
  MapPin: 'MapPin',
  trophy: 'Trophy',
};

const HomePage: React.FC<{ onNavigate: (p: string, t?: string) => void }> = ({ onNavigate }) => {
  const { cards, loading } = useFrontHomeCards();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayWelcome = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/voice_over/cherry_welcome_cherry_normal.wav');
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const ROW1_PATHS = ['/classes', '/recipes', '/booking'];
  const row1Cards = cards.filter(c => ROW1_PATHS.includes(c.target_path));
  const row2Cards = cards.filter(c => !ROW1_PATHS.includes(c.target_path));

  return (
    <PageLayout slug="home" loading={loading} showPatterns={true} hideDefaultHeader>
      <div className="space-y-24 pb-32">

        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-12 md:pt-20">
          <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-center mb-4">
              <Badge variant="brand" icon="star" pulse>Award Winning School</Badge>
            </div>

            <Typography variant="display1" className="text-gray-900 dark:text-white drop-shadow-2xl">
              Master the Art of <span className="text-primary italic">Akha</span> Cooking
            </Typography>

            <Typography variant="paragraphL" className="text-gray-600 dark:text-white/80 max-w-2xl mx-auto">
              A unique culinary journey from the misty mountains of the North to your personal cooking station in Chiang Mai.
            </Typography>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
              <Button
                variant="brand"
                size="lg"
                icon="calendar_month"
                onClick={() => onNavigate('classes')}
                className="shadow-brand-glow hover:scale-105 transition-transform"
              >
                Cooking Class
              </Button>
              <Button
                variant="brand"
                size="lg"
                icon="calendar_month"
                onClick={() => onNavigate('recipes')}
                className="shadow-brand-glow hover:scale-105 transition-transform"
              >
                Explore Recipes
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
            <div className="inline-flex items-center">
              <Badge variant="brand" icon="star" pulse>AI Expert Assistant</Badge>
            </div>

            <Typography variant="h2" className="text-gray-900 dark:text-white italic">
              Meet <span className="text-primary">Cherry</span>, Your Digital Host
            </Typography>

            <Typography variant="paragraphM" className="text-desc leading-relaxed">
              Available 24/7 via text or <strong>live voice</strong>, Cherry is our official cultural ambassador. She can help you choose recipes, manage dietary restrictions, or tell you the ancestral stories behind every dish.
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="interactive" padding="sm" rounded="xl" className="bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10">
                <Icon name="mic" className="text-primary mb-2" />
                <Typography variant="h5" className="text-gray-900 dark:text-white">Voice Live</Typography>
                <Typography variant="paragraphS" className="text-gray-500 dark:text-white/80">Real-time low-latency voice interaction.</Typography>
              </Card>
              <Card variant="interactive" padding="sm" rounded="xl" className="bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10">
                <Icon name="menu_book" className="text-action mb-2" />
                <Typography variant="h5" className="text-gray-900 dark:text-white">Recipe Expert</Typography>
                <Typography variant="paragraphS" className="text-gray-500 dark:text-white/80">Deep knowledge of our 11 signature dishes.</Typography>
              </Card>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative aspect-square rounded-[4rem] overflow-hidden border-2 border-gray-200 dark:border-white/10 shadow-2xl group">
            <img
              src="https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg"
              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
              alt="Cherry Assistant"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            {/* Overlay on dark image — keep text-white */}
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayWelcome}
                  title={isPlaying ? 'Stop' : 'Play welcome message'}
                  className={`size-12 rounded-full bg-primary flex items-center justify-center transition-transform hover:scale-110 ${isPlaying ? 'animate-pulse' : ''}`}
                >
                  <Icon name={isPlaying ? 'Volume2' : 'Play'} size="sm" />
                </button>
                <div>
                  <Typography variant="h5" className="font-black italic">CHERRY V5.0</Typography>
                  <Typography variant="caption" className="opacity-60">
                    {isPlaying ? 'Playing welcome...' : 'Tap to hear Cherry'}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-16 opacity-30">
          <AkhaPixelPattern variant="mountain" size={10} speed={60} expandFromCenter={true} />
        </div>

        {/* --- EXPLORE SECTION --- */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-primary pl-6">
            <div className="space-y-2">
              <Typography variant="h2" className="text-gray-900 dark:text-white uppercase tracking-tighter">
                Explore the <span className="text-primary">Kitchen</span>
              </Typography>
              <Typography variant="paragraphM" className="text-desc">Discover our classes, recipes, and heritage.</Typography>
            </div>
          </div>

          {/* Row 1 — 3 colonne verticali: Classes, Recipes, Booking */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading
              ? [1, 2, 3].map(i => <div key={i} className="h-48 rounded-3xl bg-gray-100 dark:bg-white/5 animate-pulse border border-gray-200 dark:border-white/10" />)
              : row1Cards.map(card => (
                <InfoCard
                  key={card.id}
                  card={{ id: card.id, title: card.title, desc: card.description, link: card.target_path.replace('/', ''), image: card.image_url, icon: ICON_MAP[card.icon_name] }}
                  layout="vertical"
                  onNavigate={onNavigate}
                />
              ))
            }
          </div>

          {/* Row 2 — 2 colonne orizzontali: card rimanenti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading
              ? [1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-3xl bg-gray-100 dark:bg-white/5 animate-pulse border border-gray-200 dark:border-white/10" />)
              : row2Cards.map(card => (
                <InfoCard
                  key={card.id}
                  card={{ id: card.id, title: card.title, desc: card.description, link: card.target_path.replace('/', ''), image: card.image_url, icon: ICON_MAP[card.icon_name] }}
                  layout="horizontal"
                  onNavigate={onNavigate}
                />
              ))
            }
          </div>
        </section>

        <div className="mt-16 opacity-30">
          <AkhaPixelPattern variant="mountain" size={10} speed={60} expandFromCenter={true} />
        </div>

        {/* --- TESTIMONIAL / CTA SECTION --- */}
        <section className="relative py-20 px-8 rounded-[4rem] overflow-hidden text-center bg-primary/5 border border-primary/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <Icon name="format_quote" size="xl" className="text-primary opacity-50" />
            <Typography variant="h3" className="text-gray-900 dark:text-white italic font-light leading-relaxed">
              "An unforgettable experience that goes far beyond just cooking. It's a deep immersion into a beautiful, resilient culture."
            </Typography>
            <div className="space-y-1">
              <Typography variant="h6" className="text-primary">Sarah Jenkins</Typography>
              <Typography variant="caption" className="text-gray-400 dark:text-white/40">Professional Food Traveler</Typography>
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
