import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface ChatBoxInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  input: string;
  setInput: (v: string) => void;
  processUserMessage: (text: string) => void;
  isLoading: boolean;
  isConnecting: boolean;
  isVoiceActive: boolean;
}

export const ChatBoxInput: React.FC<ChatBoxInputProps> = ({ inputRef, input, setInput, processUserMessage, isLoading, isConnecting, isVoiceActive }) => (
  <>
{/* ── Input Area ──────────────────────────────────────────────── */}
{/* 📱 Safe-area bottom: l'input non finisce sotto l'home-indicator (env=0 su desktop) */}
<div className="[padding:var(--space-fluid-s)] [padding-bottom:calc(var(--space-fluid-s)+env(safe-area-inset-bottom))] border-t border-border bg-surface-2">
  <div className="relative group">
    <input
      ref={inputRef}
      type="text"
      value={input}
      onChange={e => setInput(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && processUserMessage(input)}
      placeholder={
        isVoiceActive ? 'Cherry is listening...' : 'Ask Cherry anything kha...'
      }
      disabled={isLoading || isConnecting || isVoiceActive}
      aria-label="Message to Cherry"
      className={cn(
        'w-full bg-surface border border-cherry-static/40 rounded-2xl focus:border-cherry-static focus:outline-none py-4 pl-6 pr-14 transition-all text-title',
        'placeholder:text-muted/50 placeholder:italic',
        '[font-size:var(--text-fluid-body)]'
      )}
    />
    <button
      onClick={() => processUserMessage(input)}
      disabled={!input.trim() || isLoading || isConnecting || isVoiceActive}
      aria-label="Send message"
      className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl bg-cherry-ai text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all shadow-lg shadow-cherry-ai/20"
    >
      <span className="material-symbols-outlined text-lg">send</span>
    </button>
  </div>
</div>
  </>
);

export default ChatBoxInput;
