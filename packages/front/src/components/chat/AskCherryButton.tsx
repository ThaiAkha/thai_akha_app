import React from 'react';
import { Typography, GlassCard, AkhaPixelPattern } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';
import { cherryPrompts } from '@thaiakha/shared/lib/cherry-prompts';
import { t } from '@thaiakha/shared/lib/ui-strings';
import type { ChatOption } from '@thaiakha/shared/data/chatFlowData';
import { CHERRY_TITLE_STYLE, CHERRY_SUBTITLE_STYLE, CHERRY_AVATAR_SRC, CHERRY_CARD_AVATAR_RING, CHERRY_SMALL_AVATAR_BG } from './ChatIdentityHeader';

export type CherryContextType = 'recipe-category' | 'recipe-dish' | 'class-philosophy' | 'history-general';

interface AskCherryButtonProps {
  variant?: 'prominent' | 'inline';
  /** Il tipo di contesto predefinito */
  context?: CherryContextType;
  /** I dati necessari per quel contesto (es. il nome della categoria o del piatto) */
  data?: any;
  /** Fallback o manual override se non vuoi usare un contesto predefinito */
  topic?: string;
  systemContext?: string;
  label?: string;
  /** Sottotitolo pill (variant='inline'). Default t.components.cherryChat.greeting. */
  subtitle?: string;
  className?: string;
  /** Solo per variant='inline': dimensione dell'avatar pill (default 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Bottoni follow-up da mostrare nella chat dopo la risposta preset */
  followupOptions?: ChatOption[];
  /** Tonalità: 'cherry' (Cherry AI world, default) | 'ocean' (mondo FAQ) */
  tone?: CherryTone;
}

const CHERRY_AVATAR = CHERRY_AVATAR_SRC; // avatar canonico unico (era Storyteller → ora AuthPage)

// ─── Size map — avatar = altezza pulsante, FLUSH-LEFT (pl-0/py-0) come il FAB.
// L'altezza del pulsante resta invariata (min-h), l'avatar la riempie a sinistra.
const SIZE_MAP = {
  sm: {
    button: 'min-h-[2.5rem] py-0 pl-0 pr-4 gap-2',
    avatar: 'size-10', // 40px = min-h 2.5rem
  },
  md: {
    button: 'min-h-[3.5rem] py-0 pl-0 pr-5 gap-2.5',
    avatar: 'size-14', // 56px = min-h 3.5rem
  },
  lg: {
    button: 'min-h-[4rem] py-0 pl-0 pr-6 gap-3',
    avatar: 'size-16', // 64px = min-h 4rem
  },
};

// ─── Tone map — cherry (turquoise→cherry gradient) | ocean (FAQ) ───────────────
type CherryTone = 'cherry' | 'ocean';
const TONE_MAP: Record<CherryTone, string> = {
  // TUTTI i pulsanti cherry: sfumatura turquoise↔cherry FISSA a 500 (--cherry-btn-grad).
  // Turquoise solo sull'angolo, cherry dominante → titolo leggibile.
  cherry: 'bg-[image:var(--cherry-btn-grad)] text-white ring-4 ring-cherry-ai/30 ring-offset-2 shadow-glow-cherry-ai',
  ocean:  'bg-ocean-blue text-white ring-4 ring-ocean-blue/40 ring-offset-2 shadow-[0_8px_30px_rgba(3,150,199,0.45)]',
};
// Colore del TITOLO per tono: cherry → cherry chiarissimo; ocean → bianco.
const TONE_TITLE: Record<CherryTone, string> = {
  cherry: '[color:var(--cherry-title)]',
  ocean:  'text-white',
};

// ─── Cherry Pill Button ───────────────────────────────────────────────────────
interface CherryPillProps {
  label: string;
  subtitle?: string;
  onClick: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Tonalità: 'cherry' (Cherry AI world, default) | 'ocean' (mondo FAQ) */
  tone?: CherryTone;
}

