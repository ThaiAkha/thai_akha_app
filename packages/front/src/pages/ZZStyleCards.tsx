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
import AkhaLoader from '../components/ui/AkhaLoader';
import AkhaPixelLine from '../components/ui/AkhaPixelLine';
import AkhaQuote from '../components/ui/AkhaQuote';
import AkhaHistoryLine from '../components/blog/AkhaHistoryLine';
import Divider from '../components/ui/Divider';
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

// Card components
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card/Card';
import InfoCard from '../components/ui/card/InfoCard';
import StatCard from '../components/ui/card/StatCard';
import Alert from '../components/ui/card/Alert';
import GlassCard from '../components/ui/card/GlassCard';

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
      options: ['Turmeric', 'Curry Powder', 'Saffron'],
      correctAnswer: 'Turmeric',
      explanation: 'Turmeric (ขมิ้น) is the key spice responsible for the golden hue in Khao Soi broth.',
    },
    {
      id: 'q2',
      text: 'What is the Akha word for chilli pepper?',
      options: ['Prik', 'Kapi', 'Nam Pla'],
      correctAnswer: 'Prik',
      explanation: 'Prik (พริก) is the Thai/Akha word commonly used for chilli peppers.',
    },
    {
      id: 'q3',
      text: 'Which herb is essential for authentic Thai basil stir-fry?',
      options: ['Holy Basil', 'Sweet Basil', 'Lemon Basil'],
      correctAnswer: 'Holy Basil',
      explanation: 'Holy basil (กะเพรา) is the authentic choice for Pad Kra Pao, not sweet or lemon basil.',
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
  title: 'The Akha Path',
  subtitle: 'Master the foundations of Northern Thai cuisine and unlock your culinary heritage.',
  image: '/avatarCherry/600-Avatar-AuthPage.webp',
  modules: [MOCK_MODULE, MOCK_MODULE_2, MOCK_MODULE_3],
  rewardId: 1,
  is_active: true,
};

const MOCK_FEATURED_DATA = [
  { id: 'classes', title: 'Cooking Classes', desc: 'Master the art of Akha and Thai cuisine with our award-winning morning or evening sessions.', link: 'classes', image: '/avatarCherry/600-Avatar-AuthPage.webp', icon: 'restaurant' },
  { id: 'recipes', title: 'Traditional Recipes', desc: 'Explore our family cookbook featuring 11 authentic recipes passed down through generations.', link: 'recipes', image: '', icon: 'menu_book' },
  { id: 'culture', title: 'Akha Heritage', desc: 'Dive deep into the rich traditions, vibrant spirit, and unique history of the Akha people.', link: 'culture', image: '/avatarCherry/600-Avatar-AuthPage.webp', icon: 'temple_buddhist' },
  { id: 'cherry', title: 'Meet Cherry', desc: 'The soul of our kitchen. Discover her journey and the philosophy behind Thai Akha Kitchen.', link: 'about', image: '', icon: 'volunteer_activism' },
];

const MOCK_REWARDS = [
  { id: 1, label: 'First Steps', icon: 'star' },
  { id: 2, label: 'Spice Master', icon: 'local_fire_department' },
  { id: 3, label: 'Temple Visit', icon: 'temple_buddhist' },
  { id: 4, label: 'Market Expert', icon: 'storefront' },
  { id: 5, label: 'Chef Hat', icon: 'restaurant' },
  { id: 6, label: 'Gold Medal', icon: 'emoji_events' },
  { id: 7, label: 'Cherry Fan', icon: 'favorite' },
  { id: 8, label: 'Guardian', icon: 'shield' },
];

const TYPOGRAPHY_VARIANTS = [
  'display1', 'display2', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'titleMain', 'titleHighlight', 'paragraphL', 'paragraphM',
  'paragraphS', 'body', 'accent', 'badge', 'caption', 'quote',
  'numericPrice', 'numericStat', 'numericRegular'
] as const;

type TabValue = 'typography' | 'ui' | 'skeleton' | 'layout' | 'quiz' | 'card' | 'patterns';

