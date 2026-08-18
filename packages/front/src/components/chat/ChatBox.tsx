
import React, { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useCherry } from './CherryProvider';
import { UserProfile } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../i18n';
import { Typography } from '../ui/Typography';
import { CherryFormatter } from './CherryFormatter';
import { CherryRichBlocks } from './CherryRichBlocks';
import type { ChatOption, ChatNodeId } from '@thaiakha/shared/data/chatFlowData';
import { getCherryCTA } from '@thaiakha/shared/data/chatFlowData';
import AkhaPixelPattern from '../divider/AkhaPixelPattern';
import { CHERRY_TITLE_STYLE, CHERRY_SUBTITLE_STYLE, CHERRY_AVATAR_SRC, CHERRY_HEADER_PAD_Y, CHERRY_SMALL_AVATAR_BG } from './ChatIdentityHeader';

// Helper to parse leading emoji/icon from chat option label
const parseLabel = (label: string) => {
  const firstSpaceIndex = label.indexOf(' ');
  if (firstSpaceIndex > 0) {
    const icon = label.slice(0, firstSpaceIndex).trim();
    const text = label.slice(firstSpaceIndex + 1).trim();
    // Validate if the first token is a symbol, emoji, or non-alphanumeric character
    const isIcon = /[\p{Emoji}\u2700-\u27BF\uE000-\uF8FF\uD83C\uDC00-\uD83D\uDFFF\u2011-\u26FF\uD83C-\uDBFF]/u.test(icon) || icon.length <= 3;
    if (isIcon) {
      return { icon, text };
    }
  }
  return { icon: null, text: label };
};

interface ChatBoxProps {
  isDarkMode: boolean;
  onNavigate?: (page: string, topic?: string) => void;
  userProfile?: UserProfile | null;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const { lockScroll, unlockScroll } = useScrollLock();

  // Stato Cherry dal Context unico (CherryProvider) → sync live con CherryInlineChat
  const {
    messages,
    sendMessage,
    injectInteraction,
    injectStaticExchange,
    isLoading,
    chatError,
    hasInlineSurface,
    isVoiceActive,
    isConnecting,
    startSession,
    stopSession,
    sendTextMessage,
    inputTranscript,
    outputTranscript,
    voiceError,
  } = useCherry();

  // ── Body scroll lock when chat is open — MOBILE ONLY ──────────────────────
  // Su mobile la chat è fullscreen: blocchiamo lo scroll del body per eliminare
  // il "parassita" scroll e il rubber-banding di Safari iOS (useScrollLock gestisce
  // position:fixed + ripristino scrollY). Su tablet/desktop la chat fluttua, quindi
  // la pagina dietro deve restare navigabile → nessun lock.
  useEffect(() => {
    if (!isOpen) return;
    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    if (!isMobile) return;
    lockScroll();
    return () => unlockScroll();
  }, [isOpen, lockScroll, unlockScroll]);

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