export const CherryPill: React.FC<CherryPillProps> = ({
  label,
  subtitle = t.components.cherryChat.greeting,
  onClick,
  size = 'md',
  className,
  tone = 'cherry',
}) => {
  const s = SIZE_MAP[size];
  return (
    <button
      onClick={onClick}
      aria-label={`Ask Cherry: ${label}`}
      className={cn(
        // Struttura FAB: min-height per supportare wrapping, pill orizzontale
        'inline-flex items-center rounded-full text-left',
        // Tonalità (bg + ring + glow)
        TONE_MAP[tone],
        // Hover scale transitions
        'hover:scale-105 active:scale-95 transition-all duration-300',
        s.button,
        className
      )}
    >
      {/*
        Avatar: dimensione calcolata per riempire l'altezza del pill
        lasciando ~4px di margine top/bottom (come il FAB).
        overflow-hidden rounded-full = cerchio perfetto.
      */}
      <span className={cn(
        'shrink-0 rounded-full overflow-hidden',
        CHERRY_SMALL_AVATAR_BG,
        s.avatar
      )}>
        <img
          src={CHERRY_AVATAR}
          alt="Cherry"
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </span>

      {/* Testo a due righe — con flex-col e wrapping per non far rompere la larghezza */}
      <span className="flex flex-col items-start justify-center text-left gap-0.5">
        <Typography
          as="span"
          variant="accent"
          className={cn(TONE_TITLE[tone], "uppercase whitespace-normal max-w-[200px] md:max-w-xs")}
          style={CHERRY_TITLE_STYLE}
        >
          {label}
        </Typography>
        {subtitle && (
          <Typography
            as="span"
            variant="body"
            className="text-white normal-case whitespace-normal"
            style={CHERRY_SUBTITLE_STYLE}
          >
            {subtitle}
          </Typography>
        )}
      </span>
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AskCherryButton: React.FC<AskCherryButtonProps> = ({
  variant = 'inline',
  context,
  data,
  topic: manualTopic,
  systemContext: manualSystemContext,
  label,
  subtitle,
  className,
  size = 'md',
  followupOptions,
  tone = 'cherry',
}) => {

  // 1. Estrazione dati dal DB (chiave unica: cherry_response)
  const dbPrompt = data?.cherry_prompt;
  const dbPreset = data?.cherry_response;

  // 2. Logica di generazione Prompt / Label
  let finalTopic = manualTopic || dbPrompt || '';
  let finalSystemContext = manualSystemContext || '';
  const finalLabel = label || dbPrompt || t.components.cherryChat.askCherry;
  const finalPreset = dbPreset || null;

  if (!manualTopic && !dbPrompt) {
    if (context === 'recipe-category' && data?.title) {
      finalTopic = cherryPrompts.recipes.category(data.title);
      finalSystemContext = `Focus on the cultural significance of "${data.title}" in Akha tradition. Keep it warm and under 60 words.`;
    } else if (context === 'recipe-dish' && data?.name) {
      finalTopic = cherryPrompts.recipes.dish(data.name, data.diet || 'regular', data.allergies || '');
      finalSystemContext = `Explain the ingredients of ${data.name} and how it fits the ${data.diet} diet.`;
    } else if (context === 'class-philosophy') {
      finalTopic = cherryPrompts.classes.philosophy;
      finalSystemContext = "Explain why Thai Akha Kitchen is a social enterprise and a family experience, not just a school.";
    } else if (context === 'history-general') {
      finalTopic = cherryPrompts.history.general;
      finalSystemContext = "Give a brief, captivating overview of Akha history.";
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!finalTopic) return;

    window.dispatchEvent(
      new CustomEvent('trigger-chat-topic', {
        detail: {
          topic: finalTopic,
          systemContext: finalSystemContext,
          presetResponse: finalPreset, // Zero-Latency UI
          followupOptions: followupOptions ?? undefined,
        }
      })
    );
  };

  // ── Variant: prominent (card Cherry RESPONSIVE — stesse sembianze della CherryIntroCard) ──
  // Container query (@container): stretta → VERTICALE (avatar sopra, centrato);
  // full-width (≥@2xl) → ORIZZONTALE (avatar a sinistra, testo al centro, pill a destra).
  // La DOMANDA della pagina resta sempre visibile.
  if (variant === 'prominent') {
    return (
      <GlassCard
        variant="cherry"
        padding="l"
        radius="2rem"
        className={cn('w-full @container', className)}
        innerClassName="relative isolate overflow-hidden flex flex-col items-center text-center [gap:var(--space-fluid-s)] @2xl:flex-row @2xl:items-center @2xl:text-left @2xl:[gap:var(--space-fluid-l)]"
      >
        {/* Sfondo foto (PLACEHOLDER) al 15% — dietro il contenuto (isolate + -z-10).
            Da sostituire con foto dedicata (o image_asset_id) in seguito. */}
        <img
          src={CHERRY_AVATAR}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute inset-0 -z-10 w-full h-full object-cover opacity-5"
        />

        {/* Avatar tondo grande — ring come i pulsanti (CHERRY_CARD_AVATAR_RING) */}
        <div className={cn('size-[8.64rem] shrink-0 rounded-full overflow-hidden shadow-theme-md', CHERRY_CARD_AVATAR_RING)}>
          <img src={CHERRY_AVATAR} alt="Cherry AI" loading="lazy" className="w-full h-full object-cover object-center" />
        </div>

        {/* Blocco testo: titolo gradiente + divider (solo verticale) + domanda */}
        <div className="min-w-0 flex-grow flex flex-col items-center @2xl:items-start [gap:var(--space-fluid-s)]">
          <Typography
            variant="h4"
            className="font-bold"
            style={{
              backgroundImage: 'linear-gradient(120deg, var(--cherry-grad-from), var(--cherry-grad-to))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {t.recipeSingle.curiousAboutDetails}
          </Typography>

          {/* Divider cherry — tra titolo e domanda, in entrambi i layout */}
          <div className="w-full flex justify-center @2xl:justify-start overflow-hidden">
            <AkhaPixelPattern variant="line_simple_medium" size={6} opacity={0.9} theme="cherry" animateInView />
          </div>

          {/* Domanda della pagina — sempre visibile */}
          <Typography variant="paragraphM" color="sub" className="italic leading-relaxed">
            {dbPrompt ? `“${dbPrompt}”` : t.components.cherryChat.promptFallback}
          </Typography>
        </div>

        {/* Pill Ask Cherry — full-width in verticale, auto a destra in orizzontale */}
        <div className="w-full @2xl:w-auto shrink-0">
          <CherryPill
            label={t.recipeSingle.askCherry}
            subtitle={t.recipeSingle.askCherrySubtitle}
            onClick={handleClick}
            size="md"
            tone={tone}
            className="w-full @2xl:w-auto justify-start"
          />
        </div>
      </GlassCard>
    );
  }

  // ── Variant: inline (default) — Cherry Pill ──────────────────────────────────
  return (
    <CherryPill
      label={finalLabel}
      subtitle={subtitle}
      onClick={handleClick}
      size={size}
      tone={tone}
      className={className}
    />
  );
};

export default AskCherryButton;
