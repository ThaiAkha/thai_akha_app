import React, { useEffect, useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import {
  Alert, Avatar, Badge, Button, Card, CardContent, Chip, ClassPicker,
  Divider, Icon, InfoCard, Input, Pagination, ProgressBar, Slider,
  StatCard, Table, Tabs, Textarea, Toggle, Tooltip, Typography,
} from '../components/ui/index';
import { contentService } from '@thaiakha/shared/services';
import type { SessionType } from '../components/booking/ClassPicker';
import type { Column } from '../components/ui/Table';

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
  { key: 'spots', header: 'Spots', align: 'center', render: (v) => (
    <Badge variant={v <= 4 ? 'allergy' : 'solid'}>{v} left</Badge>
  )},
];

const TYPOGRAPHY_VARIANTS = [
  'display1', 'display2', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'titleMain', 'titleHighlight', 'paragraphL', 'paragraphM', 'paragraphS',
  'accent', 'badge', 'caption', 'body', 'quote',
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

const StyleCards: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  const SectionHead = ({ n, title }: { n: number; title: string }) => (
    <Typography variant="h3" className="border-b pb-2 border-slate-200 dark:border-white/10">
      {n}. {title}
    </Typography>
  );
  const SpecBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl mb-6">
      <Typography variant="body" className="font-mono text-sm opacity-80">{children}</Typography>
    </div>
  );

  return (
    <PageLayout
      slug="styleguide"
      hideDefaultHeader={true}
      customMetadata={{ titleMain: 'Style', titleHighlight: 'Guide', description: '', icon: 'palette', imageUrl: '', badge: '' }}
    >
      <div className="max-w-7xl mx-auto space-y-16">

        {/* PAGE HEADER */}
        <div className="text-center space-y-4">
          <Typography variant="h2" className="text-primary font-black uppercase italic tracking-tighter">
            Styleguide: Component Library
          </Typography>
          <Typography variant="body" className="opacity-70 max-w-2xl mx-auto">
            Anteprima di tutti i componenti UI — ordinati alfabeticamente — con varianti, stati e dati reali dal database.
          </Typography>
        </div>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 1. ALERT */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={1} title="Alert" />
          <SpecBox>
            <strong>Variants:</strong> info, success, warning, error |{' '}
            <strong>Props:</strong> title, message, list[], onClose |{' '}
            <strong>Border Radius:</strong> rounded-[1.5rem]
          </SpecBox>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert variant="info" title="Information" message="Your booking is being processed. Please wait a moment." />
            <Alert variant="success" title="Confirmed!" message="Morning class booked for March 20 at 08:30." />
            <Alert variant="warning" title="Dietary Note" message="This dish contains lemongrass and galangal." />
            <Alert
              variant="error"
              title="Allergy Alert"
              message="This recipe contains peanuts. Safe substitutions available:"
              list={['Sunflower seed butter', 'Pumpkin seeds', 'Sesame paste']}
            />
            {showAlert && (
              <Alert
                variant="info"
                message="This alert can be closed with the × button."
                onClose={() => setShowAlert(false)}
              />
            )}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 2. AVATAR */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={2} title="Avatar" />
          <SpecBox>
            <strong>Sizes:</strong> sm (32px), md (48px), lg (64px), xl (96px), 2xl (128px) |{' '}
            <strong>Content:</strong> src image, initials (brand gradient), default icon
          </SpecBox>
          <div className="space-y-8">
            <div>
              <Typography variant="h5" className="mb-4 text-action">Sizes — Initials</Typography>
              <div className="flex flex-wrap gap-6 items-end">
                {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map(s => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <Avatar size={s} initials="AK" />
                    <span className="text-[10px] opacity-50 font-mono">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Typography variant="h5" className="mb-4 text-action">States</Typography>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="lg" initials="TA" />
                  <span className="text-[10px] opacity-50">Initials</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="lg" />
                  <span className="text-[10px] opacity-50">No src</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="lg" bordered={false} initials="CH" />
                  <span className="text-[10px] opacity-50">No border</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar
                    size="lg"
                    src="https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg"
                    alt="Cherry"
                  />
                  <span className="text-[10px] opacity-50">With image</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 3. BADGE */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={3} title="Badge" />
          <SpecBox>
            <strong>Spacing:</strong> px-4 py-1 (allergy: px-3 py-2) |{' '}
            <strong>Border Radius:</strong> rounded-full |{' '}
            <strong>Font:</strong> Accent, uppercase, tracking-[0.15em]
          </SpecBox>
          <div className="flex flex-wrap gap-4 items-center">
            <Badge variant="solid">Solid</Badge>
            <Badge variant="brand">Brand</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="mineral">Mineral</Badge>
            <Badge variant="allergy">Allergy</Badge>
            <Badge variant="allergy" active>Allergy Active</Badge>
            <Badge variant="brand" icon="star">With Icon</Badge>
            <Badge variant="brand" icon="notifications" pulse>Pulse</Badge>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 4. BUTTON */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={4} title="Button" />
          <SpecBox>
            <strong>Sizes:</strong> xs→xl |{' '}
            <strong>Variants:</strong> primary, brand, action, mineral, outline, ghost, secondary, pill, nav |{' '}
            <strong>Font:</strong> Display, uppercase
          </SpecBox>

          <Typography variant="h5" className="mb-2 text-action">Variants</Typography>
          <div className="flex flex-wrap gap-4 items-center mb-8">
            <Button variant="primary">Primary</Button>
            <Button variant="brand">Brand</Button>
            <Button variant="action">Action</Button>
            <Button variant="mineral">Mineral</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="pill">Pill</Button>
            <Button variant="nav">Nav Default</Button>
            <Button variant="nav" isActive>Nav Active</Button>
            <Button variant="nav" isPast>Nav Past</Button>
          </div>

          <Typography variant="h5" className="mb-2 text-action">Sizes</Typography>
          <div className="flex flex-wrap gap-4 items-center mb-8">
            <Button size="xs">Size XS</Button>
            <Button size="sm">Size SM</Button>
            <Button size="md">Size MD</Button>
            <Button size="lg">Size LG</Button>
            <Button size="xl">Size XL</Button>
          </div>

          <Typography variant="h5" className="mb-2 text-action">With Icons</Typography>
          <div className="flex flex-wrap gap-4 items-center">
            <Button icon="send" iconPosition="left">Left Icon</Button>
            <Button icon="arrow_forward" iconPosition="right">Right Icon</Button>
            <Button icon="thumb_up" iconPosition="only" aria-label="Like" />
            <Button isLoading>Loading</Button>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 5. CARD */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={5} title="Card" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['default', 'glass', 'outline', 'interactive'] as const).map(v => (
              <Card key={v} variant={v}>
                <CardContent className="text-center py-6">
                  <Typography variant="h5" className="capitalize">{v}</Typography>
                  <Typography variant="body" className="text-sm mt-2 opacity-60">
                    {v === 'default' && 'Sfondo solido, bordo leggero.'}
                    {v === 'glass' && 'Effetto smaltato sfocato.'}
                    {v === 'outline' && 'Sfondo trasparente, bordo rinforzato.'}
                    {v === 'interactive' && 'Effetti all\'hover e sollevamento.'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 6. CHIP */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={6} title="Chip" />
          <SpecBox>
            <strong>Spacing:</strong> px-5 py-2.5 |{' '}
            <strong>Border Radius:</strong> rounded-2xl |{' '}
            <strong>Font:</strong> Accent, text-[11px], font-black, uppercase
          </SpecBox>
          <div className="flex flex-wrap gap-4 items-center">
            <Chip label="Inactive Chip" />
            <Chip label="Active Chip" active />
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 7. CLASS PICKER */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={7} title="ClassPicker" />
          <SpecBox>
            <strong>Props:</strong> date, onDateChange, session, onSessionChange |{' '}
            <strong>Sessions:</strong> morning_class, evening_class, all |{' '}
            <strong>Style:</strong> Glass action container, date pill + session switcher
          </SpecBox>
          <ClassPicker
            date={pickerDate}
            onDateChange={setPickerDate}
            session={pickerSession}
            onSessionChange={setPickerSession}
          />
          <div className="text-sm opacity-50 font-mono">
            Selected: <strong>{pickerDate}</strong> — Session: <strong>{pickerSession}</strong>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 8. DIVIDER */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={8} title="Divider" />
          <SpecBox>
            <strong>Variants:</strong> default, mineral, brand, action, gradient |{' '}
            <strong>Labels:</strong> supported with labelPosition (left/center/right) |{' '}
            <strong>Orientation:</strong> horizontal (default), vertical
          </SpecBox>
          <div className="space-y-6">
            <Divider variant="default" />
            <Divider variant="brand" />
            <Divider variant="gradient" />
            <Divider variant="default" label="OR" />
            <Divider variant="action" label="SUCCESS" labelPosition="left" />
            <div className="flex items-center justify-center h-20 space-x-4 border border-white/10 rounded-xl p-4">
              <span>Item 1</span>
              <Divider vertical variant="default" />
              <span>Item 2</span>
              <Divider vertical variant="gradient" />
              <span>Item 3</span>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 9. ICON */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={9} title="Icon" />
          <SpecBox>
            <strong>Sizes:</strong> xs (12px), sm (16px), md (20px), lg (24px), xl (32px), 2xl (40px) |{' '}
            <strong>Source:</strong> getIcon() from @thaiakha/shared/lib/icons (Material Symbols)
          </SpecBox>

          <Typography variant="h5" className="mb-4 text-action">Sizes — star</Typography>
          <div className="flex flex-wrap gap-8 items-end mb-8">
            {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map(s => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Icon name="star" size={s} />
                <span className="text-[10px] opacity-50 font-mono">{s}</span>
              </div>
            ))}
          </div>

          <Typography variant="h5" className="mb-4 text-action">Common Icons (size lg)</Typography>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-4">
            {ICONS_DEMO.map(name => (
              <div key={name} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <Icon name={name} size="lg" />
                <span className="text-[9px] opacity-40 font-mono text-center leading-tight">{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 10. INFO CARD (Dati Reali) */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <Typography variant="h3" className="border-b pb-2 border-slate-200 dark:border-white/10 flex items-center gap-3">
            10. InfoCard (Dati Reali da Database)
            {loading && <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          </Typography>

          {!loading && cards.length > 0 ? (
            <div className="space-y-12">
              <div>
                <Typography variant="h5" className="mb-4 text-action">Layout: Vertical (3 cols)</Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cards.slice(0, 3).map(card => (
                    <InfoCard
                      key={`v-${card.id}`}
                      card={{ id: card.id, title: card.title, desc: card.description, link: card.target_path || '#', image: card.image_url, icon: card.icon_name }}
                      layout="vertical"
                      onNavigate={() => {}}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Typography variant="h5" className="mb-4 text-action">Layout: Horizontal (2x2)</Typography>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {cards.slice(0, 4).map(card => (
                    <InfoCard
                      key={`h-${card.id}`}
                      card={{ id: card.id, title: card.title, desc: card.description, link: card.target_path || '#', image: card.image_url, icon: card.icon_name }}
                      layout="horizontal"
                      onNavigate={() => {}}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            !loading && <Typography variant="body" className="opacity-50 italic">Nessuna card trovata nel database.</Typography>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 11. INPUT */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={11} title="Input" />
          <SpecBox>
            <strong>Variants:</strong> default, mineral, filled, outline, ghost |{' '}
            <strong>Sizes:</strong> sm, md (default), lg |{' '}
            <strong>States:</strong> success, error, disabled | icons: left/right
          </SpecBox>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Input variant="default" placeholder="Default variant..." label="Default Input" />
              <Input variant="mineral" placeholder="Mineral variant..." label="Mineral Input" />
              <Input variant="filled" placeholder="Filled variant..." label="Filled Input" />
              <Input variant="outline" placeholder="Outline variant..." label="Outline Input" />
              <Input variant="ghost" placeholder="Ghost variant..." label="Ghost Input" />
            </div>
            <div className="space-y-4">
              <Input size="sm" placeholder="Small input..." label="Small (sm)" />
              <Input size="lg" placeholder="Large input..." label="Large (lg)" />
              <Input leftIcon="search" placeholder="With left icon..." label="Search" />
              <Input rightIcon="visibility" placeholder="With right icon..." label="Password" type="password" />
              <Input success helperText="Looks good!" placeholder="Success state" label="Username" />
              <Input error helperText="Invalid email address" placeholder="Error state" label="Email" />
              <Input disabled placeholder="Disabled input" label="Disabled" />
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 12. PAGINATION & PROGRESS BAR */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={12} title="Pagination & ProgressBar" />
          <SpecBox>
            <strong>Pagination:</strong> flex gap-2, w-12 h-12 buttons, rounded-2xl |{' '}
            <strong>ProgressBar:</strong> h-3 track, rounded-full, colors: primary/action/secondary/quiz
          </SpecBox>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Typography variant="h5" className="text-action">Pagination</Typography>
              <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
            </div>
            <div className="space-y-6">
              <Typography variant="h5" className="text-action">Progress Bars</Typography>
              <ProgressBar value={40} color="primary" showValue />
              <ProgressBar value={75} color="action" showValue />
              <ProgressBar value={20} color="secondary" />
              <ProgressBar value={90} color="quiz" />
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 13. SLIDER */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={13} title="Slider" />
          <SpecBox>
            <strong>Props:</strong> value, onChange, min, max, step, label, showValue |{' '}
            <strong>Thumb:</strong> 24px, bg-action, border-white |{' '}
            <strong>Track:</strong> h-2, bg-white/10, rounded-full
          </SpecBox>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Slider value={sliderValue} onChange={setSliderValue} label="Spice Level" showValue min={0} max={100} />
            <Slider value={30} onChange={() => {}} label="Fixed (30)" showValue min={0} max={100} />
            <Slider value={75} onChange={() => {}} min={0} max={200} step={25} label="Custom step (25)" showValue />
            <Slider value={sliderValue} onChange={setSliderValue} min={1} max={10} step={1} label="Guests (1–10)" showValue />
          </div>
          <p className="text-sm opacity-40 font-mono">Interactive value: {sliderValue}</p>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 14. STAT CARD */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={14} title="StatCard" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard icon="monitoring" title="Visite" value="1,200" color="primary" />
            <StatCard icon="restaurant" title="Piatti" value="45" color="secondary" />
            <StatCard icon="shopping_cart" title="Ordini" value="320" color="action" />
            <StatCard icon="star" title="Rating" value="4.9" color="warning" />
            <StatCard icon="check_circle" title="Attive" value="15" color="success" />
            <StatCard icon="psychology" title="Quiz" value="10" color="quiz" />
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 15. TABLE */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={15} title="Table" />
          <SpecBox>
            <strong>Props:</strong> data[], columns[], keyField, isLoading, onRowClick, hoverable |{' '}
            <strong>States:</strong> loading skeleton (5 rows), empty state, data table |{' '}
            <strong>Column:</strong> key, header, align (left/center/right), render()
          </SpecBox>
          <div className="space-y-8">
            <div>
              <Typography variant="h5" className="mb-4 text-action">Data Table (with custom render)</Typography>
              <Table
                data={TABLE_DATA}
                columns={TABLE_COLS}
                onRowClick={(row) => console.log('Row clicked:', row.name)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Typography variant="h5" className="mb-4 text-action">Loading State</Typography>
                <Table data={[]} columns={TABLE_COLS} isLoading />
              </div>
              <div>
                <Typography variant="h5" className="mb-4 text-action">Empty State</Typography>
                <Table data={[]} columns={TABLE_COLS} emptyMessage="No classes scheduled today." />
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 16. TABS */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={16} title="Tabs" />
          <SpecBox>
            <strong>Variants:</strong> mineral (sliding indicator), pills (gradient active) |{' '}
            <strong>Props:</strong> items[], value, onChange, actionButton |{' '}
            <strong>TabItem:</strong> value, label, icon?, badge?
          </SpecBox>
          <div className="space-y-12">
            <div>
              <Typography variant="h5" className="mb-4 text-action">Variant: Mineral (Admin style)</Typography>
              <Tabs items={TABS_OVERVIEW} value={tabValue} onChange={setTabValue} variant="mineral" />
              <p className="text-sm opacity-40 font-mono mt-4">Active: {tabValue}</p>
            </div>
            <div>
              <Typography variant="h5" className="mb-4 text-action">Variant: Pills (Front style)</Typography>
              <Tabs items={TABS_PILLS} value={pillsValue} onChange={setPillsValue} variant="pills" />
              <p className="text-sm opacity-40 font-mono mt-4">Active: {pillsValue}</p>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 17. TEXTAREA */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={17} title="Textarea" />
          <SpecBox>
            <strong>Variants:</strong> default, filled, outlined |{' '}
            <strong>Props:</strong> label, error, helperText, maxLength, showCount, charCount, resize, rows |{' '}
            <strong>States:</strong> default, error, disabled
          </SpecBox>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Textarea variant="default" label="Default" placeholder="Scrivi qui..." fullWidth rows={3} />
              <Textarea variant="filled" label="Filled" placeholder="Filled variant..." fullWidth rows={3} />
              <Textarea variant="outlined" label="Outlined" placeholder="Outlined variant..." fullWidth rows={3} />
            </div>
            <div className="space-y-6">
              <Textarea label="With char counter" placeholder="Max 120 characters..." maxLength={120} showCount charCount fullWidth rows={3} />
              <Textarea label="Error state" error="This field is required." placeholder="Error state..." fullWidth rows={3} />
              <Textarea label="Disabled" placeholder="Cannot edit this..." disabled fullWidth rows={3} />
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 18. TOGGLE & TOOLTIP */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={18} title="Toggle & Tooltip" />
          <SpecBox>
            <strong>Toggle:</strong> h-8 w-14 rounded-full, size-6 thumb |{' '}
            <strong>Tooltip:</strong> positions: top, right, bottom, left — portal z-[9999]
          </SpecBox>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Typography variant="h5" className="text-action">Toggle States</Typography>
              <Toggle checked={toggleState} onChange={setToggleState} label="Interactive Toggle" />
              <Toggle checked={true} onChange={() => {}} label="Checked (Controlled)" />
              <Toggle checked={false} onChange={() => {}} disabled label="Disabled Unchecked" />
              <Toggle checked={true} onChange={() => {}} disabled label="Disabled Checked" />
            </div>
            <div className="space-y-12">
              <Typography variant="h5" className="text-action">Tooltip Positions</Typography>
              <div className="flex flex-wrap gap-12 items-center justify-center pt-8">
                <Tooltip content="Tooltip Top" position="top">
                  <Badge variant="mineral">Hover (Top)</Badge>
                </Tooltip>
                <Tooltip content="Tooltip Right" position="right">
                  <Badge variant="mineral">Hover (Right)</Badge>
                </Tooltip>
                <Tooltip content="Tooltip Bottom" position="bottom">
                  <Badge variant="mineral">Hover (Bottom)</Badge>
                </Tooltip>
                <Tooltip content="Tooltip Left" position="left">
                  <Badge variant="mineral">Hover (Left)</Badge>
                </Tooltip>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── */}
        {/* 19. TYPOGRAPHY */}
        {/* ─────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <SectionHead n={19} title="Typography" />
          <SpecBox>
            <strong>Fonts:</strong> font-display (Playfair/display), font-sans (body), font-accent (uppercase labels) |{' '}
            <strong>Colors:</strong> title, default (desc), primary, secondary, action, quiz, muted
          </SpecBox>

          <div className="space-y-6 overflow-hidden">
            {TYPOGRAPHY_VARIANTS.map(v => (
              <div key={v} className="flex items-baseline gap-6 border-b border-white/5 pb-4">
                <span className="text-[10px] font-mono opacity-40 shrink-0 w-28">{v}</span>
                <Typography variant={v} className="truncate">
                  {v === 'quote'
                    ? 'Akha kitchen is the heart of our culture.'
                    : 'Thai Akha Kitchen'}
                </Typography>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Typography variant="h5" className="mb-4 text-action">Color Variants</Typography>
            <div className="flex flex-wrap gap-6 items-center">
              {(['default', 'title', 'muted', 'primary', 'secondary', 'action', 'quiz'] as const).map(c => (
                <div key={c} className="text-center">
                  <Typography variant="h5" color={c}>{c}</Typography>
                  <span className="text-[10px] font-mono opacity-40">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </PageLayout>
  );
};

export default StyleCards;
