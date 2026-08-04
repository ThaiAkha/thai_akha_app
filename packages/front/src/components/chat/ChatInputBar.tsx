import React, { useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

export interface ChatInputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
}

/**
 * ChatInputBar — barra di input condivisa (ChatBox laterale + CherryInlineChat).
 * Possiede il proprio stato testo e lo svuota subito all'invio; la logica di
 * invio (voce vs testo, autoscroll) vive nella superficie via `onSend`.
 */
export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Ask Cherry anything kha...',
  inputRef,
  className,
}) => {
  const [input, setInput] = useState('');

  const submit = () => {
    const text = input;
    if (!text.trim() || disabled) return;
    setInput(''); // svuota subito il campo
    onSend(text);
  };

  return (
    <div className={cn('[padding:var(--space-fluid-s)] border-t border-border bg-surface-2', className)}>
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Message to Cherry"
          className={cn(
            // Input: statico turchese tenue, focus turchese pieno (cherry sembrava un errore)
            'w-full bg-surface border border-cherry-static/40 rounded-2xl focus:border-cherry-static focus:outline-none py-4 pl-6 pr-14 transition-all text-title',
            'placeholder:text-muted/50 placeholder:italic',
            '[font-size:var(--text-fluid-body)]'
          )}
        />
        <button
          onClick={submit}
          disabled={!input.trim() || disabled}
          aria-label="Send message"
          className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl bg-cherry-ai text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all shadow-lg shadow-cherry-ai/20"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </div>
    </div>
  );
};

export default ChatInputBar;
