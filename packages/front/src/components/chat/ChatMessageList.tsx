import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../ui/Typography';
import { CherryFormatter } from './CherryFormatter';
import { CherryRichBlocks } from './CherryRichBlocks';
import type { ChatMessage } from '@thaiakha/shared';
import type { ChatOption } from '@thaiakha/shared/data/chatFlowData';
import { getCherryCTA } from '@thaiakha/shared/data/chatFlowData';
import AkhaPixelPattern from '../divider/AkhaPixelPattern';

// Helper to parse leading emoji/icon from chat option label
const parseLabel = (label: string) => {
  const firstSpaceIndex = label.indexOf(' ');
  if (firstSpaceIndex > 0) {
    const icon = label.slice(0, firstSpaceIndex).trim();
    const text = label.slice(firstSpaceIndex + 1).trim();
    // Validate if the first token is a symbol, emoji, or non-alphanumeric character
    const isIcon = /[\p{Emoji}✀-➿-🀀-🟿‑-⛿\uD83C-\uDBFF]/u.test(icon) || icon.length <= 3;
    if (isIcon) {
      return { icon, text };
    }
  }
  return { icon: null, text: label };
};

export interface ChatMessageListProps {
  messages: ChatMessage[];
  onOptionClick: (opt: ChatOption) => void;
  /** Segna un link/gallery come visitato (memoria ragnatela). Opzionale. */
  onBlockVisit?: (id: string, meta?: Record<string, unknown>) => void;
  // React 19: useRef<T>(null) tipizza RefObject<T | null>, non RefObject<T>.
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isScrolledUp: boolean;
  scrollToBottom: () => void;
  // Voice (opzionale — l'inline text-only non li passa)
  isVoiceActive?: boolean;
  isConnecting?: boolean;
  inputTranscript?: string;
  outputTranscript?: string;
  /** Prefisso id messaggio — evita collisioni DOM tra superfici (laterale vs inline). */
  idPrefix?: string;
  /**
   * Scroll passivo (click-to-activate, usato dall'inline FAQ): quando true il
   * contenitore è `overflow-hidden` → la rotella passa alla pagina (no scroll-trap),
   * ma resta pinnabile via codice (auto-scroll). Quando false è scrollabile e
   * ai bordi incatena alla pagina (`overscroll-auto`, niente `contain`).
   */
  scrollLocked?: boolean;
  className?: string;
}

/**
 * ChatMessageList — area messaggi condivisa tra ChatBox (laterale) e
 * CherryInlineChat (FAQ). Render identico: bolle, streaming dots, formatter
 * ricco, griglia opzioni CHAT_FLOW, transcript voce, pulsante scroll-to-bottom
 * e spacer per l'allineamento morbido in alto.
 */
