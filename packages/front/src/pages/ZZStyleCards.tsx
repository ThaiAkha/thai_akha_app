import React, { useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { PageLayout } from '../components/layout/PageLayout';
import { Badge, Button, Typography, Icon, AkhaPixelPattern } from '../components/ui/index';
import StickyTabNav from '../components/layout/StickyTabNav';
import Header from '../components/layout/Header';
import HeaderMenu from '../components/layout/HeaderMenu';
import { HeaderSection } from '../components/layout/HeaderSection';
import { SmartHeaderSection } from '../components/layout/SmartHeaderSection';
import Avatar from '../components/ui/navigation/Avatar';
import Chip from '../components/ui/navigation/Chip';
import Toggle from '../components/ui/navigation/Toggle';
import Tabs from '../components/ui/navigation/Tabs';
import Pagination from '../components/ui/navigation/Pagination';
import Tooltip from '../components/ui/navigation/Tooltip';
import AkhaLoader from '../components/divider/AkhaLoader';
import AkhaPixelLine from '../components/divider/AkhaPixelLine';
import AkhaQuote from '../components/divider/AkhaQuote';
import AkhaThemedLine from '../components/divider/AkhaThemedLine';
import AkhaButtonLine from '../components/divider/AkhaButtonLine';
import Divider from '../components/divider/Divider';
import { AKHA_PATTERNS } from '@thaiakha/shared';
import { AKHA_THEMES, AkhaTheme } from '../components/divider/AkhaPixelPattern';
// Skeleton atoms
import { SkeletonBase, SkeletonText, SkeletonTitle, SkeletonDivider } from '../components/skeleton/atoms/index';
// Skeleton compositions
import { BlogGridSkeleton, ArticleDetailSkeleton, SkeletonHeader } from '../components/skeleton/compositions/index';
// Quiz components
import ButtonQuiz from '../components/quiz/ButtonQuiz';
import HeaderQuiz from '../components/quiz/HeaderQuiz';
import QuizCard from '../components/quiz/QuizCard';
import LevelQuiz from '../components/quiz/LevelQuiz';
import PlayQuiz from '../components/quiz/PlayQuiz';
import ResultQuiz from '../components/quiz/ResultQuiz';
import type { QuizLevel, QuizModule } from '@thaiakha/shared';
import { AskCherryButton } from '../components/chat/AskCherryButton';
import FaqBottomPage from '../components/faq/FaqBottomPage';
import StyleColorsTab from './style-cards/StyleColorsTab';

// Card components
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card/Card';
import InfoCard from '../components/ui/card/InfoCard';
import StatCard from '../components/ui/card/StatCard';
import Alert from '../components/ui/card/Alert';
import { GlassCard } from '../components/ui/index';

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

const MOCK_MODULE: QuizModule = {
  id: 'mod-1',
  title: 'Northern Spices',
  icon: 'local_fire_department',
  theme: 'Flavor Science',
  questions: [
    {
      id: 'q1',
      text: 'Which spice gives Khao Soi its distinctive golden colour?',
      options: [{ label: 'Turmeric' }, { label: 'Curry Powder' }, { label: 'Saffron' }],
      correctAnswer: 'Turmeric',
      questionType: 'single',
      explanation: 'Turmeric (ขมิ้น) is the key spice responsible for the golden hue in Khao Soi broth.',
      points: 10,
    },
    {
      id: 'q2',
      text: 'What is the Akha word for chilli pepper?',
      options: [{ label: 'Prik' }, { label: 'Kapi' }, { label: 'Nam Pla' }],
      correctAnswer: 'Prik',
      questionType: 'single',
      explanation: 'Prik (พริก) is the Thai/Akha word commonly used for chilli peppers.',
      points: 10,
    },
    {
      id: 'q3',
      text: 'Which herb is essential for authentic Thai basil stir-fry?',
      options: [{ label: 'Holy Basil' }, { label: 'Sweet Basil' }, { label: 'Lemon Basil' }],
      correctAnswer: 'Holy Basil',
      questionType: 'single',
      explanation: 'Holy basil (กะเพรา) is the authentic choice for Pad Kra Pao, not sweet or lemon basil.',
      points: 10,
    },
  ],
};

const MOCK_MODULE_2: QuizModule = {
  id: 'mod-2',
  title: 'Akha Traditions',
  icon: 'temple_buddhist',
  theme: 'Cultural Heritage',
  questions: [],
};

const MOCK_MODULE_3: QuizModule = {
  id: 'mod-3',
  title: 'Market Wisdom',
  icon: 'storefront',
  theme: 'Street Food',
  questions: [],
};

const MOCK_LEVEL: QuizLevel = {
  id: 1,
  display_order: 1,
  title: 'The Akha Path',
  subtitle: 'Master the foundations of Northern Thai cuisine and unlock your culinary heritage.',
  image: '/avatarCherry/600-Avatar-AuthPage.webp',
  modules: [MOCK_MODULE, MOCK_MODULE_2, MOCK_MODULE_3],
  rewardId: 1,
  completion_bonus: 50,
  is_active: true,
};

const MOCK_FEATURED_DATA = [
  { id: 'classes', title: 'Cooking Classes', desc: 'Master the art of Akha and Thai cuisine with our award-winning morning or evening sessions.', link: 'classes', image: '/avatarCherry/600-Avatar-AuthPage.webp', icon: 'restaurant' },
  { id: 'recipes', title: 'Traditional Recipes', desc: 'Explore our family cookbook featuring 11 authentic recipes passed down through generations.', link: 'recipes', image: '', icon: 'menu_book' },
  { id: 'culture', title: 'Akha Heritage', desc: 'Dive deep into the rich traditions, vibrant spirit, and unique history of the Akha people.', link: 'culture', image: '/avatarCherry/600-Avatar-AuthPage.webp', icon: 'temple_buddhist' },
  { id: 'cherry', title: 'Meet Cherry', desc: 'The soul of our kitchen. Discover her journey and the philosophy behind Thai Akha Kitchen.', link: 'about', image: '', icon: 'volunteer_activism' },
];

const MOCK_REWARDS = [
  { id: 1, label: 'First Steps', icon: 'star', required_points: 50 },
  { id: 2, label: 'Spice Master', icon: 'local_fire_department', required_points: 100 },
  { id: 3, label: 'Temple Visit', icon: 'temple_buddhist', required_points: 200 },
  { id: 4, label: 'Market Expert', icon: 'storefront', required_points: 300 },
  { id: 5, label: 'Chef Hat', icon: 'restaurant', required_points: 400 },
  { id: 6, label: 'Gold Medal', icon: 'emoji_events', required_points: 500 },
  { id: 7, label: 'Cherry Fan', icon: 'favorite', required_points: 700 },
  { id: 8, label: 'Guardian', icon: 'shield', required_points: 1000 },
];

const TYPOGRAPHY_VARIANTS = [
  'display1', 'display2', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'titleMain', 'titleHighlight', 'paragraphL', 'paragraphM',
  'paragraphS', 'body', 'accent', 'badge', 'quote', 'caption',
  'microLabel', 'fieldLabel',
  'numericPrice', 'numericStat', 'numericMedium', 'numericRegular'
] as const;

type TabValue = 'colors' | 'typography' | 'ui' | 'skeleton' | 'layout' | 'quiz' | 'card' | 'patterns' | 'cherry' | 'faq';

const NAV_TABS = [
  { value: 'colors', label: 'Colors & Tokens', icon: 'palette' },
  { value: 'typography', label: 'Typography', icon: 'text_fields' },
  { value: 'ui', label: 'UI Components', icon: 'widgets' },
  { value: 'patterns', label: 'Patterns & Dividers', icon: 'line_style' },
  { value: 'card', label: 'Cards & Alerts', icon: 'view_agenda' },
  { value: 'skeleton', label: 'Skeleton', icon: 'motion_photos_off' },
  { value: 'layout', label: 'Layout & Headers', icon: 'dashboard' },
  { value: 'quiz', label: 'Quiz', icon: 'psychology' },
  { value: 'cherry', label: 'Cherry AI', icon: 'smart_toy' },
  { value: 'faq', label: 'FAQ', icon: 'quiz' },
];

// FAQ showcase mock — cooking class questions (Thai Akha Kitchen)
const MOCK_FAQ = [
  { q: 'How do I book a cooking class?', a: 'Pick a date on the booking page, choose morning or evening, select the number of seats and confirm. You receive an instant email confirmation with the meeting point.', cat: 'Booking' },
  { q: 'Is hotel pickup included?', a: 'Yes — free pickup from most hotels within Chiang Mai old city and Nimman area. Add your hotel name during checkout and our driver will meet you in the lobby.', cat: 'Logistics' },
  { q: 'Do you offer vegan and vegetarian options?', a: 'Absolutely. Every dish can be adapted to vegan, vegetarian, halal or gluten-free. Tell us your dietary needs when booking and Cherry will adjust the menu.', cat: 'Menu' },
  { q: 'What is the difference between morning and evening class?', a: 'The morning class includes a local market tour before cooking 6 dishes. The evening class skips the market and focuses on a relaxed twilight session with family recipes.', cat: 'Classes' },
  { q: 'Can children join the class?', a: 'Yes, children are welcome with a participating adult. We provide a gentler station and non-spicy versions of each dish.', cat: 'Classes' },
];

// FAQ topic categories
const MOCK_FAQ_TOPICS = [
  { icon: 'event_available', title: 'Booking & Payment', count: 8 },
  { icon: 'directions_car', title: 'Pickup & Logistics', count: 5 },
  { icon: 'restaurant_menu', title: 'Menu & Diet', count: 11 },
  { icon: 'group', title: 'Groups & Private', count: 4 },
];

// Shape per FaqBottomPage (blocco FAQ reale di fine pagina): { name, acceptedAnswer: { text } }
const MOCK_FAQ_BOTTOM = MOCK_FAQ.map((f) => ({ name: f.q, acceptedAnswer: { text: f.a } }));

const StyleCards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('colors');

  // UI state
  const [toggleA, setToggleA] = useState(false);
  const [toggleB, setToggleB] = useState(true);
  const [chipActive, setChipActive] = useState('vegan');
  const [tabsValue, setTabsValue] = useState('menu');
  const [tabsPillValue, setTabsPillValue] = useState('bookings');
  const [page, setPage] = useState(2);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // ── helpers ────────────────────────────────────────────────────────────────

  const SectionHead = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="border-b border-border pb-4 mb-10">
      <Typography variant="h2" color="primary" className="uppercase tracking-tight font-black">{title}</Typography>
      {subtitle && <Typography variant="caption" color="muted">{subtitle}</Typography>}
    </div>
  );

  // ── PATTERNS ──────────────────────────────────────────────────────────────

  const renderPatterns = () => (
    <div className="space-y-24">
      <SectionHead title="Divider System Showroom" subtitle="Esplorazione completa dei componenti AkhaPixelLine e AkhaPixelPattern in contesti reali." />

      {/* 1. DIMENSIONI E RESPONSIVITÀ */}
      <div>
        <SubHead title="1. Responsive & Spacing System" />
        <PropDoc text="I divider si adattano al contenitore. Usando la prop 'fill' diventano 100% responsive. Spaziatura e dimensioni fisiche dei pixel ('size') sono personalizzabili." />

        <div className="space-y-12">
          {/* Full Width / Truncated Responsive */}
          <div className="space-y-4">
            <Typography variant="h5" color="title">Responsive Truncate (Fixed Size + Overflow Hidden)</Typography>
            <Typography variant="paragraphS" color="sub">La linea usa una dimensione fissa che scala in base al dispositivo (es. size 6 su mobile, 8 su tablet, 12 su desktop), ed è contenuta in un wrapper con <code>overflow-hidden</code> che la taglia morbidamente ai lati.</Typography>
            
            {['akha', 'history', 'news', 'kitchen'].map((t) => (
              <div key={`full-${t}`} className="bg-surface-2 p-8 rounded-3xl w-full border border-border">
                <Typography variant="caption" color="muted" className="block mb-4 uppercase">Theme: {t}</Typography>
                <div className="w-full overflow-hidden flex items-center justify-center">
                  {/* Mobile */}
                  <div className="block md:hidden w-max">
                    <AkhaPixelPattern variant="line_divider" size={6} theme={t as AkhaTheme} />
                  </div>
                  {/* Tablet */}
                  <div className="hidden md:block lg:hidden w-max">
                    <AkhaPixelPattern variant="line_divider" size={8} theme={t as AkhaTheme} />
                  </div>
                  {/* Desktop */}
                  <div className="hidden lg:block w-max">
                    <AkhaPixelPattern variant="line_divider" size={12} theme={t as AkhaTheme} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sizing standard in 4 colors */}
          <div className="space-y-4">
            <Typography variant="h5" color="title">Standard Sizing (4 Temi)</Typography>
            <Typography variant="paragraphS" color="sub">Standard consigliati: 6px (Micro), 8px (Small), 12px (Medium), 16px (Hero). Esposti in tutte le colorazioni.</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {['akha', 'history', 'news', 'kitchen'].map((t) => (
                <React.Fragment key={`sizing-${t}`}>
                  <DemoBox label={`size={6} (${t})`}>
                    <div className="flex items-center gap-4">
                      <Typography variant="caption" color="muted">TEXT</Typography>
                      <AkhaPixelPattern variant="line_simple" size={6} theme={t as AkhaTheme} />
                    </div>
                  </DemoBox>
                  <DemoBox label={`size={8} (${t})`}>
                    <AkhaPixelLine geometry="none" length="short" size={8} theme={t as AkhaTheme} />
                  </DemoBox>
                  <DemoBox label={`size={12} (${t})`}>
                    <AkhaPixelLine geometry="wok" length="medium" size={12} theme={t as AkhaTheme} />
                  </DemoBox>
                  <DemoBox label={`size={16} (${t})`}>
                    <div className="flex justify-center">
                      <AkhaPixelPattern variant="flower" size={16} theme={t as AkhaTheme} />
                    </div>
                  </DemoBox>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Linee semplici scalate */}
          <div className="space-y-4 mt-8">
            <Typography variant="h5" color="title">Linee Semplici (Scala Dimensioni 12 → 3)</Typography>
            <Typography variant="paragraphS" color="sub">Esempi della variante <code>line_simple</code> (la linea sfumata usata negli header) in tutte le misurazioni per mostrare la scalabilità vettoriale del pixel pattern.</Typography>
            <div className="bg-surface-2 p-8 rounded-3xl space-y-6">
              {[12, 10, 8, 6, 5, 4, 3].map((s) => (
                <div key={s} className="flex items-center justify-between gap-8 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <Typography variant="caption" color="muted" className="w-16">size={s}</Typography>
                  <div className="flex-1 overflow-hidden flex items-center justify-center">
                    <AkhaPixelPattern variant="line_simple_medium" size={s} theme="history" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gap Control (Automatico) */}
          <div className="space-y-4">
            <Typography variant="h5" color="title">Regola Aurea della Spaziatura</Typography>
            <Typography variant="paragraphS" color="sub">La spaziatura tra i pixel non è più fissa. Abbiamo stabilito una regola geometrica per mantenere la purezza del design: <strong>Il gap è sempre esattamente la metà della dimensione del pixel (gap = size / 2)</strong>. Il componente calcola questo valore automaticamente.</Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <DemoBox label="size={4} → gap 2px">
                <AkhaPixelPattern variant="diamond" size={4} />
              </DemoBox>
              <DemoBox label="size={8} → gap 4px">
                <AkhaPixelPattern variant="diamond" size={8} />
              </DemoBox>
              <DemoBox label="size={12} → gap 6px">
                <AkhaPixelPattern variant="diamond" size={12} />
              </DemoBox>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERATTIVITÀ */}
      <div>
        <SubHead title="2. Interactive Zoom (Hover 105% / 125%)" />
        <PropDoc text="Abilitando la prop 'interactive' su AkhaPixelPattern o AkhaPixelLine, i singoli pixel si ingrandiranno al passaggio del mouse creando un effetto dinamico bellissimo. Prova a passare il mouse sul wok!" />
        
        <div className="bg-surface-2 p-12 rounded-3xl flex justify-center border border-border">
          <AkhaPixelLine 
            length="long" 
            geometry="wok" 
            theme="kitchen" 
            size={14} 
            interactive={true} 
          />
        </div>
      </div>

      {/* 3. CONTESTI DI UTILIZZO REALI */}
      <div>
        <SubHead title="3. Esempi di Layout Reali" />
        <PropDoc text="Come si comportano i divider quando inseriti in griglie strette, schede o layout complessi." />

        <div className="space-y-12">
          {/* Card a 3 Colonne */}
          <div className="space-y-4">
            <Typography variant="h5" color="title">Dentro Schede: Griglia 3 Colonne</Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Articolo {i}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Typography variant="paragraphS" color="default">
                      Contenuto della card molto interessante. Il divider si restringe in automatico overflow-hidden.
                    </Typography>
                    <AkhaPixelLine geometry="flower" length="short" size={6} theme="history" />
                    <Typography variant="caption" color="muted">Continua a leggere...</Typography>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Layout a 2 Colonne asimmetrico */}
          <div className="space-y-4">
            <Typography variant="h5" color="title">Layout Asimmetrico (Es. Dettaglio Classe)</Typography>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 bg-surface-2 p-8 rounded-3xl">
                <Typography variant="h3" color="title" className="mb-6">Morning Class</Typography>
                <AkhaPixelLine geometry="mountain" length="long" size={10} theme="akha" />
                <Typography variant="paragraphM" color="default" className="mt-6">
                  Scopri le tradizioni millenarie del popolo Akha...
                </Typography>
              </div>
              <div className="md:col-span-4 bg-primary/5 p-8 rounded-3xl border border-primary/20">
                <Typography variant="h5" color="primary" className="mb-4">Informazioni</Typography>
                <AkhaPixelPattern variant="line_simple" fill theme="akha" />
                <div className="mt-4 space-y-2">
                  <Typography variant="body" color="title">Orario: 09:00 - 13:00</Typography>
                  <Typography variant="body" color="title">Prezzo: 1,400 THB</Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Sezione FAQ */}
          <div className="space-y-4">
            <Typography variant="h5" color="title">Lista FAQ (Standard Divider vs Pixel Divider)</Typography>
            <div className="bg-surface p-8 rounded-3xl border border-border space-y-6 max-w-3xl">
              <div>
                <Typography variant="h6" color="title">Come posso prenotare?</Typography>
                <Typography variant="paragraphS" color="default" className="mt-2">Puoi prenotare direttamente dal nostro sito.</Typography>
              </div>
              <Divider variant="default" />
              <div>
                <Typography variant="h6" color="title">Siete aperti la domenica?</Typography>
                <Typography variant="paragraphS" color="default" className="mt-2">Sì, la cucina non dorme mai.</Typography>
              </div>
              <AkhaPixelPattern variant="line_simple" fill theme="news" className="my-6 opacity-30" />
              <div>
                <Typography variant="h6" color="title">Offrite opzioni vegane?</Typography>
                <Typography variant="paragraphS" color="default" className="mt-2">Assolutamente sì, ogni piatto può essere adattato.</Typography>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. CATALOGO COMPLETO GEOMETRIE */}
      <div>
        <SubHead title="4. Catalogo Completo Geometrie (pixelPatterns.ts)" />
        <PropDoc text="Elenco esaustivo di tutti i pattern geometrici definiti nel monorepo." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(AKHA_PATTERNS).map((variantName) => (
            <DemoBox key={variantName} label={`variant: ${variantName}`}>
              <div className="flex justify-center items-center min-h-[40px] w-full overflow-hidden">
                <AkhaPixelPattern variant={variantName as any} size={8} theme="history" />
              </div>
            </DemoBox>
          ))}
        </div>
      </div>

      {/* 5. CATALOGO COMPLETO TEMI COLORE */}
      <div>
        <SubHead title="5. Catalogo Completo Temi Colore" />
        <PropDoc text="Tutte le palette disponibili nel sistema, applicate alla stessa geometria per confronto." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.keys(AKHA_THEMES).map((themeName) => (
            <DemoBox key={themeName} label={`theme: ${themeName}`}>
              <AkhaPixelLine length="medium" geometry="flower" theme={themeName as any} size={10} />
            </DemoBox>
          ))}
        </div>
      </div>

      {/* 6. COMPONENTI UI EVOLUTI */}
      <div>
        <SubHead title="6. Tutti i Componenti Esistenti" />
        <PropDoc text="Elenco di tutti i componenti di alto livello che sfruttano il motore dei pixel." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DemoBox label="<AkhaLoader />">
            <AkhaLoader variant="bloom" size={8} />
          </DemoBox>
          <DemoBox label="<AkhaQuote />">
            <AkhaQuote variant="main">The path to Akha wisdom starts in the kitchen.</AkhaQuote>
          </DemoBox>
          <DemoBox label="<AkhaThemedLine />">
            <AkhaThemedLine theme="kitchen" />
          </DemoBox>
          <DemoBox label="<AkhaButtonLine theme='kitchen' />">
            <AkhaButtonLine label="Start Cooking" theme="kitchen" icon="restaurant" />
          </DemoBox>
          <DemoBox label="<AkhaButtonLine /> (Test Cmd+Click)">
            <AkhaButtonLine 
              label="Check FAQ (Cmd+Click me)" 
              theme="block_faq" 
              href="/faq"
            />
          </DemoBox>
          <DemoBox label="<Divider variant='brand' />">
            <Divider variant="brand" />
          </DemoBox>
          <DemoBox label="<Divider variant='gradient' />">
            <Divider variant="gradient" />
          </DemoBox>
        </div>
      </div>


    </div>
  );

  const SubHead = ({ title }: { title: string }) => (
    <Typography variant="h4" color="title" className="mb-4 mt-10">{title}</Typography>
  );

  const PropDoc = ({ text }: { text: string }) => (
    <Typography variant="paragraphS" color="sub" className="mb-6">
      {text}
    </Typography>
  );

  const DemoBox = ({ label, bg = false, children }: { label: string; bg?: boolean; children: React.ReactNode }) => (
    <div className={`rounded-3xl border border-dashed border-border/60 p-6 space-y-2 ${bg ? 'bg-surface-2' : ''}`}>
      <Typography variant="caption" color="muted" className="block mb-4">{label}</Typography>
      {children}
    </div>
  );

  // ── TYPOGRAPHY ────────────────────────────────────────────────────────────

  const renderTypography = () => (
    <div className="space-y-12">
      <SectionHead title="Typography System" subtitle="Tutte le varianti di <Typography variant='...'>" />
      <div className="flex flex-col gap-5">
        {TYPOGRAPHY_VARIANTS.map((variant) => (
          <div key={variant} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-border bg-surface-2">
            <div className="w-64 shrink-0">
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

      <div className="mt-16">
        <SubHead title="Quotes & Blockquotes" />
        <PropDoc text="Variazioni dello stile citazione. Typography (variant='quote') vs AkhaQuote (componente decorato)." />

        <div className="grid grid-cols-1 gap-8">
          <DemoBox label="Typography variant='quote' (Standard)">
            <Typography variant="quote">
              "The path to Akha wisdom starts in the kitchen, where every spice tells a story of heritage and resilience passed down through generations."
            </Typography>
          </DemoBox>

          <DemoBox label="AkhaQuote (Componente decorato con Pixel Pattern)">
            <AkhaQuote variant="main">The path to Akha wisdom starts in the kitchen, where every spice tells a story of heritage and resilience passed down through generations.</AkhaQuote>
          </DemoBox>
        </div>
      </div>
    </div>
  );

  // ── UI COMPONENTS ─────────────────────────────────────────────────────────

  const renderUI = () => (
    <div className="space-y-16">
      <SectionHead title="UI Components" subtitle="Badge · Button · Chip · Avatar · Toggle · Tabs · Pagination · Tooltip" />

      {/* BADGE */}
      <div>
        <SubHead title="Badge" />
        <PropDoc text="variant: solid | mineral | brand  —  size: xs | sm | md  —  color: primary | action | secondary | quiz-p | quiz-s | btn-p | btn-s | allergy" />
        <div className="space-y-6">
          <DemoBox label="solid">
            <div className="flex flex-wrap gap-3">
              <Badge variant="solid" color="primary">Primary</Badge>
              <Badge variant="solid" color="action">Action</Badge>
              <Badge variant="solid" color="secondary">Secondary</Badge>
              <Badge variant="brand">Brand Glow</Badge>
            </div>
          </DemoBox>
          <DemoBox label="mineral — su sfondo fotografico">
            <div className="rounded-2xl p-6 bg-[url('/avatarCherry/600-Avatar-AuthPage.webp')] bg-cover bg-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="relative z-10 flex flex-wrap gap-3">
                <Badge variant="mineral" color="primary">Primary</Badge>
                <Badge variant="mineral" color="action">Action</Badge>
                <Badge variant="mineral" color="quiz-p">Quiz Magenta</Badge>
                <Badge variant="mineral" color="quiz-s">Quiz Purple</Badge>
                <Badge variant="mineral" color="btn-s">Blue Light</Badge>
                <Badge variant="mineral" color="allergy">Allergy</Badge>
              </div>
            </div>
          </DemoBox>
          <DemoBox label="sizes (mineral color=action)">
            <div className="flex flex-wrap items-end gap-3">
              <Badge variant="mineral" color="action" size="xs">xs</Badge>
              <Badge variant="mineral" color="action" size="sm">sm</Badge>
              <Badge variant="mineral" color="action" size="md">md</Badge>
            </div>
          </DemoBox>
        </div>
      </div>

      {/* BUTTON */}
      <div>
        <SubHead title="Button" />
        <PropDoc text="variant: primary | brand | action | mineral | outline | ghost | secondary | pill | social  —  size: xs | sm | md | lg | xl  —  icon: Material Symbols name  —  iconPosition: left | right | only" />
        <div className="space-y-6">
          <DemoBox label="variants (size md)">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="brand">Brand</Button>
              <Button variant="action">Action</Button>
              <Button variant="mineral">Mineral</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="ghost">Secondary</Button>
              <Button variant="outline">Pill</Button>
              <Button variant="social">Social</Button>
            </div>
          </DemoBox>
          <DemoBox label="sizes (variant brand)">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="brand" size="xs">xs</Button>
              <Button variant="brand" size="sm">sm</Button>
              <Button variant="brand" size="md">md</Button>
              <Button variant="brand" size="lg">lg</Button>
              <Button variant="brand" size="lg">xl</Button>
            </div>
          </DemoBox>
          <DemoBox label="con icona, loading, disabled">
            <div className="flex flex-wrap gap-3">
              <Button variant="brand" icon="arrow_forward" iconPosition="right">Enter Portal</Button>
              <Button variant="action" icon="check_circle" iconPosition="left">Confirm</Button>
              <Button variant="mineral" icon="settings" iconPosition="only" />
              <Button variant="primary" isLoading>Loading...</Button>
              <Button variant="brand" disabled>Disabled</Button>
            </div>
          </DemoBox>
        </div>
      </div>

      {/* CHIP */}
      <div>
        <SubHead title="Chip" />
        <PropDoc text="props: label · active · onClick  —  usato per filtri dietetici (Vegan, Halal, Meaty…)" />
        <div className="flex flex-wrap gap-3">
          {['vegan', 'halal', 'meaty', 'seafood', 'gluten-free'].map((c) => (
            <Chip key={c} label={c} active={chipActive === c} onClick={() => setChipActive(c)} />
          ))}
        </div>
      </div>

      {/* AVATAR */}
      <div>
        <SubHead title="Avatar" />
        <PropDoc text="props: src | initials | size (sm|md|lg|xl|2xl) | bordered" />
        <div className="flex flex-wrap items-end gap-6">
          {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <Avatar size={s} initials={s.toUpperCase().slice(0, 2)} />
              <Typography variant="caption" color="muted">{s}</Typography>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2">
            <Avatar size="lg" />
            <Typography variant="caption" color="muted">no initials</Typography>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar size="lg" bordered={false} initials="NB" />
            <Typography variant="caption" color="muted">no border</Typography>
          </div>
        </div>
      </div>

      {/* TOGGLE */}
      <div>
        <SubHead title="Toggle" />
        <PropDoc text="props: checked · onChange · disabled · label" />
        <div className="flex flex-wrap gap-8">
          <Toggle checked={toggleA} onChange={setToggleA} label="Dark Mode" />
          <Toggle checked={toggleB} onChange={setToggleB} label="Notifications" />
          <Toggle checked={true} onChange={() => { }} disabled label="Disabled On" />
          <Toggle checked={false} onChange={() => { }} disabled label="Disabled Off" />
        </div>
      </div>

      {/* TABS */}
      <div>
        <SubHead title="Tabs" />
        <PropDoc text="variant: mineral | pills  —  props: items · value · onChange · actionButton" />
        <div className="space-y-8">
          <DemoBox label="mineral — sliding indicator verde">
            <Tabs
              variant="mineral"
              value={tabsValue}
              onChange={setTabsValue}
              items={[
                { value: 'menu', label: 'Menu', icon: 'restaurant' },
                { value: 'booking', label: 'Booking', icon: 'calendar_today' },
                { value: 'quiz', label: 'Quiz', icon: 'psychology', badge: 3 },
                { value: 'cherry', label: 'Cherry', icon: 'smart_toy' },
              ]}
            />
          </DemoBox>
          <DemoBox label="pills">
            <Tabs
              variant="pills"
              value={tabsPillValue}
              onChange={setTabsPillValue}
              items={[
                { value: 'bookings', label: 'Bookings' },
                { value: 'history', label: 'History' },
                { value: 'profile', label: 'Profile' },
              ]}
            />
          </DemoBox>
        </div>
      </div>

      {/* PAGINATION */}
      <div>
        <SubHead title="Pagination" />
        <PropDoc text="props: currentPage · totalPages · onPageChange" />
        <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
      </div>

      {/* TOOLTIP */}
      <div>
        <SubHead title="Tooltip" />
        <PropDoc text="props: content · position (top|right|bottom|left) · delay · hideOnMobile" />
        <div className="flex flex-wrap gap-6">
          {(['top', 'right', 'bottom', 'left'] as const).map((pos) => (
            <Tooltip key={pos} content={`Tooltip ${pos}`} position={pos} hideOnMobile={false}>
              <Button variant="mineral" size="sm">{pos}</Button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* ICON */}
      <div>
        <SubHead title="Icon" />
        <PropDoc text="props: name (Material Symbols) · size (xs | sm | md | lg | xl | 2xl) · className (per i colori)" />
        <div className="space-y-6">
          <DemoBox label="Sizes (color primary)">
            <div className="flex flex-wrap items-end gap-6">
              {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <Icon name="restaurant" size={s} className="text-primary" />
                  <Typography variant="caption" color="muted">{s}</Typography>
                </div>
              ))}
            </div>
          </DemoBox>
          <DemoBox label="Semantic Colors (size md)">
            <div className="flex flex-wrap gap-6">
              <Icon name="check_circle" size="md" className="text-sys-success" />
              <Icon name="error" size="md" className="text-sys-error" />
              <Icon name="warning" size="md" className="text-sys-warning" />
              <Icon name="info" size="md" className="text-sys-info" />
              <Icon name="notifications" size="md" className="text-action" />
              <Icon name="favorite" size="md" className="text-primary" />
            </div>
          </DemoBox>

          <DemoBox label="Container Variants (Soft / Solid / Outline)">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {[
                { id: 'primary', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', solid: 'bg-primary', icon: 'star' },
                { id: 'action', color: 'text-action', bg: 'bg-action/10', border: 'border-action/20', solid: 'bg-action', icon: 'bolt' },
                { id: 'success', color: 'text-sys-success', bg: 'bg-sys-success/10', border: 'border-sys-success/20', solid: 'bg-sys-success', icon: 'check_circle' },
                { id: 'error', color: 'text-sys-error', bg: 'bg-sys-error/10', border: 'border-sys-error/20', solid: 'bg-sys-error', icon: 'dangerous' },
                { id: 'warning', color: 'text-sys-warning', bg: 'bg-sys-warning/10', border: 'border-sys-warning/20', solid: 'bg-sys-warning', icon: 'warning' },
                { id: 'info', color: 'text-sys-info', bg: 'bg-sys-info/10', border: 'border-sys-info/20', solid: 'bg-sys-info', icon: 'info' },
                { id: 'secondary', color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20', solid: 'bg-secondary', icon: 'local_dining' },
              ].map((c) => (
                <div key={c.id} className="flex flex-col gap-4">
                  <Typography variant="microLabel" color="muted" className="text-center">{c.id}</Typography>

                  {/* Soft Variant */}
                  <div className={cn("w-12 h-12 mx-auto rounded-full flex items-center justify-center border", c.bg, c.border)}>
                    <Icon name={c.icon} size="sm" className={c.color} />
                  </div>

                  {/* Solid Variant */}
                  <div className={cn("w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-white shadow-sm", c.solid)}>
                    <Icon name={c.icon} size="sm" />
                  </div>

                  {/* Outline Variant */}
                  <div className={cn("w-12 h-12 mx-auto rounded-full flex items-center justify-center border border-white/20")}>
                    <Icon name={c.icon} size="sm" className={c.color} />
                  </div>
                </div>
              ))}
            </div>
          </DemoBox>

          <DemoBox label="Shapes & Large Containers">
            <div className="flex flex-wrap gap-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-surface-3 border border-border flex items-center justify-center group hover:border-primary/50 transition-colors">
                  <Icon name="home" size="lg" className="text-white/40 group-hover:text-primary transition-colors" />
                </div>
                <Typography variant="caption" color="muted">Large Circle</Typography>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-[2rem] bg-surface-3 border border-border flex items-center justify-center group hover:border-action/50 transition-colors">
                  <Icon name="explore" size="lg" className="text-white/40 group-hover:text-action transition-colors" />
                </div>
                <Typography variant="caption" color="muted">Large Squircle</Typography>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-action/20 border border-white/10 flex items-center justify-center">
                  <Icon name="auto_awesome" size="lg" className="text-white" />
                </div>
                <Typography variant="caption" color="muted">Gradient Mix</Typography>
              </div>
            </div>
          </DemoBox>
        </div>
      </div>
    </div>
  );

  // ── SKELETON ──────────────────────────────────────────────────────────────

  const renderSkeleton = () => (
    <div className="space-y-20">
      <SectionHead title="Skeleton System" subtitle="Atoms: SkeletonBase · SkeletonText · SkeletonTitle · SkeletonDivider  —  Compositions: BlogGridSkeleton · ArticleDetailSkeleton · SkeletonHeader" />

      {/* ATOMS */}
      <div>
        <SubHead title="Atoms" />

        <div className="space-y-8">

          <DemoBox label="SkeletonBase — variant: rounded | circular | rectangular" bg>
            <PropDoc text="bg-gray-200 / dark:bg-white/5 — base per card e immagini" />
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <SkeletonBase className="w-24 h-24" variant="rounded" />
                <Typography variant="caption" color="muted">rounded</Typography>
              </div>
              <div className="flex flex-col items-center gap-2">
                <SkeletonBase className="w-24 h-24" variant="circular" />
                <Typography variant="caption" color="muted">circular</Typography>
              </div>
              <div className="flex flex-col items-center gap-2">
                <SkeletonBase className="w-24 h-24" variant="rectangular" />
                <Typography variant="caption" color="muted">rectangular</Typography>
              </div>
              <div className="flex flex-col items-center gap-2">
                <SkeletonBase className="w-64 h-36" variant="rounded" />
                <Typography variant="caption" color="muted">card (w-64 h-36)</Typography>
              </div>
              <div className="flex flex-col items-center gap-2">
                <SkeletonBase className="w-12 h-12" variant="circular" />
                <Typography variant="caption" color="muted">avatar (w-12)</Typography>
              </div>
            </div>
          </DemoBox>

          <DemoBox label="SkeletonTitle — variant: hero | section | sub" bg>
            <PropDoc text="bg-surface-2 — placeholder per titoli. Altezze: hero h-12 md:h-16 | section h-10 md:h-12 | sub h-6" />
            <div className="flex flex-col gap-4 items-center">
              <SkeletonTitle variant="hero" />
              <SkeletonTitle variant="section" />
              <SkeletonTitle variant="sub" />
            </div>
          </DemoBox>

          <DemoBox label="SkeletonDivider — placeholder per AkhaPixelPattern" bg>
            <PropDoc text="h-1 rounded-full bg-surface-2 — prop: width (default w-16)" />
            <div className="flex flex-col items-center gap-4">
              <SkeletonDivider width="w-16" />
              <SkeletonDivider width="w-32" />
              <SkeletonDivider width="w-64" />
              <SkeletonDivider width="w-full" />
            </div>
          </DemoBox>

          <DemoBox label="SkeletonText — props: lines · lastLineWidth · height · align" bg>
            <PropDoc text="bg-surface-2 — ultima riga più corta per effetto naturale" />
            <div className="flex flex-col gap-6 max-w-lg mx-auto">
              <SkeletonText lines={2} align="center" />
              <SkeletonText lines={3} align="left" lastLineWidth="w-2/3" />
              <SkeletonText lines={4} align="center" height="h-3" lastLineWidth="w-1/2" />
            </div>
          </DemoBox>

        </div>
      </div>

      {/* COMPOSITIONS */}
      <div>
        <SubHead title="Compositions" />
        <div className="space-y-16">

          <DemoBox label="SkeletonHeader — variant: hero | section | sub  —  align: left | center | right" bg>
            <PropDoc text="Usato da SmartHeaderSection durante il fetch. Composto da SkeletonTitle + SkeletonDivider + SkeletonText." />
            <div className="space-y-12">
              <div>
                <Typography variant="caption" color="muted" className="mb-3 block">variant=hero · align=center</Typography>
                <SkeletonHeader variant="hero" align="center" />
              </div>
              <div>
                <Typography variant="caption" color="muted" className="mb-3 block">variant=section · align=left</Typography>
                <SkeletonHeader variant="section" align="left" />
              </div>
              <div>
                <Typography variant="caption" color="muted" className="mb-3 block">variant=sub · align=right</Typography>
                <SkeletonHeader variant="sub" align="right" />
              </div>
              <div>
                <Typography variant="caption" color="muted" className="mb-3 block">hideSubtitle · hideDivider</Typography>
                <SkeletonHeader variant="section" align="center" hideSubtitle hideDivider />
              </div>
            </div>
          </DemoBox>

          <DemoBox label="BlogGridSkeleton — loading state per griglia articoli" bg>
            <PropDoc text="Featured card + 6 card in grid 1/2/3 colonne." />
            <BlogGridSkeleton />
          </DemoBox>

          <DemoBox label="ArticleDetailSkeleton — loading state per pagina articolo" bg>
            <PropDoc text="Hero image + interaction bar + quote/metadata + blocchi di contenuto." />
            <ArticleDetailSkeleton />
          </DemoBox>

        </div>
      </div>

    </div>
  );

  // ── LAYOUT & HEADERS ──────────────────────────────────────────────────────

  const renderLayout = () => (
    <div className="space-y-24">
      <SectionHead title="Layout & Headers" subtitle="Header · HeaderMenu · HeaderSection · SmartHeaderSection" />

      {/* HEADER */}
      <div>
        <SubHead title="Header" />
        <PropDoc text="Componente pagina full-width. Props: data: HeaderMetadata { titleMain, titleHighlight, description, badge, icon, imageUrl }. Usato da PageLayout." />
        <DemoBox label="Header — dati statici mock" bg>
          <Header data={{
            titleMain: 'Thai Akha',
            titleHighlight: 'Kitchen',
            description: 'Authentic Northern Thai cuisine — crafted with love and tradition.',
            badge: 'Seasonal Menu',
            icon: 'restaurant',
          }} />
        </DemoBox>
      </div>

      {/* HEADERMENU */}
      <div>
        <SubHead title="HeaderMenu" />
        <PropDoc text="Fetch dati da Supabase (page_metadata by slug). Props: currentStep (1|2) · customSlug. Mostra logo + titolo + AkhaPixelPattern + descrizione." />
        <DemoBox label="HeaderMenu — slug='menu-step-1' (fetch live da Supabase)" bg>
          <HeaderMenu currentStep={1} />
        </DemoBox>
        <div className="mt-6">
          <DemoBox label="HeaderMenu — customSlug='menu-step-2'" bg>
            <HeaderMenu customSlug="menu-step-2" />
          </DemoBox>
        </div>
      </div>

      {/* HEADERSECTION */}
      <div>
        <SubHead title="HeaderSection" />
        <PropDoc text="variant: hero | section | history | kitchen  —  align: left | center | right  —  gradientFrom / gradientTo: primary | action | quiz-p | quiz-s | btn-p | btn-s | secondary | allergy  —  props: title · highlight · subtitle · description · tag · hide*" />
        <div className="space-y-8">

          <DemoBox label="variant=hero · align=center · gradientFrom=primary gradientTo=action" bg>
            <HeaderSection
              variant="hero"
              align="center"
              tag="Hero Component"
              title="Authentic Cooking"
              highlight="Experience"
              subtitle="Cherry Red → Lime Green gradient"
              description="La variante hero usa i font più grandi (display) — ideale per l'inizio della pagina."
            />
          </DemoBox>

          <DemoBox label="variant=section · align=left · gradientFrom=quiz-p gradientTo=quiz-s" bg>
            <HeaderSection
              variant="section"
              align="left"
              tag="Custom Gradient"
              title="Master The"
              highlight="Akha Kitchen"
              subtitle="Dominio Quiz — viola magenta"
              gradientFrom="quiz-p"
              gradientTo="quiz-s"
              description="Allineamento a sinistra. Gradiente personalizzato (quiz-p → quiz-s)."
            />
          </DemoBox>

          <DemoBox label="variant=history · align=right · gradientFrom=action gradientTo=btn-s" bg>
            <HeaderSection
              variant="history"
              align="right"
              title="Discover our"
              highlight="Hidden Secrets"
              gradientFrom="action"
              gradientTo="btn-s"
              description="Variante history, bordo laterale. Gradiente Lime → Azzurro."
            />
          </DemoBox>

          <DemoBox label="variant=kitchen · align=left · tag · gradientFrom=secondary" bg>
            <HeaderSection
              variant="kitchen"
              align="left"
              tag="Kitchen Variant"
              title="Today's Special"
              subtitle="Chef recommendation"
              gradientFrom="secondary"
              gradientTo="action"
            />
          </DemoBox>

          <DemoBox label="variant=section · hideDivider · hideSubtitle · gradientFrom=btn-p gradientTo=allergy" bg>
            <HeaderSection
              variant="section"
              align="center"
              title="Pure Typography"
              highlight="Clean Style"
              gradientFrom="btn-p"
              gradientTo="allergy"
              hideSubtitle={true}
              hideDivider={true}
              description="Senza divider e senza subtitle. Gradiente Orange → Allergy Red."
            />
          </DemoBox>

        </div>
      </div>

      {/* SMARTHEADERSECTION */}
      <div>
        <SubHead title="SmartHeaderSection" />
        <PropDoc text="Fetcha da Supabase (page_sections by sectionId). Durante il fetch mostra SkeletonHeader. Se il record non esiste, usa fallback*. Props: sectionId · fallbackTitle · fallbackHighlight · fallbackSubtitle · fallbackDescription · fallbackTag + tutte le props di HeaderSection." />
        <div className="space-y-8">

          <DemoBox label="SmartHeaderSection — sectionId='history_origins' (fetch live da Supabase)" bg>
            <SmartHeaderSection
              sectionId="history_origins"
              variant="section"
              align="center"
              gradientFrom="primary"
              gradientTo="action"
              fallbackTitle="History Origins"
              fallbackHighlight="Origins"
              fallbackSubtitle="Fallback — record non trovato in DB"
            />
          </DemoBox>

          <DemoBox label="SmartHeaderSection — sectionId='__demo_fallback__' (sempre fallback)" bg>
            <SmartHeaderSection
              sectionId="__demo_fallback__"
              variant="section"
              align="left"
              gradientFrom="quiz-p"
              gradientTo="quiz-s"
              fallbackTitle="Akha Wisdom"
              fallbackHighlight="Wisdom"
              fallbackSubtitle="Questo sectionId non esiste → mostra i fallback props"
              fallbackDescription="Il componente ha fatto il fetch, non ha trovato dati, e ora mostra il titolo e descrizione passati come props."
              fallbackTag="Fallback Active"
            />
          </DemoBox>

        </div>
      </div>

    </div>
  );

  // ── QUIZ ──────────────────────────────────────────────────────────────────

  const renderQuiz = () => (
    <div className="space-y-24">
      <SectionHead title="Quiz Components" subtitle="ButtonQuiz · HeaderQuiz · QuizCard · LevelQuiz · PlayQuiz · ResultQuiz" />

      {/* BUTTONQUIZ */}
      <div>
        <SubHead title="ButtonQuiz" />
        <PropDoc text="props: config { label · icon · variant (primary|secondary|outline|ghost) } · onClick · disabled · fullWidth" />
        <div className="space-y-6">
          <DemoBox label="variants">
            <div className="flex flex-wrap gap-3">
              <ButtonQuiz config={{ label: 'Start Quiz', icon: 'play_arrow', variant: 'primary' }} />
              <ButtonQuiz config={{ label: 'Resume', icon: 'play_circle', variant: 'secondary' }} />
              <ButtonQuiz config={{ label: 'Try Again', icon: 'replay', variant: 'outline' }} />
              <ButtonQuiz config={{ label: 'Back to Menu', icon: 'grid_view', variant: 'ghost' }} />
            </div>
          </DemoBox>
          <DemoBox label="fullWidth · disabled">
            <div className="flex flex-col gap-3 max-w-sm">
              <ButtonQuiz fullWidth config={{ label: 'Full Width Primary', icon: 'arrow_forward', variant: 'primary' }} />
              <ButtonQuiz fullWidth disabled config={{ label: 'Disabled', icon: 'block', variant: 'primary' }} />
            </div>
          </DemoBox>
        </div>
      </div>

      {/* HEADERQUIZ */}
      <div>
        <SubHead title="HeaderQuiz" />
        <PropDoc text="props: title · currentLevel · totalLevels · score · maxScore — mostra titolo sessione, barra progresso a segmenti, score badge XP" />
        <DemoBox label="HeaderQuiz — level 2/5 · score 1250 XP">
          <HeaderQuiz
            title="The Akha Path"
            currentLevel={2}
            totalLevels={5}
            score={1250}
            maxScore={5000}
          />
        </DemoBox>
        <div className="mt-6">
          <DemoBox label="HeaderQuiz — level 5/5 completato">
            <HeaderQuiz
              title="Master Guardian"
              currentLevel={5}
              totalLevels={5}
              score={4800}
              maxScore={5000}
            />
          </DemoBox>
        </div>
      </div>

      {/* QUIZCARD */}
      <div>
        <SubHead title="QuizCard" />
        <PropDoc text="props: awardedBonuses (array di id sbloccati) · rewards (array { id · label · icon }) · title · description · onCardClick — mostra collezione reward con progress bar" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DemoBox label="0 reward sbloccati">
            <QuizCard
              awardedBonuses={[]}
              rewards={MOCK_REWARDS}
              title="Spirit Rewards"
              description="Unlock heritage gifts by mastering the quiz."
            />
          </DemoBox>
          <DemoBox label="4 reward su 8 sbloccati">
            <QuizCard
              awardedBonuses={[1, 2, 3, 4]}
              rewards={MOCK_REWARDS}
              title="Spirit Rewards"
              description="Unlock heritage gifts by mastering the quiz."
            />
          </DemoBox>
          <DemoBox label="tutti sbloccati (100%)">
            <QuizCard
              awardedBonuses={[1, 2, 3, 4, 5, 6, 7, 8]}
              rewards={MOCK_REWARDS}
              title="Spirit Rewards"
              description="You are now a true Akha Guardian."
            />
          </DemoBox>
          <DemoBox label="no rewards — loading skeleton">
            <QuizCard awardedBonuses={[]} rewards={[]} />
          </DemoBox>
        </div>
      </div>

      {/* LEVELQUIZ */}
      <div>
        <SubHead title="LevelQuiz" />
        <PropDoc text="props: level (QuizLevel) · completedModules · perfectModules · bestScores · onStartModule · onBack — griglia moduli con stati pristine / in-progress / mastered" />
        <div className="space-y-6">
          <DemoBox label="tutti i moduli pristine (nessun tentativo)">
            <div className="bg-surface-overlay rounded-3xl overflow-hidden">
              <LevelQuiz
                level={MOCK_LEVEL}
                levelNumber={1}
                completedModules={[]}
                perfectModules={[]}
                bestScores={{}}
                onStartModule={(id) => console.log('start', id)}
                onBack={() => console.log('back')}
              />
            </div>
          </DemoBox>
          <DemoBox label="mod-1 in progress · mod-2 mastered">
            <div className="bg-surface-overlay rounded-3xl overflow-hidden">
              <LevelQuiz
                level={MOCK_LEVEL}
                levelNumber={1}
                completedModules={['mod-1', 'mod-2']}
                perfectModules={['mod-2']}
                bestScores={{ 'mod-1': 2, 'mod-2': 3 }}
                onStartModule={(id) => console.log('start', id)}
                onBack={() => console.log('back')}
              />
            </div>
          </DemoBox>
        </div>
      </div>

      {/* PLAYQUIZ */}
      <div>
        <SubHead title="PlayQuiz" />
        <PropDoc text="props: level · module · currentQuestionIndex · totalQuestions · score · onAnswer · onBack · onGetHint · selectedOption · showFeedback — schermata domanda con opzioni A/B/C, feedback visivo e hint -50XP" />
        <div className="space-y-6">
          <DemoBox label="domanda 1/3 — nessuna risposta selezionata" bg>
            <PlayQuiz
              level={MOCK_LEVEL}
              module={MOCK_MODULE}
              currentQuestionIndex={0}
              totalQuestions={3}
              score={150}
              selectedOption={null}
              showFeedback={false}
              showExplanations={null}
              onAnswer={(opt) => console.log('answer', opt)}
              onSubmitSelection={(idx) => console.log('selection', idx)}
              onNext={() => console.log('next')}
              onToggleExplanations={(v) => console.log('explanations', v)}
              onBack={() => console.log('back')}
              onGetHint={(q) => console.log('hint', q)}
            />
          </DemoBox>
          <DemoBox label="domanda 2/3 — risposta corretta (feedback attivo)" bg>
            <PlayQuiz
              level={MOCK_LEVEL}
              module={MOCK_MODULE}
              currentQuestionIndex={1}
              totalQuestions={3}
              score={200}
              selectedOption="Prik"
              showFeedback={true}
              showExplanations={true}
              onAnswer={() => { }}
              onSubmitSelection={(idx) => console.log('selection', idx)}
              onNext={() => console.log('next')}
              onToggleExplanations={(v) => console.log('explanations', v)}
              onBack={() => console.log('back')}
              onGetHint={() => { }}
            />
          </DemoBox>
          <DemoBox label="domanda 3/3 — risposta errata (feedback attivo)" bg>
            <PlayQuiz
              level={MOCK_LEVEL}
              module={MOCK_MODULE}
              currentQuestionIndex={2}
              totalQuestions={3}
              score={30}
              selectedOption="Sweet Basil"
              showFeedback={true}
              showExplanations={true}
              onAnswer={() => { }}
              onSubmitSelection={(idx) => console.log('selection', idx)}
              onNext={() => console.log('next')}
              onToggleExplanations={(v) => console.log('explanations', v)}
              onBack={() => console.log('back')}
              onGetHint={() => { }}
            />
          </DemoBox>
        </div>
      </div>

      {/* RESULTQUIZ */}
      <div>
        <SubHead title="ResultQuiz" />
        <PropDoc text="props: level · module · correctAnswers · totalQuestions · xpEarned · onNext · onPlayAgain · onReturn — schermata risultato con SVG circle chart, XP e CTA" />
        <Typography variant="paragraphS" color="muted" className="mb-4 italic">
          Nota: ResultQuiz usa position:fixed — mostrato in un iframe scalato per non coprire la pagina.
        </Typography>
        <div className="space-y-6">
          <DemoBox label="risultato PASS — 3/3 corrette · +300 XP" bg>
            <div className="relative w-full" style={{ height: 520 }}>
              <div className="absolute inset-0 overflow-hidden rounded-3xl" style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}>
                <ResultQuiz
                  level={MOCK_LEVEL}
                  module={MOCK_MODULE}
                  correctAnswers={3}
                  totalQuestions={3}
                  xpEarned={300}
                  onNext={() => console.log('next')}
                  onPlayAgain={() => console.log('replay')}
                  onReturn={() => console.log('return')}
                />
              </div>
            </div>
          </DemoBox>
          <DemoBox label="risultato FAIL — 1/3 corrette · 0 XP" bg>
            <div className="relative w-full" style={{ height: 520 }}>
              <div className="absolute inset-0 overflow-hidden rounded-3xl" style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}>
                <ResultQuiz
                  level={MOCK_LEVEL}
                  module={MOCK_MODULE}
                  correctAnswers={1}
                  totalQuestions={3}
                  xpEarned={0}
                  onNext={() => console.log('next')}
                  onPlayAgain={() => console.log('replay')}
                  onReturn={() => console.log('return')}
                />
              </div>
            </div>
          </DemoBox>
        </div>
      </div>

    </div>
  );

  // ── CARD ──────────────────────────────────────────────────────────────────

  const renderCard = () => (
    <div className="space-y-24">
      <SectionHead title="Card Gallery by Page" subtitle="Riferimento visivo dei componenti card utilizzati nelle diverse sezioni del sito." />

      {/* ── 1. HOME PAGE ────────────────────────────────────────────────── */}
      <div>
        <SubHead title="1. Home Page" />

        {/* Cherry Section Focus */}
        <DemoBox label="Sezione 'Meet Cherry': 2 Premium Glass Cards (Layout consigliato)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <GlassCard variant="primary" className="p-8 flex flex-col gap-4 min-h-[320px] justify-end bg-[url('/avatarCherry/600-Avatar-AuthPage.webp')] bg-cover bg-center relative overflow-hidden group border-white/10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="relative z-10">
                <Typography variant="h3" className="text-white mb-2">Meet Cherry</Typography>
                <Typography variant="paragraphM" className="text-white/80">The heart and soul of Thai Akha Kitchen, sharing her heritage through every dish.</Typography>
              </div>
            </GlassCard>

            <GlassCard variant="action" className="p-8 flex flex-col gap-4 min-h-[320px] justify-center border-action/30 bg-surface-2/40">
              <Icon name="volunteer_activism" size="xl" className="text-action mb-2" />
              <Typography variant="h3" className="text-white">Our Philosophy</Typography>
              <Typography variant="paragraphM" className="text-white/80">Cooking is more than recipes; it's an open door to our culture and a bridge between generations.</Typography>
            </GlassCard>
          </div>
        </DemoBox>

        <PropDoc text="Utilizzo di InfoCard (vertical) per le sezioni principali della dashboard/landing." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_FEATURED_DATA.map((card) => (
            <InfoCard key={card.id} card={card} onNavigate={() => { }} />
          ))}
        </div>
      </div>

      {/* ── 2. CLASSES OVERVIEW ─────────────────────────────────────────── */}
      <div>
        <SubHead title="2. Classes Overview" />
        <PropDoc text="Utilizzo di InfoCard (layout='horizontal') per confrontare le classi disponibili." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard
            layout="horizontal"
            card={{ link: '#', title: 'Morning Class', desc: 'Market tour and 6 traditional dishes.', image: '/avatarCherry/600-Avatar-AuthPage.webp', icon: 'wb_sunny' }}
            onNavigate={() => { }}
          />
          <InfoCard
            layout="horizontal"
            card={{ link: '#', title: 'Evening Class', desc: 'Twilight cooking and family recipes.', image: '', icon: 'dark_mode' }}
            onNavigate={() => { }}
          />
        </div>
      </div>

      {/* ── 3. CLASS MORNING / EVENING ──────────────────────────────────── */}
      <div>
        <SubHead title="3. Class Details (Morning & Evening)" />
        <div className="space-y-12">

          {/* Inclusions Card */}
          <DemoBox label="Sezione 'Inclusions': Card variant='glass' + rounded='2xl' + padding='none'">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="glass" padding="none" rounded="2xl" className="flex flex-col">
                <div className="p-6 space-y-3">
                  {['Local Market Tour', '6 Traditional Dishes', 'Recipe Book'].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-action shrink-0" />
                      <Typography variant="paragraphM" color="muted">{item}</Typography>
                    </div>
                  ))}
                </div>
              </Card>
              <Card variant="glass" padding="none" rounded="2xl" className="flex flex-col">
                <div className="p-6 space-y-3">
                  {['Hotel Pickup Included', 'Free Drinking Water', 'Certificate'].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-action shrink-0" />
                      <Typography variant="paragraphM" color="muted">{item}</Typography>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </DemoBox>

          {/* Meeting Points Card */}
          <DemoBox label="Sezione 'Meeting Points': Interactive Surface Card (rounded-[2rem] + border + bg-surface-2)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="group flex flex-col rounded-[2rem] border border-border bg-surface-2 p-6 gap-2 hover:shadow-theme-md transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Market Meeting</Badge>
                  <Typography variant="accent" className="text-xs font-bold text-primary">08:30 AM</Typography>
                </div>
                <Typography variant="h6" color="title" className="font-bold">Siri-Wattana Market</Typography>
                <Typography variant="caption" color="muted">Meeting point for market tour.</Typography>
                <div className="flex items-center mt-1 text-muted group-hover:text-sub transition-colors gap-1">
                  <Icon name="location_on" size="xs" />
                  <Typography variant="caption">View on Maps</Typography>
                </div>
              </div>
            </div>
          </DemoBox>
        </div>
      </div>

      {/* ── 4. SYSTEM & GENERIC ─────────────────────────────────────────── */}
      <div>
        <SubHead title="4. System Components (Generic)" />
        <PropDoc text="Componenti card atomici utilizzati trasversalmente nel sistema." />

        <div className="space-y-12">
          {/* GLASS CARD VARIANTS */}
          <DemoBox label="GlassCard Premium Variants (per overlay fotografici)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard variant="primary" className="p-6">
                <Typography variant="h6" className="text-white">Primary Glass</Typography>
                <Typography variant="paragraphS" className="text-white/70">Usato per highlight del brand.</Typography>
              </GlassCard>
              <GlassCard variant="action" className="p-6">
                <Typography variant="h6" className="text-white">Action Glass</Typography>
                <Typography variant="paragraphS" className="text-white/70">Usato per feedback positivi/call to action.</Typography>
              </GlassCard>
            </div>
          </DemoBox>

          {/* STAT CARD */}
          <DemoBox label="StatCard (Dashboard & Stats)">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Morning Bookings" value="24" icon="wb_sunny" color="primary" align="center" iconPosition="top" />
              <StatCard title="Average Rating" value="4.9" suffix="/5" icon="star" color="action" align="center" iconPosition="top" />
              <StatCard title="Revenue" value="12,500" suffix="THB" icon="payments" color="success" align="center" iconPosition="top" />
            </div>
          </DemoBox>

          {/* ALERTS */}
          <DemoBox label="Alerts (System Messages)">
            <div className="space-y-4">
              <Alert variant="info" message="Standard informative message." />
              <Alert variant="success" title="Success" message="Your action was successful." />
              <Alert variant="warning" title="Warning" message="Please review your dietary preferences." />
              <Alert variant="error" title="Error" message="Something went wrong. Please try again." />
            </div>
          </DemoBox>
        </div>
      </div>
    </div>
  );

  // ── CHERRY AI ─────────────────────────────────────────────────────────────

  const renderCherry = () => (
    <div className="space-y-16">
      <SectionHead
        title="Cherry AI — Component System"
        subtitle="AskCherryButton: variant inline | prominent  —  context: recipe-category | recipe-dish | class-philosophy | history-general | manual topic"
      />

      {/* INLINE VARIANT */}
      <div>
        <SubHead title="variant='inline' (Default)" />
        <PropDoc text="Bottone compatto con miniatura avatar di Cherry. Usato inline nelle card, nelle sezioni ricette e nella categoria menu." />
        <div className="space-y-6">

          <DemoBox label="context='recipe-category' — auto-genera prompt sulla categoria culinaria">
            <AskCherryButton
              variant="inline"
              context="recipe-category"
              data={{ title: 'Akha Morning Dishes' }}
            />
          </DemoBox>

          <DemoBox label="context='recipe-dish' — prompt su piatto specifico (dieta + allergie)">
            <AskCherryButton
              variant="inline"
              context="recipe-dish"
              data={{ name: 'Pad Thai', diet: 'vegan', allergies: 'gluten' }}
            />
          </DemoBox>

          <DemoBox label="context='class-philosophy' — filosofia del social enterprise">
            <AskCherryButton
              variant="inline"
              context="class-philosophy"
              label="Why Thai Akha Kitchen?"
            />
          </DemoBox>

          <DemoBox label="context='history-general' — storia Akha">
            <AskCherryButton
              variant="inline"
              context="history-general"
              label="Discover Akha History"
            />
          </DemoBox>

          <DemoBox label="topic manuale (override libero)">
            <AskCherryButton
              variant="inline"
              topic="What is the best spice to start with for a beginner Thai cook?"
              label="Ask Cherry Anything"
            />
          </DemoBox>

          <DemoBox label="Dati DB diretti: cherry_prompt + cherry_response (Zero-Latency)">
            <AskCherryButton
              variant="inline"
              data={{
                cherry_prompt: 'Tell me about Akha herbal medicine in cooking',
                cherry_response: 'Akha people have used herbal plants like lemongrass, galangal and kaffir lime for centuries...'
              }}
            />
          </DemoBox>

        </div>
      </div>

      {/* PROMINENT VARIANT */}
      <div>
        <SubHead title="variant='prominent' — Call to Action Banner" />
        <PropDoc text="Banner orizzontale con avatar grande di Cherry, testo di ingaggio e bottone primary. Ideale per footer di sezione, fine articolo, card hero." />
        <div className="space-y-6">

          <DemoBox label="context='recipe-category' — prominent banner">
            <AskCherryButton
              variant="prominent"
              context="recipe-category"
              data={{ title: 'Northern Thai Street Food' }}
              label="Ask Cherry about this category"
            />
          </DemoBox>

          <DemoBox label="context='class-philosophy' — prominent banner">
            <AskCherryButton
              variant="prominent"
              context="class-philosophy"
              label="Learn about our mission"
            />
          </DemoBox>

          <DemoBox label="topic manuale — prominent banner">
            <AskCherryButton
              variant="prominent"
              topic="What makes Akha cooking different from standard Thai cuisine?"
              label="Discover the difference"
            />
          </DemoBox>

        </div>
      </div>

      {/* COME FUNZIONA */}
      <div>
        <SubHead title="Come funziona il sistema (Flusso Tecnico)" />
        <PropDoc text="Il bottone dispatcha un CustomEvent globale 'trigger-chat-topic'. Il widget Cherry globale (montato in App.tsx) ascolta l'evento, si apre e pre-compila il messaggio con il topic e il systemContext forniti." />
        <div className="bg-surface-2 border border-border rounded-3xl [padding:var(--space-fluid-m)] space-y-4">
          <Typography variant="caption" color="muted" className="uppercase tracking-widest block">Event Payload</Typography>
          <pre className="text-sm text-desc font-mono bg-black/5 dark:bg-white/5 rounded-2xl p-4 overflow-x-auto">{`window.dispatchEvent(
  new CustomEvent('trigger-chat-topic', {
    detail: {
      topic: string,           // Il prompt da inviare a Cherry
      systemContext: string,   // Istruzioni di comportamento per il modello
      presetResponse: string | null  // Risposta pre-cacheata (Zero-Latency)
    }
  })
);`}</pre>
        </div>
      </div>

    </div>
  );

  // ── FAQ ───────────────────────────────────────────────────────────────────

  const renderFaq = () => {
    return (
      <div className="space-y-16">
        <SectionHead
          title="FAQ — Content System"
          subtitle="Mondo informazioni / domande & risposte. Palette dedicata Ocean → vedi tab 'Colors & Tokens' (btn-s mappa su ocean-blue)."
        />

        {/* SEARCH + CATEGORY CHIPS */}
        <div>
          <SubHead title="Search & Category Chips" />
          <PropDoc text="Barra di ricerca FAQ e chip categorie. Focus ring e accenti in ocean-blue." />
          <div className="space-y-5 max-w-3xl">
            <div className="flex items-center [gap:var(--space-fluid-s)] [padding:var(--space-fluid-s)] rounded-full border border-ocean-blue/30 bg-surface focus-within:border-ocean-blue focus-within:shadow-glow-blue transition-all">
              <Icon name="search" size="md" className="text-deep-blue shrink-0 ml-2" />
              <input
                type="text"
                placeholder="Search a question…"
                className="flex-1 bg-transparent outline-none text-desc placeholder:text-muted [font-size:var(--text-fluid-paragraphM)]"
              />
              <button className="shrink-0 rounded-full bg-ocean-blue text-white px-5 py-2 text-sm font-bold hover:brightness-110 shadow-glow-blue transition-all">
                Search
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {['All', 'Booking', 'Logistics', 'Menu', 'Classes', 'Groups'].map((c, i) => (
                <span
                  key={c}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold border transition-colors cursor-pointer',
                    i === 0
                      ? 'bg-ocean-blue text-white border-ocean-blue'
                      : 'bg-ocean-blue/10 text-desc border-ocean-blue/20 hover:bg-ocean-blue/20'
                  )}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ACCORDION QUESTION CARDS */}
        <div>
          <SubHead title="Question Cards (Accordion)" />
          <PropDoc text="Card domanda/risposta espandibili. Aperta → wash pale-ice, bullet e chevron ocean-blue. Clicca una domanda per aprirla." />
          <div className="space-y-4 max-w-3xl">
            {MOCK_FAQ.map((item, i) => {
              const open = faqOpen === i;
              return (
                <div
                  key={item.q}
                  className={cn(
                    'rounded-[1.5rem] border overflow-hidden transition-all duration-300',
                    open ? 'border-ocean-blue/40 shadow-glow-blue' : 'border-ocean-blue/15'
                  )}
                >
                  <button
                    onClick={() => setFaqOpen(open ? null : i)}
                    className="w-full text-left flex items-center justify-between [gap:var(--space-fluid-s)] [padding:var(--space-fluid-m)] bg-surface hover:bg-ocean-blue/5 transition-colors"
                  >
                    <span className="flex items-center [gap:var(--space-fluid-s)]">
                      <span className={cn('shrink-0 w-2 h-2 rounded-full transition-colors', open ? 'bg-ocean-blue' : 'bg-ocean-blue/50')} aria-hidden="true" />
                      <Typography variant="h6" color="title" className="font-bold">{item.q}</Typography>
                    </span>
                    <Icon name={open ? 'expand_less' : 'expand_more'} size="md" className="text-deep-blue shrink-0" />
                  </button>
                  {open && (
                    <div className="[padding-inline:var(--space-fluid-m)] [padding-bottom:var(--space-fluid-m)] bg-ocean-blue/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-ocean-blue/10 text-ocean-blue border border-ocean-blue/20">{item.cat}</span>
                      </div>
                      <Typography variant="paragraphM" color="muted" className="leading-relaxed">{item.a}</Typography>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TOPIC CARDS */}
        <div>
          <SubHead title="Topic Cards" />
          <PropDoc text="Card categoria FAQ. Icona in container sky-blue, titolo deep-ocean, contatore ocean-blue." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MOCK_FAQ_TOPICS.map((t) => (
              <div
                key={t.title}
                className="group flex flex-col gap-3 rounded-[1.5rem] border border-ocean-blue/15 bg-surface p-5 hover:border-ocean-blue/40 hover:shadow-glow-blue transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-ocean-blue/10 border border-ocean-blue/20 group-hover:bg-ocean-blue/20 transition-colors">
                  <Icon name={t.icon} size="md" className="text-ocean-blue" />
                </div>
                <Typography variant="h6" color="title" className="font-bold">{t.title}</Typography>
                <Typography variant="caption" className="text-ocean-blue font-bold">{t.count} questions</Typography>
              </div>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <div>
          <SubHead title="FAQ Buttons" />
          <PropDoc text="Pulsanti del mondo FAQ in palette ocean. 'social' (componente Button) ora rende ocean-blue. Sotto, varianti raw ocean." />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="social" icon="help" iconPosition="left">Ask a question</Button>
            <button className="rounded-full bg-ocean-blue text-white px-6 py-3 font-bold hover:brightness-110 shadow-glow-blue transition-all flex items-center gap-2">
              <Icon name="quiz" size="sm" /> Browse all FAQ
            </button>
            <button className="rounded-full bg-deep-ocean text-white px-6 py-3 font-bold hover:brightness-125 transition-all">
              Contact us
            </button>
            <button className="rounded-full border-2 border-ocean-blue text-ocean-blue px-6 py-3 font-bold hover:bg-ocean-blue/10 transition-all">
              Outline
            </button>
            <button className="rounded-full bg-ocean-blue/10 text-ocean-blue px-6 py-3 font-bold hover:bg-ocean-blue/20 transition-all">
              Soft
            </button>
          </div>
        </div>

        {/* ASK CHERRY — OCEAN TONE */}
        <div>
          <SubHead title="Ask Cherry — Ocean Tone" />
          <PropDoc text="AskCherryButton con la nuova prop tone='ocean'. Stesso componente del brand rosso, ma in tonalità ocean-blue per il mondo FAQ/info. La versione 'cherry' (default) resta invariata." />
          <div className="space-y-6">
            <DemoBox label="inline · tone='ocean' (default era cherry rosso)">
              <div className="flex flex-wrap items-center gap-4">
                <AskCherryButton variant="inline" tone="ocean" topic="How do I pick the right class?" label="Ask Cherry" />
                <AskCherryButton variant="inline" tone="ocean" size="sm" topic="Pickup info?" label="Pickup help" />
                <AskCherryButton variant="inline" tone="ocean" size="lg" topic="Diet options?" label="Diet & allergies" />
              </div>
            </DemoBox>
            <DemoBox label="inline · confronto tone='cherry' (brand) vs tone='ocean'">
              <div className="flex flex-wrap items-center gap-4">
                <AskCherryButton variant="inline" tone="cherry" topic="x" label="Cherry (brand)" />
                <AskCherryButton variant="inline" tone="ocean" topic="x" label="Ocean (FAQ)" />
              </div>
            </DemoBox>
            <DemoBox label="prominent · tone='ocean' — banner fine sezione FAQ">
              <AskCherryButton
                variant="prominent"
                tone="ocean"
                topic="What should I know before my first cooking class?"
                label="Ask Cherry about classes"
              />
            </DemoBox>
          </div>
        </div>

        {/* BLOCCO FAQ DI FINE PAGINA (componente reale) */}
        <div>
          <SubHead title="End-of-Page FAQ Block (FaqBottomPage)" />
          <PropDoc text="Il blocco FAQ reale che compare in fondo a ogni pagina. Componente <FaqBottomPage> con items mock (normalmente carica da site_metadata). Le card glass, il ring avatar e i link usano btn-s → ora ocean-blue. Tema divider: block_faq." />
          <DemoBox label="<FaqBottomPage items={...} hideTopDivider />" bg>
            <FaqBottomPage items={MOCK_FAQ_BOTTOM} hideTopDivider />
          </DemoBox>
        </div>

        {/* INFO BANNER */}
        <div>
          <SubHead title="Info / Help Banner" />
          <PropDoc text="Banner informativo a fondo sezione. Gradiente deep-ocean → ocean-blue, CTA pale-ice." />
          <div className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-deep-ocean to-ocean-blue p-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Icon name="support_agent" size="lg" className="text-white" />
            </div>
            <div className="flex-1">
              <Typography variant="h4" className="text-white font-bold">Still have questions?</Typography>
              <Typography variant="paragraphM" className="text-white/80">Our team and Cherry AI are here to help you plan the perfect cooking class.</Typography>
            </div>
            <button className="shrink-0 rounded-full bg-pale-ice text-deep-ocean px-7 py-3 font-bold hover:bg-white transition-colors">
              Get in touch
            </button>
          </div>
        </div>

      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────

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

        {/* ── Sticky Navigation ── */}
        <StickyTabNav
          items={NAV_TABS}
          value={activeTab}
          onChange={(v) => setActiveTab(v as TabValue)}
        />

        {/* ── Content ── */}
        <div className="animate-fade-slide-up">
          {activeTab === 'colors' && <StyleColorsTab />}
          {activeTab === 'typography' && renderTypography()}
          {activeTab === 'ui' && renderUI()}
          {activeTab === 'patterns' && renderPatterns()}
          {activeTab === 'skeleton' && renderSkeleton()}
          {activeTab === 'card' && renderCard()}
          {activeTab === 'layout' && renderLayout()}
          {activeTab === 'quiz' && renderQuiz()}
          {activeTab === 'cherry' && renderCherry()}
          {activeTab === 'faq' && renderFaq()}
        </div>

      </div>
    </PageLayout>
  );
};

export default StyleCards;
