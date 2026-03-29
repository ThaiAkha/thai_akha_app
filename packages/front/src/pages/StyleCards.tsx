import React, { useEffect, useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import {
  Badge,
  Button,
  Card,
  Divider,
  Typography
} from '../components/ui/index';
// Assicurati che l'import di HeaderSection sia corretto in base alla tua struttura cartelle
import { HeaderSection } from "../components/layout/HeaderSection";
import { contentService } from '@thaiakha/shared/services';

const TYPOGRAPHY_VARIANTS = [
  'display1', 'display2', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'titleMain', 'titleHighlight', 'paragraphL', 'paragraphM',
  'paragraphS', 'body', 'accent', 'badge', 'caption', 'quote',
  'numericPrice', 'numericStat', 'numericRegular'
] as const;

const TABS = [
  { value: 'typography', label: 'Typography' },
  { value: 'ui', label: 'UI Components' },
  { value: 'layout', label: 'Layout & Headers' },
  { value: 'auth', label: 'Auth' },
  { value: 'booking', label: 'Booking' },
  { value: 'chat', label: 'Chat' },
];

type TabValue = 'typography' | 'auth' | 'booking' | 'chat' | 'classes' | 'layout' | 'menu' | 'modal' | 'quiz' | 'recipes' | 'ui' | 'user-dashboard';

const StyleCards: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('typography');

  useEffect(() => {
    // Simulazione caricamento
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Helper per i titoli di sezione interni
  const SectionHead = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="border-b pb-4 mb-8 border-border">
      <Typography variant="h2" color="primary" className="uppercase tracking-tight font-black">
        {title}
      </Typography>
      {subtitle && <Typography variant="caption" color="muted">{subtitle}</Typography>}
    </div>
  );

  // ==========================================
  // RENDER: TYPOGRAPHY
  // ==========================================
  const renderTypography = () => (
    <div className="space-y-12">
      <SectionHead title="Typography System" subtitle="Tutte le varianti del componente centrale <Typography>" />
      <div className="flex flex-col gap-8">
        {TYPOGRAPHY_VARIANTS.map((variant) => (
          <div key={variant} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-border bg-surface-2">
            <div className="w-48 shrink-0">
              <Badge variant="solid" color="secondary">{variant}</Badge>
            </div>
            <div className="flex-1 overflow-hidden">
              <Typography variant={variant} color="title">
                {variant.includes('numeric') ? '1,400 THB / 95%' : 'The quick brown fox jumps over the lazy dog'}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ==========================================
  // RENDER: UI COMPONENTS (Badge)
  // ==========================================
  const renderUI = () => (
    <div className="space-y-16">
      <SectionHead title="Badges & Tags" subtitle="Il nuovo componente Badge con supporto al Glassmorphism (Mineral)" />

      {/* SOLID BADGES */}
      <div className="space-y-4">
        <Typography variant="h4" color="title">Solid Variant</Typography>
        <div className="flex flex-wrap gap-4">
          <Badge variant="solid" color="primary">Primary</Badge>
          <Badge variant="solid" color="action">Action</Badge>
          <Badge variant="solid" color="secondary">Secondary</Badge>
          <Badge variant="brand">Brand Glow</Badge>
        </div>
      </div>

      {/* MINERAL BADGES (Su sfondo scuro per mostrare il vetro) */}
      <div className="space-y-4">
        <Typography variant="h4" color="title">Mineral Variant (Glassmorphism)</Typography>
        <Typography variant="body" color="sub" className="mb-4">
          Sfondo fotografico per testare la sfocatura e l'adattabilità cromatica dei bordi.
        </Typography>
        <div className="p-12 rounded-3xl bg-[url('https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/bg-03.webp')] bg-cover bg-center shadow-inner relative overflow-hidden">
          {/* Overlay scuro per contrasto */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

          <div className="relative z-10 flex flex-wrap gap-4">
            <Badge variant="mineral" color="primary">Primary Mineral</Badge>
            <Badge variant="mineral" color="action">Action Mineral</Badge>
            <Badge variant="mineral" color="quiz-p">Quiz Magenta</Badge>
            <Badge variant="mineral" color="quiz-s">Quiz Purple</Badge>
            <Badge variant="mineral" color="btn-s">Blue Light</Badge>
            <Badge variant="mineral" color="allergy">Allergy Alert</Badge>
          </div>
        </div>
      </div>

      {/* SIZES */}
      <div className="space-y-4">
        <Typography variant="h4" color="title">Sizes</Typography>
        <div className="flex flex-wrap items-end gap-4">
          <Badge variant="mineral" color="quiz-p" size="xs">Extra Small</Badge>
          <Badge variant="mineral" color="action" size="sm">Small</Badge>
          <Badge variant="mineral" color="quiz-p" size="md">Medium (Default)</Badge>
          <Badge variant="mineral" color="action" size="lg">Large</Badge>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // RENDER: LAYOUT & HEADERS
  // ==========================================
  const renderLayout = () => (
    <div className="space-y-24">
      <SectionHead title="Header Sections" subtitle="Varianti e gradienti del componente HeaderSection aggiornato" />

      {/* Variante 1: Hero con Colori Default (Primary -> Action) */}
      <Card className="p-8 border-dashed border-2 border-border/50 bg-transparent shadow-none">
        <HeaderSection
          variant="hero"
          align="center"
          tag="Hero Component"
          title="Authentic Cooking"
          highlight="Experience"
          subtitle="The original Cherry Red to Lime Green gradient"
          description="Questa è la variante 'hero' che usa i font più grandi (display1/titleMain) ed è perfetta per l'inizio della pagina."
        />
      </Card>

      {/* Variante 2: Section con gradienti custom (Quiz Magenta -> Quiz Purple) */}
      <Card className="p-8 bg-surface shadow-sm">
        <HeaderSection
          variant="section"
          align="left"
          tag="Custom Gradient"
          title="Master The"
          highlight="Akha Kitchen"
          subtitle="Utilizza i colori del dominio Quiz"
          gradientFrom="quiz-p"
          gradientTo="quiz-s"
          description="Allineamento a sinistra (align='left'). Guarda come il Badge 'mineral' in alto ha assorbito automaticamente il colore viola di destinazione (quiz-s) per i suoi bordi e il suo testo!"
        />
      </Card>

      {/* Variante 3: History con gradiente Tropicale (Action -> Btn-S) */}
      <Card className="p-8 bg-surface-2 shadow-sm">
        <HeaderSection
          variant="history"
          align="right"
          tag="Tropical Vibes"
          title="Discover our"
          highlight="Hidden Secrets"
          gradientFrom="action"
          gradientTo="btn-s"
          description="Variante 'history' allineata a destra. Usa un gradiente personalizzato dal verde Lime (action) all'Azzurro (btn-s)."
        />
      </Card>

      {/* Variante 4: Senza Badge e senza Subtitle, solo titolo pulito */}
      <Card className="p-8 bg-surface shadow-sm">
        <HeaderSection
          variant="section"
          align="center"
          title="Pure Typography"
          highlight="Without Distractions"
          gradientFrom="btn-p"
          gradientTo="allergy"
          hideSubtitle={true}
          description="Esempio di utilizzo pulito passando gradientFrom='btn-p' (Orange) a gradientTo='allergy'. Perfetto per blocchi testuali intermedi."
        />
      </Card>
    </div>
  );

  return (
    <PageLayout
      slug="styleguide"
      hideDefaultHeader={true}
      customMetadata={{
        titleMain: 'Style',
        titleHighlight: 'Guide',
        description: 'Sistema di design completo — tipografia, componenti, colori e interazioni',
        icon: 'palette',
        imageUrl: '',
        badge: 'v2.0'
      }}
    >
      <div className="max-w-7xl mx-auto py-8">

        {/* MENU A TAB ORIZZONTALE */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-border pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as TabValue)}
              className={`px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 ${activeTab === tab.value
                ? 'bg-primary text-white shadow-brand-glow'
                : 'bg-surface-2 text-sub hover:bg-border hover:text-title'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENUTO DELLE TAB */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Typography variant="h4" color="muted" className="animate-pulse">
              Caricamento componenti...
            </Typography>
          </div>
        ) : (
          <div className="animate-fade-slide-up">
            {activeTab === 'typography' && renderTypography()}
            {activeTab === 'ui' && renderUI()}
            {activeTab === 'layout' && renderLayout()}

            {/* Fallback per tab in costruzione */}
            {['auth', 'booking', 'chat'].includes(activeTab) && (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                <Typography variant="h3" color="muted">
                  Componenti in fase di ripristino...
                </Typography>
              </div>
            )}
          </div>
        )}

      </div>
    </PageLayout>
  );
};

export default StyleCards;
