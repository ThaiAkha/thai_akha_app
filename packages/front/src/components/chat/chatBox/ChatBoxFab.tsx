import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../../i18n';
import { Typography } from '../../ui/Typography';
import { CHERRY_TITLE_STYLE, CHERRY_SUBTITLE_STYLE, CHERRY_AVATAR_SRC, CHERRY_SMALL_AVATAR_BG } from '../ChatIdentityHeader';

interface ChatBoxFabProps {
  isOpen: boolean;
  isVoiceActive: boolean;
  onOpen: () => void;
}

export const ChatBoxFab: React.FC<ChatBoxFabProps> = ({ isOpen, isVoiceActive, onOpen }) => (
  <>
{/* ── FAB ────────────────────────────────────────────────────── */}
{!isOpen && (
  <button
    onClick={onOpen}
    aria-label="Open Cherry chat"
    aria-expanded={false}
    aria-haspopup="dialog"
    className={cn(
      'pointer-events-auto transition-all duration-300 transform hover:scale-105 active:scale-95 relative overflow-hidden',
      'flex items-center justify-center size-20 rounded-full text-white',
      // Pocket Voice Mode Styles
      isVoiceActive
        ? 'bg-cherry-ai-info shadow-glow-cherry-ai animate-pulse-subtle ring-4 ring-cherry-ai-teal/40 ring-offset-2'
        : 'bg-[image:var(--cherry-btn-grad)] shadow-glow-cherry-ai ring-4 ring-cherry-ai/40 ring-offset-2',
      // Desktop variants (sm+)
      'sm:flex-row sm:w-auto sm:h-16 sm:pr-6 sm:gap-3 sm:rounded-full sm:ring-4 sm:ring-offset-2'
    )}
  >
    <div className={cn('shrink-0 size-16 sm:size-16 flex items-center justify-center overflow-hidden rounded-full', CHERRY_SMALL_AVATAR_BG)}>
      <img
        src={CHERRY_AVATAR_SRC}
        alt="Cherry"
        className="size-full object-cover"
      />
    </div>

    {/* Testi coerenti con l'header: stesso titolo + sottotitolo, stesse costanti font */}
    <div className="hidden sm:flex flex-col items-start justify-center text-left gap-1">
      <Typography variant="accent" className="uppercase text-white leading-none" style={CHERRY_TITLE_STYLE}>
        {t('components:cherryChat.title')}
      </Typography>
      <Typography variant="body" as="span" className="text-white normal-case" style={CHERRY_SUBTITLE_STYLE}>
        {isVoiceActive ? 'Listening...' : t('components:cherryChat.statusIdle')}
      </Typography>
    </div>

    {isVoiceActive && (
      <div className="absolute inset-0 rounded-full border-4 border-white animate-ping pointer-events-none opacity-40" />
    )}
  </button>
)}
  </>
);

export default ChatBoxFab;
