/**
 * ColorsPage — Thai Akha Kitchen Design System
 * Source of truth: base-theme.css + theme.css + tokens.css
 * Light & Dark mode native via semantic Tailwind tokens.
 */
import React, { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { cn } from '@thaiakha/shared/lib/utils';

// ─── UTILS ───────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

function isLight(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255 > 0.55;
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface ColorEntry { label: string; hex: string; tw: string; anchor?: boolean; note?: string; }
interface ColorGroup { id: string; name: string; sub: string; anchor?: string; colors: ColorEntry[]; }

// ─── COLOR DATA — matches base-theme.css exactly ──────────────────────────────

const COLOR_GROUPS: ColorGroup[] = [
  {
    id: 'primary', name: 'Primary · Cherry Red',
    sub: 'bg-primary-25 … bg-primary-dark  ·  flat alias → primary-500 = #E31F33',
    anchor: '#E31F33',
    colors: [
      { label: 'primary-25',   hex: '#fef1f2', tw: 'bg-primary-25'   },
      { label: 'primary-50',   hex: '#fddfe2', tw: 'bg-primary-50'   },
      { label: 'primary-100',  hex: '#fbc0c5', tw: 'bg-primary-100'  },
      { label: 'primary-200',  hex: '#f8a1a9', tw: 'bg-primary-200'  },
      { label: 'primary-300',  hex: '#f2828d', tw: 'bg-primary-300'  },
      { label: 'primary-400',  hex: '#e3515f', tw: 'bg-primary-400'  },
      { label: 'primary-500',  hex: '#E31F33', tw: 'bg-primary-500',  anchor: true },
      { label: 'primary-600',  hex: '#c11c2e', tw: 'bg-primary-600'  },
      { label: 'primary-700',  hex: '#9e1725', tw: 'bg-primary-700'  },
      { label: 'primary-800',  hex: '#7c121d', tw: 'bg-primary-800'  },
      { label: 'primary-900',  hex: '#590d15', tw: 'bg-primary-900'  },
      { label: 'primary-950',  hex: '#37080d', tw: 'bg-primary-950'  },
      { label: 'primary-dark', hex: '#150305', tw: 'bg-primary-dark' },
    ],
  },
  {
    id: 'action', name: 'Action · Lime Green',
    sub: 'bg-action-25 … bg-action-dark  ·  flat alias → action-500 = #98C93C',
    anchor: '#98C93C',
    colors: [
      { label: 'action-25',   hex: '#f5fce8', tw: 'bg-action-25'   },
      { label: 'action-50',   hex: '#eaf7d0', tw: 'bg-action-50'   },
      { label: 'action-100',  hex: '#d4ee90', tw: 'bg-action-100'  },
      { label: 'action-200',  hex: '#c0e468', tw: 'bg-action-200'  },
      { label: 'action-300',  hex: '#aedd4e', tw: 'bg-action-300'  },
      { label: 'action-400',  hex: '#a2d244', tw: 'bg-action-400'  },
      { label: 'action-500',  hex: '#98C93C', tw: 'bg-action-500',  anchor: true },
      { label: 'action-600',  hex: '#7dab2e', tw: 'bg-action-600'  },
      { label: 'action-700',  hex: '#628d22', tw: 'bg-action-700'  },
      { label: 'action-800',  hex: '#476f18', tw: 'bg-action-800'  },
      { label: 'action-900',  hex: '#30500f', tw: 'bg-action-900'  },
      { label: 'action-950',  hex: '#1e3308', tw: 'bg-action-950'  },
      { label: 'action-dark', hex: '#0e1a03', tw: 'bg-action-dark' },
    ],
  },
  {
    id: 'secondary', name: 'Secondary · Dark Cherry',
    sub: 'bg-secondary-25 … bg-secondary-dark  ·  flat alias → secondary-600 = #8D1A31',
    anchor: '#8D1A31',
    colors: [
      { label: 'secondary-25',   hex: '#FFF0F3', tw: 'bg-secondary-25'   },
      { label: 'secondary-50',   hex: '#FDE8EC', tw: 'bg-secondary-50'   },
      { label: 'secondary-100',  hex: '#F9D6DC', tw: 'bg-secondary-100'  },
      { label: 'secondary-200',  hex: '#F0A8B5', tw: 'bg-secondary-200'  },
      { label: 'secondary-300',  hex: '#E37A8E', tw: 'bg-secondary-300'  },
      { label: 'secondary-400',  hex: '#CC4D67', tw: 'bg-secondary-400'  },
      { label: 'secondary-500',  hex: '#AD2645', tw: 'bg-secondary-500'  },
      { label: 'secondary-600',  hex: '#8D1A31', tw: 'bg-secondary-600', anchor: true },
      { label: 'secondary-700',  hex: '#6E1026', tw: 'bg-secondary-700'  },
      { label: 'secondary-800',  hex: '#50091C', tw: 'bg-secondary-800'  },
      { label: 'secondary-900',  hex: '#320412', tw: 'bg-secondary-900'  },
      { label: 'secondary-950',  hex: '#1A0109', tw: 'bg-secondary-950'  },
      { label: 'secondary-dark', hex: '#0D0007', tw: 'bg-secondary-dark' },
    ],
  },
  {
    id: 'allergy', name: 'Allergy · Orange',
    sub: 'bg-allergy-25 … bg-allergy-dark  ·  flat alias → allergy-500 = #FF6D00',
    anchor: '#FF6D00',
    colors: [
      { label: 'allergy-25',   hex: '#fff7ed', tw: 'bg-allergy-25'   },
      { label: 'allergy-50',   hex: '#ffedd5', tw: 'bg-allergy-50'   },
      { label: 'allergy-100',  hex: '#fed7aa', tw: 'bg-allergy-100'  },
      { label: 'allergy-200',  hex: '#fdba74', tw: 'bg-allergy-200'  },
      { label: 'allergy-300',  hex: '#fb923c', tw: 'bg-allergy-300'  },
      { label: 'allergy-400',  hex: '#f97316', tw: 'bg-allergy-400'  },
      { label: 'allergy-500',  hex: '#FF6D00', tw: 'bg-allergy-500', anchor: true },
      { label: 'allergy-600',  hex: '#ea580c', tw: 'bg-allergy-600'  },
      { label: 'allergy-700',  hex: '#c2410c', tw: 'bg-allergy-700'  },
      { label: 'allergy-800',  hex: '#9a3412', tw: 'bg-allergy-800'  },
      { label: 'allergy-900',  hex: '#7c2d12', tw: 'bg-allergy-900'  },
      { label: 'allergy-950',  hex: '#4a1e0b', tw: 'bg-allergy-950'  },
      { label: 'allergy-dark', hex: '#2b1106', tw: 'bg-allergy-dark' },
    ],
  },
  {
    id: 'quiz-p', name: 'Quiz-P · Deep Magenta',
    sub: 'bg-quiz-p-25 … bg-quiz-p-dark  ·  flat alias → quiz-p-500 = #9A0050',
    anchor: '#9A0050',
    colors: [
      { label: 'quiz-p-25',   hex: '#fff0f7', tw: 'bg-quiz-p-25'   },
      { label: 'quiz-p-50',   hex: '#ffe0ee', tw: 'bg-quiz-p-50'   },
      { label: 'quiz-p-100',  hex: '#ffb8d9', tw: 'bg-quiz-p-100'  },
      { label: 'quiz-p-200',  hex: '#ff80bc', tw: 'bg-quiz-p-200'  },
      { label: 'quiz-p-300',  hex: '#f0449c', tw: 'bg-quiz-p-300'  },
      { label: 'quiz-p-400',  hex: '#c8207a', tw: 'bg-quiz-p-400'  },
      { label: 'quiz-p-500',  hex: '#9A0050', tw: 'bg-quiz-p-500', anchor: true },
      { label: 'quiz-p-600',  hex: '#820044', tw: 'bg-quiz-p-600'  },
      { label: 'quiz-p-700',  hex: '#680038', tw: 'bg-quiz-p-700'  },
      { label: 'quiz-p-800',  hex: '#50002c', tw: 'bg-quiz-p-800'  },
      { label: 'quiz-p-900',  hex: '#380020', tw: 'bg-quiz-p-900'  },
      { label: 'quiz-p-950',  hex: '#280018', tw: 'bg-quiz-p-950'  },
      { label: 'quiz-p-dark', hex: '#1a0010', tw: 'bg-quiz-p-dark' },
    ],
  },
  {
    id: 'quiz-s', name: 'Quiz-S · Deep Purple',
    sub: 'bg-quiz-s-25 … bg-quiz-s-dark  ·  flat alias → quiz-s-500 = #3B227A',
    anchor: '#3B227A',
    colors: [
      { label: 'quiz-s-25',   hex: '#f4f0ff', tw: 'bg-quiz-s-25'   },
      { label: 'quiz-s-50',   hex: '#eae0ff', tw: 'bg-quiz-s-50'   },
      { label: 'quiz-s-100',  hex: '#d4bfff', tw: 'bg-quiz-s-100'  },
      { label: 'quiz-s-200',  hex: '#b898ff', tw: 'bg-quiz-s-200'  },
      { label: 'quiz-s-300',  hex: '#9470e8', tw: 'bg-quiz-s-300'  },
      { label: 'quiz-s-400',  hex: '#6844b0', tw: 'bg-quiz-s-400'  },
      { label: 'quiz-s-500',  hex: '#3B227A', tw: 'bg-quiz-s-500', anchor: true },
      { label: 'quiz-s-600',  hex: '#311a66', tw: 'bg-quiz-s-600'  },
      { label: 'quiz-s-700',  hex: '#261454', tw: 'bg-quiz-s-700'  },
      { label: 'quiz-s-800',  hex: '#1c0e40', tw: 'bg-quiz-s-800'  },
      { label: 'quiz-s-900',  hex: '#14082e', tw: 'bg-quiz-s-900'  },
      { label: 'quiz-s-950',  hex: '#0c0420', tw: 'bg-quiz-s-950'  },
      { label: 'quiz-s-dark', hex: '#060212', tw: 'bg-quiz-s-dark' },
    ],
  },
  {
    id: 'btn-p', name: 'Btn-P · Orange',
    sub: 'bg-btn-p-25 … bg-btn-p-dark  ·  flat alias → btn-p-500 = #FF6D00',
    anchor: '#FF6D00',
    colors: [
      { label: 'btn-p-25',   hex: '#fff6ee', tw: 'bg-btn-p-25'   },
      { label: 'btn-p-50',   hex: '#ffead4', tw: 'bg-btn-p-50'   },
      { label: 'btn-p-100',  hex: '#ffd5a8', tw: 'bg-btn-p-100'  },
      { label: 'btn-p-200',  hex: '#ffba6e', tw: 'bg-btn-p-200'  },
      { label: 'btn-p-300',  hex: '#ffa040', tw: 'bg-btn-p-300'  },
      { label: 'btn-p-400',  hex: '#ff8618', tw: 'bg-btn-p-400'  },
      { label: 'btn-p-500',  hex: '#FF6D00', tw: 'bg-btn-p-500', anchor: true },
      { label: 'btn-p-600',  hex: '#d95a00', tw: 'bg-btn-p-600'  },
      { label: 'btn-p-700',  hex: '#b34800', tw: 'bg-btn-p-700'  },
      { label: 'btn-p-800',  hex: '#8c3800', tw: 'bg-btn-p-800'  },
      { label: 'btn-p-900',  hex: '#662a00', tw: 'bg-btn-p-900'  },
      { label: 'btn-p-950',  hex: '#401900', tw: 'bg-btn-p-950'  },
      { label: 'btn-p-dark', hex: '#200d00', tw: 'bg-btn-p-dark' },
    ],
  },
  {
    id: 'btn-s', name: 'Btn-S · Blue Light',
    sub: 'bg-btn-s-25 … bg-btn-s-dark  ·  flat alias → btn-s-500 = #1CA3E6',
    anchor: '#1CA3E6',
    colors: [
      { label: 'btn-s-25',   hex: '#f5fbff', tw: 'bg-btn-s-25'   },
      { label: 'btn-s-50',   hex: '#f0f9ff', tw: 'bg-btn-s-50'   },
      { label: 'btn-s-100',  hex: '#e0f2fe', tw: 'bg-btn-s-100'  },
      { label: 'btn-s-200',  hex: '#b9e6fe', tw: 'bg-btn-s-200'  },
      { label: 'btn-s-300',  hex: '#7cd4fd', tw: 'bg-btn-s-300'  },
      { label: 'btn-s-400',  hex: '#36bffa', tw: 'bg-btn-s-400'  },
      { label: 'btn-s-500',  hex: '#1ca3e6', tw: 'bg-btn-s-500', anchor: true },
      { label: 'btn-s-600',  hex: '#0086c9', tw: 'bg-btn-s-600'  },
      { label: 'btn-s-700',  hex: '#026aa2', tw: 'bg-btn-s-700'  },
      { label: 'btn-s-800',  hex: '#065986', tw: 'bg-btn-s-800'  },
      { label: 'btn-s-900',  hex: '#0b4a6f', tw: 'bg-btn-s-900'  },
      { label: 'btn-s-950',  hex: '#062c41', tw: 'bg-btn-s-950'  },
      { label: 'btn-s-dark', hex: '#021520', tw: 'bg-btn-s-dark' },
    ],
  },
  {
    id: 'gray', name: 'Gray · Warm Neutral',
    sub: 'bg-gray-25 … bg-gray-dark  ·  anchor ★ 500 = #868C8C',
    anchor: '#868C8C',
    colors: [
      { label: 'gray-25',   hex: '#F6FCFC', tw: 'bg-gray-25'   },
      { label: 'gray-50',   hex: '#E6ECEC', tw: 'bg-gray-50'   },
      { label: 'gray-100',  hex: '#D6DCDC', tw: 'bg-gray-100'  },
      { label: 'gray-200',  hex: '#C2C8C8', tw: 'bg-gray-200'  },
      { label: 'gray-300',  hex: '#AEB4B4', tw: 'bg-gray-300'  },
      { label: 'gray-400',  hex: '#9AA0A0', tw: 'bg-gray-400'  },
      { label: 'gray-500',  hex: '#868C8C', tw: 'bg-gray-500', anchor: true },
      { label: 'gray-600',  hex: '#727878', tw: 'bg-gray-600'  },
      { label: 'gray-700',  hex: '#5E6464', tw: 'bg-gray-700'  },
      { label: 'gray-800',  hex: '#4A504F', tw: 'bg-gray-800'  },
      { label: 'gray-900',  hex: '#222827', tw: 'bg-gray-900',  note: 'dark sidebar' },
      { label: 'gray-950',  hex: '#121311', tw: 'bg-gray-950',  note: 'dark page bg' },
      { label: 'gray-dark', hex: '#080808', tw: 'bg-gray-dark', note: 'near black' },
    ],
  },
];

const SEMANTIC_TOKENS = [
  { label: 'primary',   hex: '#E31F33', note: 'Cherry red CTA' },
  { label: 'action',    hex: '#98C93C', note: 'Lime green CTA' },
  { label: 'secondary', hex: '#8D1A31', note: 'Dark cherry' },
  { label: 'allergy',   hex: '#FF6D00', note: 'Allergy orange' },
  { label: 'quiz-p',    hex: '#9A0050', note: 'Magenta quiz' },
  { label: 'quiz-s',    hex: '#3B227A', note: 'Purple quiz' },
  { label: 'btn-p',     hex: '#FF6D00', note: 'Orange button' },
  { label: 'btn-s',     hex: '#1CA3E6', note: 'Blue button' },
  { label: 'quiz',      hex: '#9A0050', note: 'Front alias quiz-p' },
];

const SYSTEM_TOKENS = [
  { label: 'sys-success', hex: '#22C55E', ch: '34 197 94' },
  { label: 'sys-error',   hex: '#EF4444', ch: '239 68 68' },
  { label: 'sys-warning', hex: '#F59E0B', ch: '245 158 11' },
  { label: 'sys-info',    hex: '#3B82F6', ch: '59 130 246' },
  { label: 'sys-notice',  hex: '#EAB308', ch: '234 179 8' },
];

const OPACITY_STEPS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];

// ─── SWATCH COMPONENT ─────────────────────────────────────────────────────────

interface SwatchProps {
  hex: string; label: string; tw: string; note?: string;
  anchor?: boolean; compact?: boolean; copied?: boolean; onClick?: () => void;
}

const Swatch: React.FC<SwatchProps> = ({ hex, label, tw, note, anchor, compact, copied, onClick }) => {
  const light = isLight(hex);
  return (
    <div onClick={onClick} className="group flex flex-col cursor-pointer select-none" title={`Copy: ${hex}`}>
      <div
        className={cn(
          'relative overflow-hidden transition-transform duration-200 group-hover:scale-[1.04]',
          compact ? 'h-10 rounded-lg' : 'h-20 rounded-xl',
          anchor ? 'ring-2 ring-offset-2 ring-white/50 dark:ring-white/30' : ''
        )}
        style={{ backgroundColor: hex }}
      >
        {anchor && (
          <div className={cn('absolute top-2 left-1/2 -translate-x-1/2 text-sm pointer-events-none font-black', light ? 'text-black/40' : 'text-white/50')}>★</div>
        )}
        {copied && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
            <span className="text-white text-xs font-black tracking-wide">✓ COPIED</span>
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <div className={cn('absolute bottom-1.5 right-1.5 size-2 rounded-full opacity-50', light ? 'bg-black/50' : 'bg-white/50')} />
      </div>
      <div className="mt-2 space-y-0.5 min-w-0">
        <p className="font-mono font-bold text-xs text-title leading-tight truncate">{label}</p>
        <p className="font-mono text-xs text-desc opacity-60 leading-tight truncate">{hex}</p>
        {note && !compact && <p className="text-xs text-desc opacity-40 leading-tight italic truncate">{note}</p>}
        {!compact && <p className="font-mono text-[10px] text-desc opacity-25 leading-tight truncate">{tw}</p>}
      </div>
    </div>
  );
};

// ─── DARK MODE TOGGLE ─────────────────────────────────────────────────────────

const DarkToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggle = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    setIsDark(html.classList.contains('dark'));
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300',
        isDark
          ? 'bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700'
          : 'bg-white border-border text-title shadow-sm hover:bg-gray-50'
      )}
    >
      <span className="text-base">{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const ColorsPage: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 1100);
  };

  const scrollTo = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  const totalTokens = COLOR_GROUPS.reduce((a, g) => a + g.colors.length, 0) + SEMANTIC_TOKENS.length + SYSTEM_TOKENS.length;

  return (
    <PageLayout slug="colors" hideDefaultHeader customMetadata={{ titleMain: 'Color', titleHighlight: 'System', description: '', icon: 'palette', imageUrl: '', badge: '' }}>
      <div className="max-w-7xl mx-auto space-y-16 pb-20">

        {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 pt-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-border px-4 py-1.5 rounded-full">
                <span className="material-symbols-rounded text-base text-primary">palette</span>
                <span className="font-mono text-xs uppercase tracking-widest text-desc">Thai Akha Kitchen</span>
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-title">
                <span className="text-primary">Color</span> System
              </h1>
              <p className="text-base text-desc max-w-xl">
                {COLOR_GROUPS.length} palette · {totalTokens} token totali.
                Clicca su qualsiasi swatch per copiare l'HEX.
              </p>
            </div>
            <DarkToggle />
          </div>

          {/* Quick nav */}
          <div className="flex flex-wrap gap-2">
            {COLOR_GROUPS.map(g => (
              <button
                key={g.id}
                onClick={() => scrollTo(g.id)}
                style={activeSection === g.id && g.anchor ? { backgroundColor: g.anchor, color: isLight(g.anchor) ? '#000' : '#fff', borderColor: 'transparent' } : undefined}
                className="px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 border border-border bg-surface text-desc hover:border-gray-400 dark:hover:border-gray-500"
              >
                {g.id}
              </button>
            ))}
            {['semantic', 'system', 'opacity'].map(id => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-border bg-surface text-desc hover:border-gray-400 dark:hover:border-gray-500 transition-all"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* ── PALETTE SECTIONS ─────────────────────────────────────────────── */}
        {COLOR_GROUPS.map((group, gi) => (
          <section key={group.id} id={`section-${group.id}`} className="scroll-mt-6">
            {/* Section header */}
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3 mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-sm text-desc opacity-40 tabular-nums shrink-0">
                  {String(gi + 1).padStart(2, '0')}
                </span>
                {group.anchor && (
                  <div className="size-5 rounded-full shrink-0 ring-1 ring-black/10 dark:ring-white/10" style={{ backgroundColor: group.anchor }} />
                )}
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-title leading-tight truncate">{group.name}</h2>
                  <p className="font-mono text-xs text-desc opacity-50 mt-0.5 truncate">{group.sub}</p>
                </div>
              </div>
              <span className="font-mono text-xs text-desc opacity-30 shrink-0">{group.colors.length} steps</span>
            </div>

            {/* Desktop strip */}
            <div
              className="hidden sm:grid gap-2"
              style={{ gridTemplateColumns: `repeat(${group.colors.length}, minmax(0, 1fr))` }}
            >
              {group.colors.map(c => (
                <Swatch key={c.label} hex={c.hex} label={c.label} tw={c.tw} note={c.note} anchor={c.anchor} compact
                  copied={copiedHex === c.hex} onClick={() => copy(c.hex)} />
              ))}
            </div>

            {/* Mobile grid */}
            <div className="sm:hidden grid grid-cols-3 gap-3">
              {group.colors.map(c => (
                <Swatch key={c.label} hex={c.hex} label={c.label} tw={c.tw} note={c.note} anchor={c.anchor}
                  copied={copiedHex === c.hex} onClick={() => copy(c.hex)} />
              ))}
            </div>

            {/* Detail table */}
            <details className="mt-4 group/det">
              <summary className="cursor-pointer text-sm font-mono text-desc opacity-40 hover:opacity-70 transition-opacity flex items-center gap-2 list-none">
                <span className="material-symbols-rounded text-sm group-open/det:rotate-180 transition-transform">expand_more</span>
                Dettagli token
              </summary>
              <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 dark:bg-white/3">
                      <th className="text-left py-2.5 px-4 text-desc opacity-60 font-bold">Token</th>
                      <th className="text-left py-2.5 px-4 text-desc opacity-60 font-bold">HEX</th>
                      <th className="text-left py-2.5 px-4 text-desc opacity-60 font-bold">Tailwind class</th>
                      <th className="py-2.5 px-4 text-desc opacity-60 font-bold">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {group.colors.map(c => (
                      <tr key={c.label} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                        <td className={cn('py-2 px-4 font-bold', c.anchor ? 'text-primary' : 'text-title')}>
                          {c.label}{c.anchor ? ' ★' : ''}
                        </td>
                        <td className="py-2 px-4 text-desc opacity-70 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => copy(c.hex)}>{c.hex}</td>
                        <td className="py-2 px-4 text-action opacity-80">{c.tw}</td>
                        <td className="py-2 px-4">
                          <div className="h-6 w-12 rounded-md border border-black/10 dark:border-white/10" style={{ backgroundColor: c.hex }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
        ))}

        {/* ── SEMANTIC FLAT TOKENS ─────────────────────────────────────────── */}
        <section id="section-semantic" className="scroll-mt-6">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-desc opacity-40 tabular-nums">{String(COLOR_GROUPS.length + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="text-lg font-bold text-title">Semantic Flat Tokens</h2>
                <p className="font-mono text-xs text-desc opacity-50 mt-0.5">bg-primary · text-action · border-secondary · (auto dark mode)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {SEMANTIC_TOKENS.map(t => (
              <div key={t.label} onClick={() => copy(t.hex)} className="group cursor-pointer select-none">
                <div className="relative h-20 rounded-xl overflow-hidden transition-transform duration-200 group-hover:scale-[1.04]" style={{ backgroundColor: t.hex }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/20 to-transparent" />
                  {copiedHex === t.hex && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                      <span className="text-white text-xs font-black">✓ COPIED</span>
                    </div>
                  )}
                  <div className={cn('absolute bottom-2 right-2 size-2 rounded-full opacity-50', isLight(t.hex) ? 'bg-black/50' : 'bg-white/50')} />
                </div>
                <div className="mt-2 space-y-0.5">
                  <p className="font-mono font-bold text-sm text-title leading-tight">{t.label}</p>
                  <p className="font-mono text-xs text-desc opacity-60">{t.hex}</p>
                  <p className="text-xs text-desc opacity-40 italic">{t.note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Semantic layout tokens (dynamic) */}
          <div className="mt-8">
            <h3 className="text-base font-bold text-title mb-4">Layout Semantic (adattivi light/dark)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'background', cls: 'bg-background', note: 'light: #FAFAFA · dark: #0A0A0A' },
                { label: 'surface', cls: 'bg-surface', note: 'light: #FFFFFF · dark: #121212' },
                { label: 'title text', cls: 'text-title', note: 'light: #1A1A1A · dark: #EDF2EF' },
                { label: 'desc text', cls: 'text-desc', note: 'light: #4A4A4A · dark: #D2DCD5' },
                { label: 'border', cls: 'border-border', note: 'light: #E2E8F0 · dark: #2D2D2D' },
                { label: 'allergy-secondary', cls: 'bg-allergy-secondary', note: 'light: #FEE2E2 · dark: allergy-dark' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 bg-surface border border-border rounded-xl p-4">
                  <div className={cn('size-10 rounded-lg border border-black/10 dark:border-white/10 shrink-0', item.cls)} />
                  <div>
                    <p className="text-sm font-bold text-title font-mono">{item.cls}</p>
                    <p className="text-xs text-desc opacity-50 mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SYSTEM UI ────────────────────────────────────────────────────── */}
        <section id="section-system" className="scroll-mt-6">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-desc opacity-40 tabular-nums">{String(COLOR_GROUPS.length + 2).padStart(2, '0')}</span>
              <div>
                <h2 className="text-lg font-bold text-title">System UI</h2>
                <p className="font-mono text-xs text-desc opacity-50 mt-0.5">--sys-*-ch channels · rgb(var(--sys-success-ch) / 0.2)</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {SYSTEM_TOKENS.map(t => (
              <div key={t.label} onClick={() => copy(t.hex)} className="group cursor-pointer select-none">
                <div className="relative h-20 rounded-xl overflow-hidden transition-transform duration-200 group-hover:scale-[1.04]" style={{ backgroundColor: t.hex }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/20 to-transparent" />
                  {copiedHex === t.hex && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                      <span className="text-white text-xs font-black">✓ COPIED</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 space-y-0.5">
                  <p className="font-mono font-bold text-sm text-title">{t.label}</p>
                  <p className="font-mono text-xs text-desc opacity-60">{t.hex}</p>
                  <p className="font-mono text-xs text-desc opacity-30">--{t.label.replace('-', '-')}-ch: {t.ch}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── OPACITY DEMO ─────────────────────────────────────────────────── */}
        <section id="section-opacity" className="scroll-mt-6">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-desc opacity-40 tabular-nums">{String(COLOR_GROUPS.length + 3).padStart(2, '0')}</span>
              <div>
                <h2 className="text-lg font-bold text-title">Opacity Variants</h2>
                <p className="font-mono text-xs text-desc opacity-50 mt-0.5">
                  bg-primary/30 · text-action-700/50 · via rgb(var(--xxx-ch) / alpha)
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-gray-50 dark:bg-white/3">
                  <th className="text-left pr-4 py-3 pl-4 font-mono text-sm text-desc opacity-60 font-bold w-36">Color</th>
                  {OPACITY_STEPS.map(op => (
                    <th key={op} className="px-2 py-3 font-mono text-xs text-desc opacity-50 font-bold text-center">/{op}</th>
                  ))}
                  <th className="px-2 py-3 font-mono text-xs text-desc opacity-50 font-bold text-center">solid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { label: 'primary',   hex: '#E31F33' },
                  { label: 'action',    hex: '#98C93C' },
                  { label: 'secondary', hex: '#8D1A31' },
                  { label: 'allergy',   hex: '#FF6D00' },
                  { label: 'quiz-p',    hex: '#9A0050' },
                  { label: 'quiz-s',    hex: '#3B227A' },
                  { label: 'btn-p',     hex: '#FF6D00' },
                  { label: 'btn-s',     hex: '#1CA3E6' },
                ].map(c => {
                  const rgb = hexToRgb(c.hex);
                  return (
                    <tr key={c.label} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                      <td className="pr-4 py-3 pl-4">
                        <div className="flex items-center gap-2">
                          <div className="size-4 rounded shrink-0 ring-1 ring-black/10 dark:ring-white/15" style={{ backgroundColor: c.hex }} />
                          <span className="font-mono text-sm font-bold text-title whitespace-nowrap">{c.label}</span>
                        </div>
                      </td>
                      {OPACITY_STEPS.map(op => (
                        <td key={op} className="px-2 py-3">
                          <div
                            className="h-9 w-12 rounded-lg border border-black/10 dark:border-white/10 cursor-pointer hover:scale-105 transition-transform"
                            style={{ backgroundColor: rgb ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op / 100})` : c.hex }}
                            onClick={() => copy(`bg-${c.label}/${op}`)}
                            title={`bg-${c.label}/${op}`}
                          />
                        </td>
                      ))}
                      <td className="px-2 py-3">
                        <div
                          className="h-9 w-12 rounded-lg cursor-pointer hover:scale-105 transition-transform ring-1 ring-black/10 dark:ring-white/10"
                          style={{ backgroundColor: c.hex }}
                          onClick={() => copy(`bg-${c.label}`)}
                          title={`bg-${c.label}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Code examples */}
          <div className="mt-6 bg-surface border border-border rounded-2xl p-6 space-y-3">
            <p className="font-mono text-xs text-desc opacity-50 uppercase tracking-widest mb-2">Esempi utilizzo</p>
            {[
              { code: 'bg-action/30',          desc: 'Background lime al 30% — badge glass' },
              { code: 'bg-primary/10',          desc: 'Background cherry al 10% — hover leggero' },
              { code: 'bg-allergy/20',          desc: 'Background orange allergy al 20%' },
              { code: 'text-primary-500',       desc: 'Cherry-500 diretto — icone, link' },
              { code: 'border-action-700/50',   desc: 'Bordo lime-700 al 50% — bordi sfumati' },
              { code: 'bg-quiz-p-500/20',       desc: 'Background magenta al 20% — overlay quiz' },
            ].map(ex => (
              <div key={ex.code} className="flex items-center gap-4">
                <code
                  className="font-mono text-sm bg-gray-100 dark:bg-black/20 px-3 py-1.5 rounded-lg text-action shrink-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-black/40 transition-colors whitespace-nowrap"
                  onClick={() => copy(ex.code)}
                >
                  {ex.code}
                </code>
                <span className="text-sm text-desc opacity-60">{ex.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <div className="text-center pb-4 space-y-2 border-t border-border pt-8">
          <p className="font-mono text-sm text-desc opacity-40">
            <span className="text-action">base-theme.css</span> · <span className="text-action">theme.css</span> · <span className="text-action">tokens.css</span>
          </p>
          <p className="font-mono text-xs text-desc opacity-25">
            Opacity via rgb(var(--xxx-ch) / alpha) · Chrome 111+ · Safari 16.4+ · Firefox 113+
          </p>
        </div>

      </div>
    </PageLayout>
  );
};

export default ColorsPage;
