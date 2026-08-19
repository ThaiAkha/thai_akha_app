import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../../ui/Typography';
import { CherryFormatter } from '../CherryFormatter';
import { CherryRichBlocks } from '../CherryRichBlocks';
import type { ChatMessage } from '@thaiakha/shared';
import type { ChatOption } from '@thaiakha/shared/data/chatFlowData';
import { getCherryCTA } from '@thaiakha/shared/data/chatFlowData';
import AkhaPixelPattern from '../../divider/AkhaPixelPattern';
import { parseLabel } from './parseLabel';

interface ChatBoxMessageListProps {
  messages: ChatMessage[];
  lastOptionsMsgId?: string;
  handleOptionClick: (opt: ChatOption) => void;
}

export const ChatBoxMessageList: React.FC<ChatBoxMessageListProps> = ({ messages, lastOptionsMsgId, handleOptionClick }) => (
  <>
  {messages.map((m, i) => (
    <div
      key={m.id || i}
      id={`chat-msg-${m.id}`}
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
          <CherryRichBlocks blocks={m.blocks} onLink={handleOptionClick} />
        </div>
      )}

      {/* ── Follow-up option buttons (CHAT_FLOW navigation) ── */}
      {m.role === 'model' && !m.isStreaming && m.options && m.options.length > 0 && m.id === lastOptionsMsgId && (
        <div className="w-full mt-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-1000 ease-out">
          {/* Divider Akha — piccolo e tenue (80% trasparente) — stesso stile FAQ */}
          <AkhaPixelPattern
            variant="line_simple_medium"
            size={5}
            theme="akha"
            opacity={0.2}
            className="my-2"
          />

          {/* Title — micro-CTA rotante: turchese-cherry scuro, meno bold (stesso stile FAQ) */}
          <Typography variant="paragraphS" className="mb-2.5 uppercase tracking-wide text-center font-semibold leading-snug [color:var(--text-cherry-ai-deep)]">
            {getCherryCTA(m.id, m.nodeLevel)}
          </Typography>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            {(m.options as ChatOption[]).map((opt) => {
              const { icon, text } = parseLabel(opt.label);
              return (
                <button
                  key={opt.nextId}
                  onClick={() => handleOptionClick(opt)}
                  className={cn(
                    'flex items-center justify-center text-center',
                    'py-2 px-4',
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
  </>
);

export default ChatBoxMessageList;
