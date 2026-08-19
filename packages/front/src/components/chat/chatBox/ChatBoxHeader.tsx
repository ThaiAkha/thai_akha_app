import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../../i18n';
import { Typography } from '../../ui/Typography';
import { CHERRY_TITLE_STYLE, CHERRY_SUBTITLE_STYLE, CHERRY_AVATAR_SRC, CHERRY_HEADER_PAD_Y, CHERRY_SMALL_AVATAR_BG } from '../ChatIdentityHeader';

interface ChatBoxHeaderProps {
  isVoiceActive: boolean;
  isConnecting: boolean;
  voiceError: string | null;
  chatError: string | null;
  onToggleVoice: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

// Header chat = stesso gradiente cherry del mondo Cherry (= header FAQ inline)
const headerColor = 'bg-[image:var(--cherry-btn-grad)]';

export const ChatBoxHeader: React.FC<ChatBoxHeaderProps> = ({
  isVoiceActive,
  isConnecting,
  voiceError,
  chatError,
  onToggleVoice,
  onMinimize,
  onClose,
}) => (
  <>
    {/* ── Header — si specchia con la header FAQ: stesso padding verticale
        (CHERRY_HEADER_PAD_Y) + safe-area solo in cima (mobile fullscreen). ── */}
    <div
      style={{
        paddingTop: `calc(${CHERRY_HEADER_PAD_Y} + env(safe-area-inset-top))`,
        paddingBottom: CHERRY_HEADER_PAD_Y,
      }}
      className={cn(
        'flex items-center justify-between [padding-inline:var(--space-fluid-s)] shrink-0 relative overflow-hidden transition-colors duration-500',
        isVoiceActive ? 'bg-cherry-ai-info' : headerColor
      )}
    >
      {/* Cluster identità — stesso schema della header FAQ (avatar tondo senza bordo
          + badge stato sull'avatar + testi allineati a sinistra, font condivisi) */}
      <div className="flex items-center [gap:var(--space-fluid-s)] relative z-10 text-white">
        <div className="relative shrink-0">
          <div className={cn('size-[54px] rounded-full overflow-hidden shadow-theme-md', CHERRY_SMALL_AVATAR_BG)}>
            <img
              src={CHERRY_AVATAR_SRC}
              alt="Cherry"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <span
            aria-hidden="true"
            className={cn(
              'absolute bottom-0 right-0 size-4 rounded-full ring-2 ring-white/80',
              (voiceError || chatError)
                ? 'bg-sys-error'
                : isConnecting
                  ? 'bg-sys-warning animate-pulse'
                  : isVoiceActive
                    ? 'bg-cherry-ai-teal animate-pulse'
                    : 'bg-sys-success'
            )}
          />
        </div>

        <div className="min-w-0 flex flex-col items-start justify-center gap-1">
          <Typography variant="accent" className="uppercase text-white leading-none" style={CHERRY_TITLE_STYLE}>
            {t('components:cherryChat.title')}
          </Typography>
          <Typography variant="body" as="p" className="text-white normal-case" style={CHERRY_SUBTITLE_STYLE}>
            {(voiceError || chatError)
              ? t('components:cherryChat.statusError')
              : isConnecting
                ? 'Connecting...'
                : isVoiceActive
                  ? 'Listening...'
                  : t('components:cherryChat.statusIdle')}
          </Typography>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* 1 — Voice toggle */}
        <button
          onClick={onToggleVoice}
          disabled={isConnecting}
          aria-label={isVoiceActive ? 'Stop voice' : 'Start voice'}
          title={isVoiceActive ? 'Stop voice' : 'Start voice'}
          className={cn(
            'size-12 rounded-full flex items-center justify-center transition-all duration-300',
            isVoiceActive
              ? 'bg-white text-cherry-ai-info shadow-glow-cherry-ai'
              : 'bg-white/15 text-white hover:bg-white/30'
          )}
        >
          <span className="material-symbols-outlined text-2xl">
            {isVoiceActive ? 'mic_off' : 'mic'}
          </span>
        </button>

        {/* 2 — Minimize box, keep voice */}
        <button
          onClick={onMinimize}
          aria-label="Minimize chat, keep voice active"
          title={isVoiceActive ? 'Minimize (voice stays on)' : 'Minimize chat'}
          className="size-12 rounded-full flex items-center justify-center bg-white/15 text-white hover:bg-white/30 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-2xl">keyboard_arrow_down</span>
        </button>

        {/* 3 — Close box + session */}
        <button
          onClick={onClose}
          aria-label="Close chat and end session"
          title="Close chat and end session"
          className="size-12 rounded-full flex items-center justify-center bg-white/15 text-white hover:bg-white/40 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
    </div>
  </>
);

export default ChatBoxHeader;