const NAV_TABS = [
  { value: 'typography', label: 'Typography', icon: 'text_fields' },
  { value: 'ui', label: 'UI Components', icon: 'widgets' },
  { value: 'patterns', label: 'Patterns & Dividers', icon: 'line_style' },
  { value: 'card', label: 'Cards & Alerts', icon: 'view_agenda' },
  { value: 'skeleton', label: 'Skeleton', icon: 'motion_photos_off' },
  { value: 'layout', label: 'Layout & Headers', icon: 'dashboard' },
  { value: 'quiz', label: 'Quiz', icon: 'psychology' },
];

const StyleCards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('typography');

  // UI state
  const [toggleA, setToggleA] = useState(false);
  const [toggleB, setToggleB] = useState(true);
  const [chipActive, setChipActive] = useState('vegan');
  const [tabsValue, setTabsValue] = useState('menu');
  const [tabsPillValue, setTabsPillValue] = useState('bookings');
  const [page, setPage] = useState(2);

  // ── helpers ────────────────────────────────────────────────────────────────

  const SectionHead = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="border-b border-border pb-4 mb-10">
      <Typography variant="h2" color="primary" className="uppercase tracking-tight font-black">{title}</Typography>
      {subtitle && <Typography variant="caption" color="muted">{subtitle}</Typography>}
    </div>
  );

  // ── PATTERNS ──────────────────────────────────────────────────────────────

  const renderPatterns = () => (
    <div className="space-y-16">
      <SectionHead title="Patterns & Decorative" subtitle="AkhaPixelPattern · Loader · Dividers · Quotes" />

      <div>
        <SubHead title="Akha Pixel Pattern Variants" />
        <PropDoc text="Pattern geometrici tradizionali renderizzati pixel-by-pixel. Definiti in pixelPatterns.ts." />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <DemoBox label="variant: logo (size 16)">
            <AkhaPixelPattern variant="logo" size={16} />
          </DemoBox>
          <DemoBox label="variant: diamond (default)">
            <AkhaPixelPattern variant="diamond" />
          </DemoBox>
          <DemoBox label="variant: flower">
            <AkhaPixelPattern variant="flower" />
          </DemoBox>
          <DemoBox label="variant: mountain">
            <AkhaPixelPattern variant="mountain" />
          </DemoBox>
          <DemoBox label="variant: arrow">
            <AkhaPixelPattern variant="arrow" />
          </DemoBox>
          <DemoBox label="variant: zig_zag">
            <AkhaPixelPattern variant="zig_zag" />
          </DemoBox>
          <DemoBox label="variant: line_simple">
            <AkhaPixelPattern variant="line_simple" />
          </DemoBox>
          <DemoBox label="variant: line (size 8)">
            <AkhaPixelPattern variant="line" size={8} />
          </DemoBox>
        </div>
      </div>

      <div>
        <SubHead title="Specialized Pixel Components" />
        <PropDoc text="Componenti UI evoluti che utilizzano i pixel pattern per scopi specifici." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DemoBox label="AkhaLoader (variant: bloom)">
            <AkhaLoader variant="bloom" size={8} />
          </DemoBox>
          <DemoBox label="AkhaQuote (variant: main)">
            <AkhaQuote variant="main">The path to Akha wisdom starts in the kitchen.</AkhaQuote>
          </DemoBox>
          <DemoBox label="AkhaPixelLine (Mirrored divider)">
            <AkhaPixelLine />
          </DemoBox>
          <DemoBox label="AkhaHistoryLine (Multicolor Blog divider)">
            <AkhaHistoryLine />
          </DemoBox>
        </div>
      </div>

      <div>
        <SubHead title="Semantic Dividers" />
        <PropDoc text="Linee di separazione semantiche. variant: default | mineral | brand | action | gradient" />
        <div className="space-y-4 max-w-xl">
          <Divider label="Standard Divider" />
          <Divider variant="brand" label="Brand Style" />
          <Divider variant="action" label="Action Style" />
          <Divider variant="gradient" label="Gradient Style" />
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
            <div className="w-44 shrink-0">
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
              onAnswer={(opt) => console.log('answer', opt)}
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
              onAnswer={() => { }}
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
              onAnswer={() => { }}
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
      <SectionHead title="Card Components" subtitle="Card · GlassCard · InfoCard · StatCard · Alert" />

      {/* GLASSCARD */}
      <div>
        <SubHead title="GlassCard" />
        <PropDoc text="variant: primary | action | secondary | subtle — Un componente premium con effetto vetro, riflesso che segue il mouse e borsi luminosi." />
        <div className="space-y-6">
          <DemoBox label="Tutte le varianti" bg>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[url('/avatarCherry/600-Avatar-AuthPage.webp')] bg-cover relative">
              <div className="absolute inset-0 bg-black/80 rounded-2xl"></div>

              <div className="relative z-10 space-y-4">
                <GlassCard variant="primary" className="p-6">
                  <Typography variant="h4" className="text-white mb-2">Primary Flow</Typography>
                  <Typography variant="paragraphS" className="text-white/70">Riflessi caldi Cherry Red (var(--primary)).</Typography>
                </GlassCard>
                <GlassCard variant="action" className="p-6">
                  <Typography variant="h4" className="text-white mb-2">Action Accent</Typography>
                  <Typography variant="paragraphS" className="text-white/70">Luce interattiva verde chiaro (var(--action)).</Typography>
                </GlassCard>
              </div>

              <div className="relative z-10 space-y-4">
                <GlassCard variant="secondary" className="p-6">
                  <Typography variant="h4" className="text-white mb-2">Secondary Warmth</Typography>
                  <Typography variant="paragraphS" className="text-white/70">Luci arancioni tenui (var(--secondary)).</Typography>
                </GlassCard>
                <GlassCard variant="subtle" className="p-6">
                  <Typography variant="h4" className="text-white mb-2">Subtle Glass</Typography>
                  <Typography variant="paragraphS" className="text-white/70">Luce bianca neutra per un contrasto minimo.</Typography>
                </GlassCard>
              </div>
            </div>
          </DemoBox>
        </div>
      </div>

      {/* CARD */}
      <div>
        <SubHead title="Card (Core)" />
        <PropDoc text="variant: default | glass | outline | interactive | ghost  —  padding: none | sm | md | lg | xl  —  rounded: lg | xl | 2xl | 3xl | 4xl  —  shadow: sm | md | lg | xl | 2xl" />
        <div className="space-y-6">
          <DemoBox label="variant=glass · default" bg>
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Default variant with beautiful glassmorphism.</CardDescription>
              </CardHeader>
              <CardContent>This is the standard Card component. It uses CardHeader, CardTitle, CardDescription, and CardContent for consistent layout.</CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Confirm</Button>
              </CardFooter>
            </Card>
          </DemoBox>
          <DemoBox label="variant=interactive · padding=lg · rounded=2xl" bg>
            <Card variant="interactive" padding="lg" rounded="2xl" onClick={() => { }}>
              <CardTitle>Interactive Clickable</CardTitle>
              <CardContent>Hovers lift the card and add a nice brand-colored rim lighting effect.</CardContent>
            </Card>
          </DemoBox>
          <DemoBox label="variant=outline · shadow=none" bg>
            <Card variant="outline" padding="sm" shadow={undefined}>
              <CardContent>Simple outline card.</CardContent>
            </Card>
          </DemoBox>
        </div>
      </div>

      {/* INFOCARD */}
      <div>
        <SubHead title="InfoCard" />
        <PropDoc text="props: card { title, desc, link, image, icon } · layout: vertical | horizontal  —  For interactive item lists." />
        <div className="space-y-8">
          <DemoBox label="layout=vertical" bg>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <InfoCard
                layout="vertical"
                card={{ link: '#', title: 'Curry Paste', desc: 'Learn the secrets of pounding fresh herbs.', image: '/avatarCherry/600-Avatar-AuthPage.webp', icon: 'local_dining' }}
                onNavigate={() => { }}
              />
              <InfoCard
                layout="vertical"
                card={{ link: '#', title: 'Market Tour', desc: 'Discover vibrant local ingredients.', image: '', icon: 'storefront' }}
                onNavigate={() => { }}
              />
            </div>
          </DemoBox>
          <DemoBox label="layout=horizontal" bg>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                layout="horizontal"
                card={{ link: '#', title: 'Spicy Tom Yum', desc: 'A balance of sour, spicy, and fragrant herbs in a classic bowl.', image: '/avatarCherry/600-Avatar-AuthPage.webp', icon: 'soup_kitchen' }}
                onNavigate={() => { }}
              />
              <InfoCard
                layout="horizontal"
                card={{ link: '#', title: 'Pad Thai', desc: 'The national dish explained.', image: '', icon: 'ramen_dining' }}
                onNavigate={() => { }}
              />
            </div>
          </DemoBox>
        </div>
      </div>

      {/* HOME FEATURED SECTION */}
      <div>
        <SubHead title="Home Page Featured Grid" />
        <PropDoc text="Griglia completa utilizzata nella Homepage per presentare le sezioni chiave (dati mock da dataFeatured.ts)." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_FEATURED_DATA.map((card) => (
            <InfoCard key={card.id} card={card} onNavigate={() => { }} />
          ))}
        </div>
      </div>

      {/* STATCARD */}
      <div>
        <SubHead title="StatCard" />
        <PropDoc text="color: primary | secondary | action | success | warning | error | info | default | quiz | transparent  —  trend: up | down | neutral  —  valuePosition: top | bottom  —  align: left | center | right  —  iconPosition: top | left | right" />
        <div className="space-y-8">
          <DemoBox label="color=primary · align=center · iconPosition=top" bg>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Total Classes" value="12" icon="event" color="primary" align="center" iconPosition="top" />
              <StatCard title="Active Students" value="1,240" icon="groups" color="action" align="center" iconPosition="top" />
              <StatCard title="Avg Rating" value="4.9" suffix="/5" icon="star" color="quiz" align="center" iconPosition="top" />
            </div>
          </DemoBox>
          <DemoBox label="align=left · iconPosition=left · valuePosition=bottom" bg>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard title="Revenue" value="15,400" suffix="THB" icon="payments" color="success" align="left" iconPosition="left" valuePosition="bottom" description="Up from last week" />
              <StatCard title="Refunds" value="3" icon="money_off" color="error" align="left" iconPosition="left" valuePosition="bottom" description="Requires attention" />
            </div>
          </DemoBox>
        </div>
      </div>

      {/* ALERT */}
      <div>
        <SubHead title="Alert" />
        <PropDoc text="variant: info | success | warning | error  —  props: title, subtitle, message, body, icon, list" />
        <div className="space-y-6">
          <DemoBox label="variant=info · basic">
            <Alert variant="info" message="This is an informational message perfect for general guidance." />
          </DemoBox>
          <DemoBox label="variant=success · with title and close">
            <Alert variant="success" title="Booking Confirmed" message="Your cooking class has been successfully booked for tomorrow." onClose={() => { }} />
          </DemoBox>
          <DemoBox label="variant=warning · with body and custom generic icon">
            <Alert variant="warning" title="Dietary Note" subtitle="Vegetarian" icon="grass" message="This recipe contains fish sauce." body="Can be replaced with soy sauce or vegan fish sauce upon request." />
          </DemoBox>
          <DemoBox label="variant=error · with list array">
            <Alert
              variant="error"
              title="Severe Allergy Warning"
              subtitle="Peanut Allergy"
              message="This dish uses crushed peanuts as a garnish."
              list={["Remove peanuts entirely", "Substitute with toasted sesame seeds", "Use cashews if safely tolerated"]}
            />
          </DemoBox>
        </div>
      </div>

    </div>
  );

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
          {activeTab === 'typography' && renderTypography()}
          {activeTab === 'ui' && renderUI()}
          {activeTab === 'patterns' && renderPatterns()}
          {activeTab === 'skeleton' && renderSkeleton()}
          {activeTab === 'card' && renderCard()}
          {activeTab === 'layout' && renderLayout()}
          {activeTab === 'quiz' && renderQuiz()}
        </div>

      </div>
    </PageLayout>
  );
};

export default StyleCards;
