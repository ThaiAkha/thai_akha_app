
import React, { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useCherryChat } from '../../hooks/useCherryChat';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { UserProfile } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../ui/Typography';
import { VoiceWaveform } from './VoiceWaveform';

interface ChatBoxProps {
  isDarkMode: boolean;
  onNavigate?: (page: string, topic?: string) => void;
  userProfile?: UserProfile | null;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ isDarkMode, onNavigate, userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [viewportH, setViewportH] = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    sendMessage,
    addVoiceMessages,
    isLoading,
    error: chatError,
    sessionId,
  } = useCherryChat(userProfile);

  const {
    isActive: isVoiceActive,
    isConnecting,
    startSession,
    stopSession,
    sendTextMessage,
    inputTranscript,
    outputTranscript,
    analyserRef,
    error: voiceError,
  } = useGeminiLive(userProfile, sessionId, addVoiceMessages);

  // ── visualViewport resize (keyboard avoidance) ────────────────────────────
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setViewportH(vv.height);
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, []);

  // ── Body scroll lock when chat is open ────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Focus input after open animation ─────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 750);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ── Monitor manual scrolling ──────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
        shouldAutoScrollRef.current = isAtBottom;
        setIsScrolledUp(!isAtBottom);
      }
    };

    const container = scrollContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Auto-scroll on new messages AND during streaming ─────────────────────
  useEffect(() => {
    if (shouldAutoScrollRef.current && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    shouldAutoScrollRef.current = true;
    setIsScrolledUp(false);
  };

  const processUserMessage = async (text: string) => {
    if (!text.trim() || isLoading || isConnecting) return;
    // Clear input immediately — flushSync ensures DOM update before async chain starts
    flushSync(() => {
      setInput('');
      shouldAutoScrollRef.current = true;
    });
    if (isVoiceActive) {
      sendTextMessage(text);
    } else {
      await sendMessage(text);
    }
  };

  // ── External trigger (es: Ask Cherry from RecipeSingle) ──────────────────
  useEffect(() => {
    const handleTriggerTopic = (e: any) => {
      const topic = e.detail?.topic;
      if (!topic) return;
      setIsOpen(true);
      setTimeout(() => processUserMessage(topic), 300);
    };

    window.addEventListener('trigger-chat-topic', handleTriggerTopic);
    return () => window.removeEventListener('trigger-chat-topic', handleTriggerTopic);
  }, [isLoading, isConnecting, isVoiceActive]);

  const handleToggleVoice = () => {
    if (isVoiceActive) {
      stopSession();
    } else {
      // Ensure AudioContext is resumed/started on user gesture
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const dummyCtx = new AudioContextClass();
        if (dummyCtx.state === 'suspended') {
          dummyCtx.resume().catch((e: any) => console.error('AudioContext resume failed:', e));
        }
      }
      startSession();
    }
  };

  const headerColor = 'bg-primary';

  // Auto-focus input when loading ends, chat opens, or voice becomes inactive
  useEffect(() => {
    if (isOpen && !isLoading && !isVoiceActive && !isConnecting) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading, isVoiceActive, isConnecting]);

  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col items-end [gap:var(--space-fluid-m)] pointer-events-none font-sans transition-all duration-500',
        // Mobile: inset-0 (occupa tutto)
        // Tablets/Desktop (sm+): fluttuante in basso a destra
        isOpen ? 'inset-0 items-center justify-center' : 'right-6 bottom-6'
      )}
    >
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with Cherry"
          aria-modal="true"
          style={{ height: `calc(${viewportH}px)` }}
          className={cn(
            'pointer-events-auto w-screen h-screen max-w-none rounded-none', // Default Mobile Full Screen
            'sm:w-[441px] sm:!h-[clamp(400px,64vh,640px)] sm:fixed sm:right-6 sm:bottom-6 sm:rounded-[2.5rem]', // Tablet/Desktop Bubble
            'flex flex-col overflow-hidden border border-white/10',
            'shadow-2xl backdrop-blur-3xl',
            'origin-bottom-right animate-in fade-in zoom-in-95 duration-500',
            isDarkMode ? 'bg-surface-overlay/95' : 'bg-white/95'
          )}
        >
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div
            className={cn(
              'h-20 flex items-center justify-between [padding:var(--space-fluid-s)] shrink-0 relative overflow-hidden transition-colors duration-500',
              isVoiceActive ? 'bg-action' : headerColor
            )}
          >
            <div className="flex items-center [gap:var(--space-fluid-xs)] relative z-10 text-white">
              <div
                className={cn(
                  'size-12 rounded-full overflow-hidden flex items-center justify-center border transition-all duration-700 shadow-theme-md',
                  isVoiceActive
                    ? 'bg-white border-action scale-105 shadow-glow-lime'
                    : 'bg-white/10 border-white/20'
                )}
              >
                <img
                  src="/avatarCherry/600-Avatar-AuthPage.webp"
                  alt="Cherry"
                  className={cn(
                    'w-full h-full object-cover transition-all duration-700',
                    isVoiceActive ? 'scale-110' : 'scale-100'
                  )}
                />
              </div>

              <div>
                <Typography variant="accent" className="text-sm text-white">
                  Cherry Cheff
                </Typography>

                {/* Status dot + label */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      'size-2 rounded-full shrink-0',
                      (voiceError || chatError)
                        ? 'bg-sys-error'
                        : isConnecting
                          ? 'bg-sys-warning animate-pulse'
                          : isVoiceActive
                            ? 'bg-action animate-pulse'
                            : 'bg-sys-success'
                    )}
                  />
                  <Typography variant="microLabel" as="p" className="opacity-80 text-white normal-case">
                    {(voiceError || chatError)
                      ? 'Error — tap to retry'
                      : isConnecting
                        ? 'Connecting...'
                        : isVoiceActive
                          ? 'Listening...'
                          : 'Ready'}
                  </Typography>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* 1 — Voice toggle */}
              <button
                onClick={handleToggleVoice}
                disabled={isConnecting}
                aria-label={isVoiceActive ? 'Stop voice' : 'Start voice'}
                title={isVoiceActive ? 'Stop voice' : 'Start voice'}
                className={cn(
                  'size-12 rounded-full flex items-center justify-center transition-all duration-300',
                  isVoiceActive
                    ? 'bg-white text-action shadow-glow-lime'
                    : 'bg-white/15 text-white hover:bg-white/30'
                )}
              >
                <span className="material-symbols-outlined text-2xl">
                  {isVoiceActive ? 'mic_off' : 'mic'}
                </span>
              </button>

              {/* 2 — Minimize box, keep voice */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat, keep voice active"
                title={isVoiceActive ? 'Minimize (voice stays on)' : 'Minimize chat'}
                className="size-12 rounded-full flex items-center justify-center bg-white/15 text-white hover:bg-white/30 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-2xl">keyboard_arrow_down</span>
              </button>

              {/* 3 — Close box + session */}
              <button
                onClick={() => { if (isVoiceActive) stopSession(); setIsOpen(false); }}
                aria-label="Close chat and end session"
                title="Close chat and end session"
                className="size-12 rounded-full flex items-center justify-center bg-white/15 text-white hover:bg-white/40 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          </div>

          {/* ── Messages Area ───────────────────────────────────────────── */}
          <div
            ref={scrollContainerRef}
            role="log"
            aria-label="Messages"
            aria-live="polite"
            aria-atomic="false"
            className="flex-1 overflow-y-auto [padding:var(--space-fluid-s)] flex flex-col [gap:var(--space-fluid-m)] custom-scrollbar"
          >
            {messages.map((m, i) => (
              <div
                key={m.id || i}
                className={cn(
                  'flex flex-col animate-in fade-in slide-in-from-bottom-2',
                  m.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] [padding:var(--space-fluid-xs)] rounded-[1.5rem] shadow-sm transition-all',
                    m.role === 'user'
                      ? 'bg-transparent border-2 border-action/20 rounded-tr-none'
                      : 'bg-transparent border-2 border-primary/20 rounded-tl-none'
                  )}
                >
                  {(m as any).isStreaming && !m.text ? (
                    <div className="flex gap-1.5 py-1 px-1">
                      <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  ) : (
                    <Typography variant="paragraphS" color="title" className="leading-snug">
                      {m.text}
                    </Typography>
                  )}
                </div>
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
                    <div className="bg-action/20 p-4 rounded-2xl border border-action/30 shadow-glow-lime">
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
                <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            )}

            {/* Scroll-to-bottom button */}
            {isScrolledUp && (
              <div className="sticky bottom-2 flex justify-center pointer-events-none">
                <button
                  onClick={scrollToBottom}
                  className="pointer-events-auto flex items-center [gap:var(--space-fluid-2xs)] bg-surface border border-border text-title shadow-theme-md rounded-full px-4 py-2 hover:bg-surface-2 transition-all animate-in fade-in slide-in-from-bottom-2"
                >
                  <span className="material-symbols-outlined text-sm text-action">expand_more</span>
                  <Typography variant="microLabel" color="sub">Go to bottom</Typography>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* ── Input Area ──────────────────────────────────────────────── */}
          <div className="[padding:var(--space-fluid-s)] border-t border-border bg-surface-2">
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
                  'w-full bg-surface border border-border rounded-2xl focus:border-primary/50 py-4 pl-6 pr-14 transition-all text-title',
                  'placeholder:text-muted/50 placeholder:italic',
                  '[font-size:var(--text-fluid-body)]'
                )}
              />
              <button
                onClick={() => processUserMessage(input)}
                disabled={!input.trim() || isLoading || isConnecting || isVoiceActive}
                aria-label="Send message"
                className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB ────────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Cherry chat"
          aria-expanded={false}
          aria-haspopup="dialog"
          className={cn(
            'pointer-events-auto transition-all duration-300 transform hover:scale-105 active:scale-95 relative overflow-hidden',
            'flex items-center justify-center size-20 rounded-full text-white',
            // Pocket Voice Mode Styles
            isVoiceActive
              ? 'bg-action shadow-glow-lime animate-pulse-subtle ring-4 ring-action/40 ring-offset-2'
              : 'bg-primary shadow-glow-cherry animate-bounce ring-4 ring-primary-200/60 ring-offset-2',
            // Desktop variants (sm+)
            'sm:animate-bounce-subtle sm:flex-row sm:w-auto sm:h-16 sm:pr-6 sm:gap-3 sm:rounded-full sm:ring-4 sm:ring-offset-2'
          )}
        >
          <div className="shrink-0 size-16 sm:size-16 flex items-center justify-center overflow-hidden rounded-full">
            <img
              src="/avatarCherry/600-Avatar-AuthPage.webp"
              alt="Cherry"
              className={cn(
                'size-full object-cover',
                isVoiceActive ? 'bg-action-400' : 'bg-primary-400'
              )}
            />
          </div>

          <div className="hidden sm:flex flex-col items-start justify-center text-left">
            <span className="text-sm font-black uppercase tracking-widest leading-none">
              {isVoiceActive ? 'Cherry is listening' : 'Chat with me'}
            </span>
            <span className="[font-size:var(--text-fluid-micro)] font-bold uppercase opacity-90 tracking-tighter italic leading-none">
              {isVoiceActive ? 'Voice session active' : 'Sawasdee kha'}
            </span>
          </div>

          {isVoiceActive && (
            <div className="absolute inset-0 rounded-full border-4 border-white animate-ping pointer-events-none opacity-40" />
          )}
        </button>
      )}
    </div>

  );
};

export default ChatBox;
