import React, { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useCherry } from './CherryProvider';
import { UserProfile } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';
import type { ChatOption, NodeBlock } from '@thaiakha/shared/data/chatFlowData';
import { createOptionClickHandler } from './chatBox/createOptionClickHandler';
import { useChatBoxScroll } from './chatBox/useChatBoxScroll';
import { ChatBoxHeader } from './chatBox/ChatBoxHeader';
import { ChatBoxMessageList } from './chatBox/ChatBoxMessageList';
import { ChatBoxVoicePanel } from './chatBox/ChatBoxVoicePanel';
import { ScrollToBottomButton } from './chatBox/ScrollToBottomButton';
import { ChatBoxInput } from './chatBox/ChatBoxInput';
import { ChatBoxFab } from './chatBox/ChatBoxFab';

/** Payload del CustomEvent globale 'trigger-chat-topic' (AskCherryButton, CherryHelp, quiz, menu manager). */
interface TriggerChatTopicDetail {
  topic?: string;
  systemContext?: string;
  presetResponse?: string;
  followupOptions?: ChatOption[] | null;
  presetBlocks?: NodeBlock[] | null;
}

interface ChatBoxProps {
  isDarkMode: boolean;
  onNavigate?: (page: string, topic?: string) => void;
  userProfile?: UserProfile | null;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

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
    ensureChatReady,
  } = useCherry();

  // La sessione Supabase e lo storico si aprono qui, alla prima apertura della
  // box: prima partivano al mount della shell, per ogni visitatore di ogni
  // pagina, con la chat chiusa. Idempotente, quindi le riaperture non costano.
  useEffect(() => {
    if (isOpen) void ensureChatReady();
  }, [isOpen, ensureChatReady]);

  // Scorrimento (ancoraggio apertura, monitor manuale, align-to-top domanda)
  const { isScrolledUp, messagesEndRef, scrollContainerRef, shouldAutoScrollRef, scrollToBottom } = useChatBoxScroll(isOpen, messages);

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

  const handleOptionClick = createOptionClickHandler({ onNavigate, injectStaticExchange });

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
    const handleTriggerTopic = (e: Event) => {
      const { topic, systemContext, presetResponse, followupOptions, presetBlocks } =
        (e as CustomEvent<TriggerChatTopicDetail | undefined>).detail || {};
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- processUserMessage/injectInteraction cambiano a ogni render: si evita il re-subscribe continuo
  }, [isLoading, isConnecting, isVoiceActive, hasInlineSurface]);

  const handleToggleVoice = () => {
    if (isVoiceActive) {
      stopSession();
    } else {
      // Ensure AudioContext is resumed/started on user gesture
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const dummyCtx = new AudioContextClass();
        if (dummyCtx.state === 'suspended') {
          dummyCtx.resume().catch((e: unknown) => console.error('AudioContext resume failed:', e));
        }
      }
      startSession();
    }
  };

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
          <ChatBoxHeader
            isVoiceActive={isVoiceActive}
            isConnecting={isConnecting}
            voiceError={voiceError}
            chatError={chatError}
            onToggleVoice={handleToggleVoice}
            onMinimize={() => setIsOpen(false)}
            onClose={() => { if (isVoiceActive) stopSession(); setIsOpen(false); }}
          />

          {/* ── Messages Area ───────────────────────────────────────────── */}
          <div
            ref={scrollContainerRef}
            role="log"
            aria-label="Messages"
            aria-live="polite"
            aria-atomic="false"
            className="flex-1 overflow-y-auto overscroll-contain [padding-inline:var(--space-fluid-s)] [padding-top:var(--space-fluid-s)] [padding-bottom:calc(var(--space-fluid-s)/2)] flex flex-col [gap:var(--space-fluid-m)] custom-scrollbar"
          >
            <ChatBoxMessageList
              messages={messages}
              lastOptionsMsgId={lastOptionsMsgId}
              handleOptionClick={handleOptionClick}
            />

            <ChatBoxVoicePanel
              isVoiceActive={isVoiceActive}
              isConnecting={isConnecting}
              inputTranscript={inputTranscript}
              outputTranscript={outputTranscript}
            />

            <ScrollToBottomButton isScrolledUp={isScrolledUp} scrollToBottom={scrollToBottom} />

            {/* Render scrollable bottom room only during input/streaming to allow smooth question alignment without creating an infinite scroll void at the end */}
            {(messages.some(m => m.isStreaming) || messages[messages.length - 1]?.role === 'user') && (
              <div className="[height:min(50vh,280px)] shrink-0" />
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>

          <ChatBoxInput
            inputRef={inputRef}
            input={input}
            setInput={setInput}
            processUserMessage={processUserMessage}
            isLoading={isLoading}
            isConnecting={isConnecting}
            isVoiceActive={isVoiceActive}
          />
        </div>
      )}

      <ChatBoxFab isOpen={isOpen} isVoiceActive={isVoiceActive} onOpen={() => setIsOpen(true)} />
    </div>

  );
};

export default ChatBox;

