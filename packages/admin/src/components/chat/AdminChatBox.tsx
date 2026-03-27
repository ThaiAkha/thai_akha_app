import React, { useState, useRef, useEffect } from 'react';
import { useCherryContext } from '../../providers/CherryProvider';
import { cn } from '@thaiakha/shared/lib/utils';
import {
  Bot,
  X,
  Minus,
  Maximize2,
  Mic,
  MicOff,
  Send,
  AudioLines,
} from 'lucide-react';

type ChatState = 'closed' | 'minimized' | 'expanded';
const STORAGE_KEY = 'cherry_admin_chat_state';

const SoundWave: React.FC = () => (
  <div className="flex items-center justify-center gap-[3px] h-8">
    {[1, 2, 3, 4, 5].map(i => (
      <span
        key={i}
        className="block w-1 rounded-full bg-white animate-bounce"
        style={{
          height: `${8 + (i % 3) * 8}px`,
          animationDelay: `${i * 0.1}s`,
          animationDuration: '0.8s',
        }}
      />
    ))}
  </div>
);

export const AdminChatBox: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved as ChatState) || 'closed';
    } catch {
      return 'closed';
    }
  });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
    isLoading,
    chatError,
    isVoiceActive,
    isConnecting,
    voiceError,
    inputTranscript,
    outputTranscript,
    startSession,
    stopSession,
    sendTextMessage,
  } = useCherryContext();

  const persistState = (newState: ChatState) => {
    setChatState(newState);
    try { localStorage.setItem(STORAGE_KEY, newState); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (chatState === 'expanded') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, inputTranscript, outputTranscript, chatState]);

  const processUserMessage = async (text: string) => {
    if (!text.trim() || isLoading || isConnecting) return;
    setInput('');
    if (isVoiceActive) {
      sendTextMessage(text);
    } else {
      await sendMessage(text);
    }
  };

  const handleToggleVoice = () => {
    if (isVoiceActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const activeError = voiceError || chatError;

  // CLOSED — floating button with primary color
  if (chatState === 'closed') {
    return (
      <div className="fixed bottom-6 right-6 z-[999]">
        <button
          onClick={() => persistState('expanded')}
          className="size-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="Open Cherry AI"
        >
          <Bot size={24} />
        </button>
      </div>
    );
  }

  // MINIMIZED — floating 120x120 widget with sound wave when voice active
  if (chatState === 'minimized') {
    return (
      <div
        className="fixed bottom-6 right-6 z-[999] rounded-3xl bg-brand-500 shadow-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ width: 120, height: 120 }}
      >
        {isVoiceActive ? (
          <>
            <SoundWave />
            <button
              onClick={stopSession}
              className="text-[10px] text-white/80 hover:text-white transition-colors"
            >
              Stop voice
            </button>
          </>
        ) : (
          <Bot size={36} className="text-white" />
        )}

        <div className="absolute top-1.5 right-1.5 flex gap-1">
          <button
            onClick={() => persistState('expanded')}
            className="size-6 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
            aria-label="Expand chat"
          >
            <Maximize2 size={10} className="text-white" />
          </button>
          <button
            onClick={() => persistState('closed')}
            className="size-6 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
            aria-label="Close chat"
          >
            <X size={10} className="text-white" />
          </button>
        </div>

        {isVoiceActive && (
          <div className="absolute inset-0 rounded-3xl border-2 border-white/40 animate-ping pointer-events-none" />
        )}
      </div>
    );
  }

  // EXPANDED — 400px panel
  return (
    <div
      className="fixed bottom-6 right-6 z-[999] w-[400px] h-[min(640px,85vh)] flex flex-col rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-gray-900 transition-all duration-500"
      style={{ width: 400 }}
    >
      {/* Header */}
      <div className={cn(
        'h-16 flex items-center justify-between px-5 shrink-0 transition-colors duration-500',
        isVoiceActive ? 'bg-red-600' : 'bg-brand-500'
      )}>
        <div className="flex items-center gap-3 text-white">
          <div className={cn(
            'size-10 rounded-xl flex items-center justify-center border border-white/20 transition-all duration-500',
            isVoiceActive ? 'bg-white text-red-600 animate-pulse' : 'bg-white/10'
          )}>
            {isVoiceActive ? <AudioLines size={20} /> : <Bot size={20} />}
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-wide">Cherry</h4>
            <p className="text-[10px] opacity-60 uppercase tracking-widest">
              {activeError
                ? <span className="normal-case opacity-80">{activeError}</span>
                : isConnecting ? 'Connecting...'
                : isVoiceActive ? 'Voice Active'
                : 'Admin Copilot'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleVoice}
            disabled={isConnecting}
            className={cn(
              'size-9 rounded-xl flex items-center justify-center transition-all duration-300',
              isVoiceActive ? 'bg-white text-red-600' : 'bg-white/10 text-white hover:bg-white/20'
            )}
            aria-label="Toggle voice"
          >
            {isVoiceActive ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={() => persistState('minimized')}
            className="size-9 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Minimize"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => persistState('closed')}
            className="size-9 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div
            key={m.id || i}
            className={cn('flex flex-col', m.role === 'user' ? 'items-end' : 'items-start')}
          >
            <div className={cn(
              'max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed',
              m.role === 'user'
                ? 'bg-brand-500 text-white rounded-tr-none'
                : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
            )}>
              {m.text}
              {m.isStreaming && (
                <span className="inline-block w-1.5 h-3.5 bg-current ml-1 animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}

        {/* Live transcription */}
        {isVoiceActive && (
          <div className="mt-auto space-y-3">
            {inputTranscript && (
              <div className="flex justify-end opacity-60">
                <div className="bg-white/10 p-2 rounded-xl text-[11px] text-white italic">
                  &ldquo;{inputTranscript}...&rdquo;
                </div>
              </div>
            )}
            {outputTranscript && (
              <div className="flex justify-start">
                <div className="bg-brand-500/20 p-3 rounded-xl text-[12px] text-white border border-brand-500/30">
                  Cherry: {outputTranscript}
                </div>
              </div>
            )}
          </div>
        )}

        {(isLoading || isConnecting) && (
          <div className="flex gap-1.5 py-2 px-4 rounded-full bg-white/5 w-fit animate-pulse">
            <div className="size-1.5 bg-brand-400 rounded-full" />
            <div className="size-1.5 bg-brand-400 rounded-full" />
            <div className="size-1.5 bg-brand-400 rounded-full" />
          </div>
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && processUserMessage(input)}
            placeholder={isVoiceActive ? 'Cherry is listening...' : 'Ask Cherry kha...'}
            disabled={isLoading || isConnecting || isVoiceActive}
            className="w-full bg-white/5 border border-white/10 rounded-xl text-sm py-3 pl-4 pr-12 text-white placeholder:text-white/30 focus:border-brand-400/50 transition-colors outline-none"
          />
          <button
            onClick={() => processUserMessage(input)}
            disabled={!input.trim() || isLoading || isConnecting || isVoiceActive}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChatBox;