export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  onOptionClick,
  onBlockVisit,
  scrollContainerRef,
  messagesEndRef,
  isScrolledUp,
  scrollToBottom,
  isVoiceActive = false,
  isConnecting = false,
  inputTranscript,
  outputTranscript,
  idPrefix = 'chat-msg-',
  scrollLocked = false,
  className,
}) => {
  // #31 — Le pillole follow-up compaiono SOLO sotto l'ULTIMO messaggio di Cherry
  // (il punto di scelta attivo). I messaggi precedenti tengono testo/foto ma non
  // le pillole → niente accumulo di opzioni "morte" scrollando.
  const lastOptionsMsgId = [...messages]
    .reverse()
    .find(m => m.role === 'model' && !m.isStreaming && m.options && m.options.length > 0)?.id;
  return (
    <div
      ref={scrollContainerRef}
      role="log"
      aria-label="Messages"
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'flex-1 [padding-inline:var(--space-fluid-s)] [padding-top:var(--space-fluid-s)] [padding-bottom:calc(var(--space-fluid-s)/2)] flex flex-col [gap:var(--space-fluid-m)] custom-scrollbar',
        scrollLocked ? 'overflow-hidden' : 'overflow-y-auto overscroll-auto',
        className
      )}
    >
      {messages.map((m, i) => (
        <div
          key={m.id || i}
          id={`${idPrefix}${m.id}`}
          className={cn(
            'flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500',
            m.role === 'user' ? 'items-end' : 'items-start'
          )}
        >
          <div
            className={cn(
              'max-w-[85%] [padding:var(--space-fluid-xs)] rounded-[1.5rem] shadow-sm transition-all',
              m.role === 'user'
                ? 'bg-transparent border-2 border-cherry-static/30 rounded-tr-none'
                : 'bg-cherry-static/[0.06] border-2 border-cherry-static/30 rounded-tl-none'
            )}
          >
            {m.isStreaming && !m.text ? (
              <div className="flex gap-1.5 py-1 px-1">
                <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            ) : m.role === 'model' ? (
              <CherryFormatter
                text={m.text}
                fullText={m.fullText}
                isStreaming={!!m.isStreaming}
              />
            ) : (
              <Typography variant="paragraphS" className="leading-snug text-title">
                {m.text}
              </Typography>
            )}
          </div>

          {/* ── Blocchi ricchi (linkCard / gallery) — dopo la trascrizione, PRIMA delle uscite ── */}
          {m.role === 'model' && !m.isStreaming && m.blocks && m.blocks.length > 0 && (
            <div className="w-full max-w-[75%] mt-3">
              <CherryRichBlocks
                blocks={m.blocks}
                onLink={onOptionClick}
                onVisit={onBlockVisit}
              />
            </div>
          )}

          {/* ── Follow-up option buttons (CHAT_FLOW) — entrata morbida: fade + leggera risalita ── */}
          {m.role === 'model' && !m.isStreaming && m.options && m.options.length > 0 && m.id === lastOptionsMsgId && (
            <div className="w-full mt-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-1000 ease-out">
              {/* Divider Akha — piccolo e tenue (80% trasparente) */}
              <div className="my-2">
                <AkhaPixelPattern variant="line_simple_medium" size={5} theme="akha" opacity={0.2} />
              </div>

              {/* Title — turchese-cherry scuro, meno bold */}
              <Typography
                variant="paragraphS"
                className="mb-2.5 uppercase tracking-wide text-center font-semibold leading-snug [color:var(--text-cherry-ai-deep)]"
              >
                {getCherryCTA(m.id, m.nodeLevel)}
              </Typography>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                {(m.options as ChatOption[]).map((opt) => {
                  const { icon, text } = parseLabel(opt.label);
                  return (
                    <button
                      key={opt.nextId}
                      onClick={() => onOptionClick(opt)}
                      className={cn(
                        'flex items-center justify-center text-center',
                        'py-2 px-4',
                        // Regola bordi Cherry: statico = turchese, hover/attivo = cherry
                        'rounded-full border-2 border-cherry-static/60',
                        'bg-cherry-static/15 hover:bg-cherry-ai/15 hover:border-cherry-ai/70 active:scale-[0.98]',
                        'transition-all duration-300 w-full cursor-pointer'
                      )}
                    >
                      <Typography variant="paragraphS" className="[color:var(--text-cherry-ai-deep)] font-semibold text-center leading-tight flex items-center justify-center gap-2">
                        {icon && <span className="shrink-0 text-base">{icon}</span>}
                        <span>{text}</span>
                      </Typography>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      ))}

      {/* Live Transcription (voice only) */}
      {isVoiceActive && (inputTranscript || outputTranscript) && (
        <div className="mt-auto space-y-4 animate-in fade-in duration-500 pb-4">
          {inputTranscript && (
            <div className="flex justify-end opacity-60">
              <div className="bg-surface-2 p-3 rounded-2xl border border-border">
                <Typography variant="caption" color="muted">
                  "{inputTranscript}..."
                </Typography>
              </div>
            </div>
          )}
          {outputTranscript && (
            <div className="flex justify-start">
              <div className="bg-cherry-ai-teal/15 p-4 rounded-2xl border border-cherry-ai-teal/30">
                <Typography variant="body" className="font-medium text-white">
                  Cherry: {outputTranscript}<span className="animate-pulse ml-0.5 opacity-70">▌</span>
                </Typography>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connecting dots (voice only — text chat dots live inside the bubble) */}
      {isConnecting && (
        <div className="flex gap-1.5 py-2 px-4 rounded-full bg-white/5 w-fit">
          <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:0ms]" />
          <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:150ms]" />
          <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      )}

      {/* Scroll-to-bottom button */}
      {isScrolledUp && (
        <div className="sticky bottom-2 flex justify-center pointer-events-none">
          <button
            onClick={scrollToBottom}
            className="pointer-events-auto flex items-center [gap:var(--space-fluid-2xs)] bg-surface border border-border text-title shadow-theme-md rounded-full px-4 py-2 hover:bg-surface-2 transition-all animate-in fade-in slide-in-from-bottom-2"
          >
            <span className="material-symbols-outlined text-sm text-cherry-ai-teal">expand_more</span>
            <Typography variant="microLabel" color="sub">Go to bottom</Typography>
          </button>
        </div>
      )}

      {/* Spacer bottom SOLO durante input/streaming (come la main): a fine risposta
          sparisce → le pillole restano al fondo, niente void → niente pulsante
          "go to bottom" spurio. */}
      {(messages.some(m => m.isStreaming) || messages[messages.length - 1]?.role === 'user') && (
        <div className="[height:min(50vh,280px)] shrink-0" />
      )}

      <div ref={messagesEndRef} className="h-2" />
    </div>
  );
};

export default ChatMessageList;
