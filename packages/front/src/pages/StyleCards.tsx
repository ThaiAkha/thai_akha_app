import React, { useEffect, useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import {
  Alert, Avatar, Badge, Button, Card, CardContent, Chip, ClassPicker,
  Divider, Icon, InfoCard, Pagination, ProgressBar, Slider, GlassCard,
  StatCard, Table, Tabs, Toggle, Tooltip, Typography,
} from '../components/ui/index';
import { Input, Textarea } from '../components/ui/form';
import { contentService } from '@thaiakha/shared/services';
import { authService } from '../services/auth.service';
import type { SessionType } from '../components/booking/ClassPicker';
import type { Column } from '../components/ui/Table';

// --- DOMAIN COMPONENTS ---
import AuthForm from '../components/auth/AuthForm';
import { ChatBox } from '../components/chat/index';
import ChatInput from '../components/chat/ChatInput';
import { Sidebar, SidebarMobile } from '../components/layout/index';
import { MegaMenu } from '../components/recipes/index';
import { MenuCard, RecipeView, Certificate } from '../components/menu/index';
import { Modal, Photo, Video, Gallery } from '../components/modal/index';
import AudioPlayer from '../components/modal/AudioPlayer';
import { QuizCard, LevelQuiz } from '../components/quiz/index';
import { UserProfileCard, UserSettings, QuizWidget } from '../components/user-dashboard/index';
import ClassHeroCard from '../components/classes/ClassHeroCard';

// --- MOCK DATA ---
const MOCK_USER: any = {
  id: 'user-123',
  full_name: 'Svevo Mondino',
  email: 'svevo@example.com',
  role: 'admin',
  dietary_profile: 'None',
  allergies: [],
  avatar_url: 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg',
  created_at: new Date().toISOString(),
};

const MOCK_RECIPE = {
  id: 'recipe-1',
  title: 'Akha Phak Chi',
  description: 'Authentic Akha salad with fresh herbs and peanuts. This traditional dish brings the vibrant flavors of the mountains to your table.',
  image_url: 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/food02.jpg',
  image: 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/food02.jpg',
  difficulty: 'easy',
  prep_time: 15,
  cook_time: 0,
  servings: 2,
  category: 'Salad',
  ingredients: [
    { item: 'Phak Chi (Coriander)', amount: '1 bunch', note: 'Fresh only' },
    { item: 'Peanuts', amount: '50g', note: 'Roasted and crushed' },
    { item: 'Chili', amount: '2 small', note: 'Optional' }
  ],
  steps: [
    { title: 'Preparation', description: 'Wash and dry the coriander thoroughly. Chop into 2-inch pieces.' },
    { title: 'Mixing', description: 'Toss all ingredients in a large bowl with the dressing.' }
  ],
};

const MOCK_QUIZ = {
  id: 'quiz-1',
  title: 'Akha Culture & History',
  description: 'Test your knowledge about the rich traditions and origins of the Akha people.',
  icon: 'history_edu',
  level: 'beginner',
  points: 100,
  questions_count: 5,
};

// --- HELPERS ---
const ChatShowcase = () => {
    const [msg, setMsg] = React.useState('');
    return (
        <div className="p-6 bg-surface/30 rounded-3xl border border-border">
            <ChatInput 
                input={msg} 
                setInput={setMsg} 
                handleSend={() => { console.log('Sent:', msg); setMsg(''); }} 
                isListening={false} 
                handleMicClick={() => {}} 
                isLoading={false} 
            />
        </div>
    );
};

// --- TABLE DEMO DATA ---
interface ClassRow { id: number; name: string; time: string; price: string; spots: number; }
const TABLE_DATA: ClassRow[] = [
  { id: 1, name: 'Morning Class', time: '08:30', price: '1,400 THB', spots: 8 },
  { id: 2, name: 'Evening Class', time: '16:00', price: '1,200 THB', spots: 12 },
  { id: 3, name: 'Private Session', time: 'On request', price: '3,500 THB', spots: 4 },
];
const TABLE_COLS: Column<ClassRow>[] = [
  { key: 'name', header: 'Class' },
  { key: 'time', header: 'Time', align: 'center' },
  { key: 'price', header: 'Price', align: 'right' },
  {
    key: 'spots', header: 'Spots', align: 'center', render: (v) => (
      <Badge variant={v <= 4 ? 'allergy' : 'solid'}>{v} left</Badge>
    )
  },
];

const TYPOGRAPHY_VARIANTS = [
  'display1', 'display2', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'titleMain', 'titleHighlight', 'paragraphL', 'paragraphM', 'paragraphS', 'body',
  'accent', 'badge', 'caption', 'quote',
] as const;

const TABS_OVERVIEW = [
  { value: 'overview', label: 'Overview', icon: 'dashboard' },
  { value: 'morning', label: 'Morning', icon: 'wb_sunny' },
  { value: 'evening', label: 'Evening', icon: 'dark_mode' },
];
const TABS_PILLS = [
  { value: 'all', label: 'All Classes', icon: 'view_agenda' },
  { value: 'morning', label: 'Morning', icon: 'wb_sunny', badge: 2 },
  { value: 'evening', label: 'Evening', icon: 'dark_mode' },
];
const ICONS_DEMO = [
  'home', 'restaurant', 'calendar_month', 'favorite', 'star',
  'search', 'settings', 'person', 'check_circle', 'chat',
  'location_on', 'play_arrow', 'photo_camera', 'wb_sunny', 'close',
];

// Testo lungo per dimostrazione
const LOREM_IPSUM = "L'esperienza culinaria Thai Akha Kitchen unisce tradizione e innovazione. Le nostre classi di cucina ti porteranno alla scoperta delle ricette ancestrali delle montagne del Nord della Thailandia, con ingredienti freschi e tecniche tramandate da generazioni.";

const StyleCards: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  type TabValue = 'typography' | 'auth' | 'booking' | 'chat' | 'classes' | 'layout' | 'menu' | 'modal' | 'quiz' | 'recipes' | 'ui' | 'user-dashboard';
  const [activeTab, setActiveTab] = useState<TabValue>('typography');

  // Interactive states
  const [toggleState, setToggleState] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sliderValue, setSliderValue] = useState(60);
  const [pickerDate, setPickerDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickerSession, setPickerSession] = useState<SessionType>('morning_class');
  const [tabValue, setTabValue] = useState('overview');
  const [pillsValue, setPillsValue] = useState('all');
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    contentService.getHomeCards('en')
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Section label helper
  const SectionHead = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="border-b pb-4 mb-8 border-slate-200 dark:border-white/10">
      <Typography variant="h2" className="text-primary uppercase tracking-tight font-black">
        {title}
      </Typography>
      {subtitle && <Typography variant="caption" className="opacity-60">{subtitle}</Typography>}
    </div>
  );

  const TABS = [
    { value: 'typography', label: 'Typography' },
    { value: 'auth', label: 'Auth' },
    { value: 'booking', label: 'Booking' },
    { value: 'chat', label: 'Chat' },
    { value: 'classes', label: 'Classes' },
    { value: 'layout', label: 'Layout' },
    { value: 'menu', label: 'Menu' },
    { value: 'modal', label: 'Modal' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'recipes', label: 'Recipes' },
    { value: 'ui', label: 'UI' },
    { value: 'user-dashboard', label: 'Dashboard' },
  ];

  return (
    <PageLayout
      slug="styleguide"
      hideDefaultHeader={true}
      customMetadata={{ titleMain: 'Style', titleHighlight: 'Guide', description: 'Sistema di design completo — tipografia, componenti, colori e interazioni', icon: 'palette', imageUrl: '', badge: 'v2.0' }}
    >
      <div className="max-w-7xl mx-auto">

        {/* STICKY NAVIGATION */}
        <div className="sticky top-[20px] z-50 bg-background/80 backdrop-blur-xl border-y border-border mb-12 -mx-4 px-4 overflow-x-auto no-scrollbar py-4">
          <div className="max-w-7xl mx-auto flex justify-center scale-80">
            <Tabs
              items={TABS}
              value={activeTab}
              onChange={(v) => setActiveTab(v as TabValue)}
              variant="pills"
            />
          </div>
        </div>

        <div className="space-y-24 pb-32">

          {/* ========== TYPOGRAPHY SECTION ========== */}
          {activeTab === 'typography' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="Typography" subtitle="The foundation of our visual language." />

              <section className="space-y-12">
                <div className="space-y-4 overflow-hidden bg-surface/50 p-8 rounded-3xl border border-border shadow-theme-lg">
                  {TYPOGRAPHY_VARIANTS.map(v => (
                    <div key={v} className="flex items-baseline gap-6 border-b border-white/5 last:border-0 pb-4">
                      <Typography variant="microLabel" className="shrink-0 w-28 opacity-40">{v}</Typography>
                      <Typography variant={v} className="truncate">
                        {v === 'quote'
                          ? 'Akha kitchen is the heart of our culture.'
                          : 'Thai Akha Kitchen — Authentic Cooking Experience'}
                      </Typography>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <Typography variant="h4" color="action">Text Blocks (Left)</Typography>
                    {(['paragraphL', 'paragraphM', 'paragraphS', 'body'] as const).map(v => (
                      <div key={v} className="space-y-2">
                        <Typography variant="microLabel" className="opacity-40">{v}</Typography>
                        <Typography variant={v}>{LOREM_IPSUM}</Typography>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    <Typography variant="h4" color="action" className="text-right">Text Blocks (Right)</Typography>
                    {(['paragraphL', 'paragraphM', 'paragraphS', 'body'] as const).map(v => (
                      <div key={v} className="space-y-2 text-right">
                        <Typography variant="microLabel" className="opacity-40">{v}</Typography>
                        <Typography variant={v}>{LOREM_IPSUM}</Typography>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <Typography variant="h4" color="action">Color Variants</Typography>
                  <div className="flex flex-wrap gap-10 items-center justify-between p-8 bg-surface/30 rounded-3xl border border-border/50">
                    {(['default', 'title', 'muted', 'primary', 'secondary', 'action', 'quiz'] as const).map(c => (
                      <div key={c} className="text-center group">
                        <Typography variant="h3" color={c} className="transition-transform group-hover:scale-110 duration-300">Aa</Typography>
                        <Typography variant="microLabel" className="mt-2 block opacity-50">{c}</Typography>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
          {/* ========== UI COMPONENTS SECTION ========== */}
          {activeTab === 'ui' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="UI Components" subtitle="Atomic elements and basic molecules." />

              <section className="space-y-12">
                <Typography variant="h4" color="action">Data & Text Variants</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-8 bg-surface/50 rounded-3xl border border-border">
                  <div className="space-y-8">
                    <div>
                      <Typography variant="h5" className="mb-3 text-action">monoLabel</Typography>
                      <div className="space-y-2">
                        <Typography variant="monoLabel">REF: #AK-2026-03-19</Typography>
                        <Typography variant="monoLabel">BOOKING CODE: MORN-001</Typography>
                        <Typography variant="monoLabel">STEP 3 OF 5</Typography>
                      </div>
                    </div>
                    <div>
                      <Typography variant="h5" className="mb-3 text-action">statNumber</Typography>
                      <div className="space-y-2">
                        <Typography variant="statNumber" color="primary">฿ 2,400</Typography>
                        <Typography variant="statNumber" color="action">1,200 guests</Typography>
                        <Typography variant="statNumber" color="quiz">98%</Typography>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Typography variant="h5" className="text-action">microLabel</Typography>
                      <div className="flex gap-4">
                        <Typography variant="microLabel">GUESTS</Typography>
                        <Typography variant="body">4 adults</Typography>
                      </div>
                      <div className="flex gap-4">
                        <Typography variant="microLabel">DIET</Typography>
                        <Typography variant="body">Vegan</Typography>
                      </div>
                      <div className="flex gap-4">
                        <Typography variant="microLabel">CLASS</Typography>
                        <Typography variant="body">Morning Session</Typography>
                      </div>
                    </div>

                    <div>
                      <Typography variant="h5" className="mb-3 text-action">fieldLabel</Typography>
                      <div className="space-y-4">
                        <div>
                          <Typography variant="fieldLabel">Full Name</Typography>
                          <input type="text" placeholder="Enter your name" className="mt-1 block w-full rounded-lg border border-border bg-transparent px-4 py-2 text-desc" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-12">
                <SectionHead title="Buttons & Actions" />
                <div className="flex flex-wrap gap-4 items-center p-8 bg-surface/30 rounded-3xl border border-border/50">
                  <Button variant="primary">Primary</Button>
                  <Button variant="brand">Brand</Button>
                  <Button variant="action">Action</Button>
                  <Button variant="mineral">Mineral</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="pill">Pill</Button>
                </div>
              </section>

              <section className="space-y-12">
                <SectionHead title="Badges & Chips" />
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="solid">Solid</Badge>
                  <Badge variant="brand">Brand</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="mineral">Mineral</Badge>
                  <Badge variant="allergy">Allergy</Badge>
                  <Chip label="Chip item" />
                  <Chip label="Active Chip" active />
                </div>
              </section>

              <section className="space-y-12">
                <SectionHead title="Icons" />
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4">
                  {ICONS_DEMO.map(name => (
                    <div key={name} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5">
                      <Icon name={name} size="lg" />
                      <Typography variant="microLabel">{name}</Typography>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-8">
                <SectionHead title="Alert" subtitle="Used for messages, errors and warnings." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Alert variant="info" title="Information" message="Your booking is being processed." />
                  <Alert variant="success" title="Confirmed!" message="Morning class booked for March 20." />
                  <Alert variant="warning" title="Dietary Note" message="This dish contains lemongrass." />
                  <Alert
                    variant="error"
                    title="Allergy Alert"
                    message="This recipe contains peanuts. Safe substitutions available:"
                    list={['Sunflower seed butter', 'Pumpkin seeds', 'Sesame paste']}
                  />
                  {showAlert && (
                    <Alert
                      variant="info"
                      message="This alert can be closed."
                      onClose={() => setShowAlert(false)}
                    />
                  )}
                </div>
              </section>

              <section className="space-y-8">
                <SectionHead title="Avatar" />
                <div className="flex flex-wrap gap-6 items-center">
                  <Avatar size="lg" initials="TA" />
                  <Avatar size="lg" />
                  <Avatar size="lg" src="https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg" alt="Cherry" />
                </div>
              </section>

              <section className="space-y-8">
                <SectionHead title="Card" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(['default', 'glass', 'outline', 'interactive'] as const).map(v => (
                    <Card key={v} variant={v}>
                      <CardContent className="text-center py-6">
                        <Typography variant="h5" className="capitalize">{v}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <section className="space-y-8">
                <SectionHead title="Glass Card" subtitle="Premium glassmorphism with dynamic gradient borders." />
                <div className="space-y-8">
                  {/* Variants grid */}
                  <div>
                    <Typography variant="h5" className="mb-4 text-action">Variants</Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <GlassCard variant="primary" innerClassName="p-6">
                        <Typography variant="h6" className="mb-2">Primary Variant</Typography>
                        <Typography variant="body" color="sub">Lime + Cherry gradient. Best for standard cards and profiles.</Typography>
                      </GlassCard>
                      <GlassCard variant="action" innerClassName="p-6">
                        <Typography variant="h6" className="mb-2">Action Variant</Typography>
                        <Typography variant="body" color="sub">Lime green focus. Perfect for CTAs and success states.</Typography>
                      </GlassCard>
                      <GlassCard variant="secondary" innerClassName="p-6">
                        <Typography variant="h6" className="mb-2">Secondary Variant</Typography>
                        <Typography variant="body" color="sub">Dark Cherry focus. Ideal for premium and featured content.</Typography>
                      </GlassCard>
                      <GlassCard variant="subtle" innerClassName="p-6">
                        <Typography variant="h6" className="mb-2">Subtle Variant</Typography>
                        <Typography variant="body" color="sub">Soft glow effect. Great for nested and background content.</Typography>
                      </GlassCard>
                    </div>
                  </div>

                  {/* Hero card showcase */}
                  <div>
                    <Typography variant="h5" className="mb-4 text-action">Hero Card</Typography>
                    <ClassHeroCard
                      badge="Experience"
                      title="Market Tour & Cooking Class"
                      description="Step into the Akha world. Learn authentic cooking from village masters, explore local markets, and taste the culture at its finest."
                      icon={<Icon name="restaurant" size="lg" />}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <SectionHead title="Form Inputs" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Input placeholder="Default variant..." label="Default Input" />
                    <Input leftIcon="search" placeholder="Search..." label="Search" />
                    <Input error helperText="Invalid input" label="Error State" />
                  </div>
                  <div className="space-y-4">
                    <Textarea label="Default Textarea" placeholder="Scrivi qui..." fullWidth rows={3} />
                    <Toggle checked={toggleState} onChange={setToggleState} label="Interactive Toggle" />
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <SectionHead title="Tooltips" />
                <div className="flex gap-8 justify-center">
                  <Tooltip content="Tooltip message" position="top">
                    <Badge variant="mineral">Hover Me</Badge>
                  </Tooltip>
                </div>
              </section>

              <section className="space-y-8">
                <SectionHead title="StatCard" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard title="Total Bookings" value="1,284" icon="calendar_today" trend="up" />
                  <StatCard title="Revenue" value="฿ 452,000" icon="payments" color="primary" />
                  <StatCard title="Active Classes" value="8" icon="school" color="action" />
                </div>
              </section>

              <section className="space-y-8">
                <SectionHead title="Progress & Slider" />
                <div className="space-y-8 max-w-md mx-auto">
                  <div className="space-y-2">
                    <Typography variant="microLabel">ProgressBar (65%)</Typography>
                    <ProgressBar value={65} color="primary" showValue />
                  </div>
                  <div className="space-y-2">
                    <Typography variant="microLabel">Interactive Slider ({sliderValue}%)</Typography>
                    <Slider value={sliderValue} onChange={setSliderValue} min={0} max={100} />
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <SectionHead title="Table & Pagination" />
                <div className="space-y-6">
                  <Table columns={TABLE_COLS} data={TABLE_DATA} />
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={5}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <SectionHead title="Divider" />
                <div className="space-y-4">
                  <Typography variant="body">Above Divider</Typography>
                  <Divider />
                  <Typography variant="body">Below Divider (Default)</Typography>
                  <Divider label="With Label" />
                  <Typography variant="body">Below Divider with Label</Typography>
                </div>
              </section>
            </div>
          )}

          {/* ========== BOOKING SECTION ========== */}
          {activeTab === 'booking' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="Booking" subtitle="Class selection and reservation flows." />
              <section className="space-y-8">
                <SectionHead title="ClassPicker" />
                <ClassPicker
                  date={pickerDate}
                  onDateChange={setPickerDate}
                  session={pickerSession}
                  onSessionChange={setPickerSession}
                />
                <Typography variant="monoLabel">
                  Selected: <strong>{pickerDate}</strong> — Session: <strong>{pickerSession}</strong>
                </Typography>
              </section>
            </div>
          )}

          {/* ========== CLASSES SECTION ========== */}
          {activeTab === 'classes' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="Classes" subtitle="Class information and display cards." />
              <section className="space-y-8">
                <SectionHead title="InfoCard (Real Data)" />
                {!loading && cards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.slice(0, 3).map(card => (
                      <InfoCard
                        key={`class-${card.id}`}
                        card={{ id: card.id, title: card.title, desc: card.description, link: card.target_path || '#', image: card.image_url, icon: card.icon_name }}
                        layout="vertical"
                        onNavigate={() => { }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center opacity-50 italic border border-dashed rounded-3xl">Loading or no data...</div>
                )}
              </section>
            </div>
          )}

          {/* ========== AUTH SECTION ========== */}
          {activeTab === 'auth' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="Authentication" subtitle="Login, Register and Recovery components." />
              <div className="max-w-md mx-auto">
                <Card variant="glass" className="p-8">
                  <AuthForm onSuccess={() => {}} onNavigate={() => {}} />
                </Card>
              </div>
            </div>
          )}

          {/* ========== CHAT SECTION ========== */}
          {activeTab === 'chat' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="Chat" subtitle="Direct messaging and group conversations." />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="h-[600px] border border-border rounded-3xl overflow-hidden shadow-2xl bg-surface/50 backdrop-blur-md">
                   <ChatBox userProfile={MOCK_USER} isDarkMode={true} />
                </div>
                <div className="space-y-8">
                   <SectionHead title="Chat Input" subtitle="Rich message composer with voice support." />
                   <ChatShowcase />
                </div>
              </div>
            </div>
          )}

          {/* ========== LAYOUT SECTION ========== */}
          {activeTab === 'layout' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="Layout & Navigation" subtitle="Global structure and navigational elements." />
              <div className="space-y-16">
                <div>
                  <SectionHead title="Sidebar (Desktop Preview)" />
                  <div className="h-[500px] border border-dashed border-border/50 rounded-3xl overflow-hidden relative bg-slate-900/10">
                    <div className="absolute inset-0 flex">
                      <Sidebar 
                        currentPage="style" 
                        onNavigate={() => {}} 
                        isOpen={true} 
                        onToggle={() => {}} 
                        isDarkMode={true} 
                        onToggleTheme={() => {}} 
                        userProfile={MOCK_USER} 
                        onLogout={() => {}} 
                      />
                      <div className="flex-1 p-8 opacity-20 italic">Main Content Area Mockup</div>
                    </div>
                  </div>
                </div>

                <div>
                  <SectionHead title="MegaMenu" subtitle="The primary navigation bridge." />
                  <div className="relative h-[400px] bg-background rounded-3xl border border-border overflow-hidden">
                    <MegaMenu title="Main Menu" onNavigate={() => {}} onClose={() => {}} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== MENU SECTION ========== */}
          {activeTab === 'menu' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="Menu & Certification" subtitle="Showcasing meals and achievements." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <SectionHead title="Menu Card" />
                  <MenuCard 
                    dish={MOCK_RECIPE} 
                    isSelected={false} 
                    onClick={() => {}} 
                    dietLabel="REGULAR"
                  />
                </div>
                <div>
                  <SectionHead title="Certificate" />
                  <Certificate 
                    name="John Doe" 
                    date="March 2026" 
                    classType="Private Session" 
                    dishes={[{ 
                      name: 'Phak Chi Salad', 
                      image: MOCK_RECIPE.image 
                    }]} 
                    onClose={() => {}} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========== MODAL SECTION ========== */}
          {activeTab === 'modal' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="Modals & Media" subtitle="Overlay windows and media players." />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6 space-y-4">
                   <SectionHead title="Audio Player" />
                   <AudioPlayer title="The Legend of Akha" url="#" />
                </Card>
                <div className="space-y-4">
                   <SectionHead title="Gallery & Photos" />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-square bg-surface rounded-xl border border-border flex items-center justify-center opacity-40">Photo Slot</div>
                      <div className="aspect-square bg-surface rounded-xl border border-border flex items-center justify-center opacity-40">Video Slot</div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== QUIZ SECTION ========== */}
          {activeTab === 'quiz' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="Quiz System" subtitle="Educational challenges and rewards." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <QuizCard awardedBonuses={[1, 2]} rewards={[{ id: 1, label: 'Sprout', icon: 'star' }]} onCardClick={() => {}} />
                <Card className="p-8 bg-surface/50 overflow-hidden">
                   <LevelQuiz 
                     level={{ 
                       id: '1', 
                       title: 'Beginner', 
                       modules: [{ id: 'm1', title: 'Basics', icon: 'star', questions: [1,2,3] }] 
                     } as any} 
                     completedModules={['m1']} 
                     perfectModules={[]} 
                     bestScores={{}} 
                     onStartModule={() => {}} 
                     onBack={() => {}} 
                   />
                </Card>
              </div>
            </div>
          )}

          {/* ========== RECIPES SECTION ========== */}
          {activeTab === 'recipes' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="Recipes" subtitle="Detailed cooking instructions and views." />
              <div className="max-w-4xl mx-auto">
                <RecipeView 
                  recipe={MOCK_RECIPE as any} 
                  onBack={() => {}} 
                  allRecipes={[MOCK_RECIPE as any]}
                  activeDiet="Regular"
                  onSelectDish={() => {}}
                />
              </div>
            </div>
          )}

          {/* ========== USER DASHBOARD SECTION ========== */}
          {activeTab === 'user-dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-20">
              <SectionHead title="User Dashboard" subtitle="Personalized controls and overview." />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <UserProfileCard userProfile={MOCK_USER} />
                <div className="space-y-8">
                  <UserSettings userProfile={MOCK_USER} spicinessLevels={[]} onUpdate={() => {}} onBack={() => {}} />
                  <QuizWidget onNavigate={() => {}} userProfile={MOCK_USER} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default StyleCards;