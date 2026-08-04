import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../ui/Typography';

/**
 * ChatIdentityHeader — SCHEMA riusabile dell'identità Cherry in testa a una chat:
 * avatar TONDO + badge di stato (angolo) + titolo + status label, tutto allineato
 * a sinistra (le due righe di testo partono dallo stesso bordo → niente scalini).
 *
 * Il contenitore-barra (sfondo/gradiente) lo fornisce il chiamante via `className`;
 * qui vivono solo padding, layout e scala tipografica. Replicabile su ChatBox
 * laterale, header admin, ecc. cambiando solo `size` e `className`.
 *
 * Scala:
 *   md (default) → avatar 56px, titolo accent, status micro
 *   lg           → avatar 64px, titolo +1 step, status +1 step
 */
/**
 * STANDARD tipografico del blocco identità Cherry (header + pulsanti Ask Cherry):
 *  • Titolo → Roboto Condensed (--font-accent), 16/18
 *  • Sottotitolo → Montserrat 700 italic (--font-sans), 12/14
 * Fonte unica: importa queste costanti ovunque compaia avatar+titolo+sottotitolo.
 */
export const CHERRY_TITLE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-accent)', fontSize: '16px', lineHeight: '18px', letterSpacing: '0.04em',
};
export const CHERRY_SUBTITLE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontWeight: 700, fontStyle: 'italic', fontSize: '12px', lineHeight: '14px',
};

/** Avatar Cherry canonico — UNICA sorgente per header + pulsanti Ask Cherry. */
export const CHERRY_AVATAR_SRC = '/avatarCherry/600-Avatar-AuthPage.webp';

/** Padding verticale standard degli header chat (FAQ + laterale si specchiano). */
export const CHERRY_HEADER_PAD_Y = 'calc(var(--space-fluid-2xs) + 5px)';

/** Bordo avatar nelle CARD (stessa topologia dei pulsanti pill): ring cherry + offset. */
export const CHERRY_CARD_AVATAR_RING = 'ring-4 ring-cherry-ai/30 ring-offset-2';
/** Bg tenue dietro gli avatar PICCOLI (header/pulsanti): alone chiaro trasparente. */
export const CHERRY_SMALL_AVATAR_BG = 'bg-white/10';

export type ChatStatus = 'ready' | 'typing' | 'error';

const STATUS_DOT: Record<ChatStatus, string> = {
  ready: 'bg-sys-success',
  typing: 'bg-sys-warning animate-pulse',
  error: 'bg-sys-error',
};

const SIZE_MAP = {
  md: { avatar: 'size-14',     badge: 'size-3.5', gap: 'gap-1',   padY: 'var(--space-fluid-s)',   titleFs: undefined,                statusFs: undefined },
  // lg: avatar 54px (−10 dal 64), padding verticale ridotto (+5px richiesti) → header più compatta
  lg: { avatar: 'size-[54px]', badge: 'size-4',   gap: 'gap-1.5', padY: CHERRY_HEADER_PAD_Y, titleFs: 'var(--text-fluid-body)', statusFs: 'var(--text-fluid-caption)' },
} as const;

const DEFAULT_AVATAR = CHERRY_AVATAR_SRC;

export interface ChatIdentityHeaderProps {
  title: string;
  statusLabel: string;
  status?: ChatStatus;
  avatarSrc?: string;
  size?: keyof typeof SIZE_MAP;
  /** Classi del contenitore-barra (es. sfondo/gradiente). Padding e layout sono interni. */
  className?: string;
}

export const ChatIdentityHeader: React.FC<ChatIdentityHeaderProps> = ({
  title,
  statusLabel,
  status = 'ready',
  avatarSrc = DEFAULT_AVATAR,
  size = 'md',
  className,
}) => {
  const s = SIZE_MAP[size];
  return (
    <div
      style={{ paddingBlock: s.padY }}
      className={cn(
        'flex items-center [gap:var(--space-fluid-s)] [padding-inline:var(--space-fluid-s)] shrink-0 relative overflow-hidden',
        className
      )}
    >
      {/* Avatar tondo senza bordo + badge di stato (angolo basso-dx) */}
      <div className="relative shrink-0">
        <div className={cn(s.avatar, 'rounded-full overflow-hidden shadow-theme-md', CHERRY_SMALL_AVATAR_BG)}>
          <img src={avatarSrc} alt={title} className="w-full h-full object-cover object-center" />
        </div>
        <span
          aria-hidden="true"
          className={cn('absolute bottom-0 right-0 rounded-full ring-2 ring-white/80', s.badge, STATUS_DOT[status])}
        />
      </div>

      {/* Colonna testi — entrambe le righe allineate a sinistra (x=0) */}
      <div className={cn('min-w-0 flex flex-col items-start justify-center', s.gap)}>
        <Typography
          variant="accent"
          className="[color:var(--cherry-title)] uppercase leading-none"
          style={CHERRY_TITLE_STYLE}
        >
          {title}
        </Typography>
        <Typography
          variant="body"
          as="p"
          className="text-white normal-case"
          style={CHERRY_SUBTITLE_STYLE}
        >
          {statusLabel}
        </Typography>
      </div>
    </div>
  );
};

export default ChatIdentityHeader;