  // ── Ancoraggio in basso all'APERTURA (mostra ultimi messaggi) ────────────
  // NESSUN auto-scroll continuo: a fine trascrizione la chat NON scrolla → si ferma
  // dove è (posizione fissa). L'unico scroll per-turno è l'align-to-top del nuovo
  // messaggio utente.
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [isOpen]);

  // ── Monitor when a new user question is submitted to align smoothly to the top ──
  const prevLastUserMsgIdRef = useRef<string | null>(null);
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMsg = userMessages[userMessages.length - 1];

    if (lastUserMsg && lastUserMsg.id !== prevLastUserMsgIdRef.current) {
      prevLastUserMsgIdRef.current = lastUserMsg.id;
      shouldAutoScrollRef.current = false;

      setTimeout(() => {
        const targetId = `chat-msg-${lastUserMsg.id}`;
        const element = document.getElementById(targetId);
        const container = scrollContainerRef.current;
        if (element && container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top - containerRect.top + container.scrollTop;

          container.scrollTo({
            top: absoluteElementTop - 8,
            behavior: 'smooth'
          });
        }
      }, 100); // Small timeout to ensure DOM update
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    shouldAutoScrollRef.current = true;
    setIsScrolledUp(false);
  };

  // ── Chat option button handler — processes action + navigates if needed ────
  const handleOptionClick = (opt: ChatOption) => {
    // Pulsante mappa pickup dinamico: apre la PickUpPage e auto-cerca l'hotel.
    // NON è un nodo della ragnatela → naviga + dispatch e basta (return early).
    if (opt.action === 'nav_pickup_hotel') {
      // sessionStorage sopravvive al lazy-mount della PickUpPage (l'evento da solo
      // andrebbe perso perché la pagina monta il listener dopo). L'evento copre il
      // caso "pagina già aperta".
      try { if (opt.data?.hotel) sessionStorage.setItem('cherry_pickup_hotel', opt.data.hotel); } catch { /* noop */ }
      onNavigate?.('location');
      window.dispatchEvent(new CustomEvent('cherry-pickup-search', { detail: { hotel: opt.data?.hotel } }));
      return;
    }
    switch (opt.action) {
      case 'nav_booking':
        onNavigate?.('booking');
        break; // chat stays open — navigation opens in app, chat persists
      case 'nav_classes':
        onNavigate?.('thai-cooking-classes-chiang-mai');
        break;
      case 'nav_menu':
        onNavigate?.('recipes');
        break;
      case 'nav_quiz':
        onNavigate?.('quiz');
        break; // chat stays open — no close on navigation
      case 'open_map':
        onNavigate?.('location'); // apre la PickUpPage (mappa). Prima l'evento 'open-pickup-map' era morto.
        break;
      case 'set_diet':
        if (opt.data?.diet) {
          window.dispatchEvent(
            new CustomEvent('cherry-set-diet', { detail: { diet: opt.data.diet } })
          );
        }
        break;
      case 'nav_culture':
        if (opt.data?.slug) {
          onNavigate?.(`akha-culture-highland-heritage/${opt.data.slug}`);
        }
        break;
      case 'nav_news':
        if (opt.data?.slug) {
          onNavigate?.(`thai-cooking-tips-news/${opt.data.slug}`);
        }
        break;
      default:
        break;
    }
    // Always navigate the CHAT_FLOW tree (zero API call) — chat never auto-closes
    injectStaticExchange(opt.label, opt.nextId as ChatNodeId);
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
      const { topic, systemContext, presetResponse, followupOptions, presetBlocks } = e.detail || {};
      if (!topic) return;
      // Se una CherryInlineChat è visibile (es. FAQ desktop), lo scambio compare
      // già lì (stato condiviso) → NON auto-aprire la box flottante. L'iniezione
      // sotto avviene comunque. Su mobile nessuna inline registrata → box si apre.
      if (!hasInlineSurface()) setIsOpen(true);

      if (presetResponse) {
        // FLUSSO ZERO-LATENCY — injeta risposta preset + (opz.) follow-up/blocchi.
        // Hint quiz (T6): passa presetBlocks (foto/audio) e NESSUN followupOptions.
        setTimeout(() => injectInteraction(topic, presetResponse, followupOptions ?? undefined, presetBlocks ?? undefined), 300);
      } else {
        // FLUSSO STANDARD (AI Handshake)
        const messageText = systemContext
          ? `${topic}\n\n[SYSTEM INSTRUCTION: ${systemContext}]`
          : topic;
        setTimeout(() => processUserMessage(messageText), 300);
      }
    };

    window.addEventListener('trigger-chat-topic', handleTriggerTopic);
    return () => window.removeEventListener('trigger-chat-topic', handleTriggerTopic);
  }, [isLoading, isConnecting, isVoiceActive, hasInlineSurface]);

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

  // Header chat = stesso gradiente cherry del mondo Cherry (= header FAQ inline)
  const headerColor = 'bg-[image:var(--cherry-btn-grad)]';

  // Auto-focus input when loading ends, chat opens, or voice becomes inactive
  useEffect(() => {
    if (isOpen && !isLoading && !isVoiceActive && !isConnecting) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading, isVoiceActive, isConnecting]);

  // Testi chat uniformati alla FAQ (rimosso il +1 step 'cherryTextScale' che
  // ingrandiva i messaggi della main chat rispetto alla inline FAQ).

  // #31 — pillole follow-up SOLO sotto l'ultimo messaggio di Cherry (no accumulo).
  const lastOptionsMsgId = [...messages]
    .reverse()
    .find(m => m.role === 'model' && !m.isStreaming && m.options && m.options.length > 0)?.id;

  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col items-end [gap:var(--space-fluid-m)] pointer-events-none font-sans transition-all duration-500',
        // Mobile: inset-0 (occupa tutto)
        // Tablets/Desktop (sm+): fluttuante in basso a destra
        isOpen ? 'inset-0 items-center justify-center' : 'right-11 bottom-11'
      )}
    >
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with Cherry"
          aria-modal="true"
          className={cn(
            'pointer-events-auto w-screen h-dvh max-w-none rounded-none', // 📱 iOS Keyboard Resistant (CSS only)
            'sm:w-[441px] sm:!h-[clamp(400px,64vh,640px)] sm:fixed sm:right-11 sm:bottom-11 sm:rounded-[2.5rem]',
            'flex flex-col overflow-hidden border border-white/10',
            'shadow-2xl backdrop-blur-3xl',
            'origin-bottom-right animate-in fade-in zoom-in-95 duration-500',
            'bg-surface/95' // 🎨 Token V4 Puro (Reagisce a .dark senza logica JS)
          )}
        >
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
                onClick={handleToggleVoice}
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
            className="flex-1 overflow-y-auto overscroll-contain [padding-inline:var(--space-fluid-s)] [padding-top:var(--space-fluid-s)] [padding-bottom:calc(var(--space-fluid-s)/2)] flex flex-col [gap:var(--space-fluid-m)] custom-scrollbar"
          >
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
                  {(m as any).isStreaming && !m.text ? (
                    <div className="flex gap-1.5 py-1 px-1">
                      <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="size-1.5 bg-cherry-ai rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  ) : m.role === 'model' ? (
                    <CherryFormatter
                      text={m.text}
                      fullText={(m as any).fullText}
                      isStreaming={!!(m as any).isStreaming}
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

            {/* Render scrollable bottom room only during input/streaming to allow smooth question alignment without creating an infinite scroll void at the end */}
            {(messages.some(m => m.isStreaming) || messages[messages.length - 1]?.role === 'user') && (
              <div className="[height:min(50vh,280px)] shrink-0" />
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>

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
    </div>

  );
};

export default ChatBox;
