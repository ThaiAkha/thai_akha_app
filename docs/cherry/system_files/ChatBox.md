# 📦 ChatBox Component (Unified UI)

**Source File:** `packages/front/src/components/chat/ChatBox.tsx`  
**Description:** The primary frontend component for the Cherry interface. It orchestrates the transition between Text Mode (`useCherryChat`) and Voice Mode (`useGeminiLive`), providing a cohesive user experience with real-time feedback, transcription overlays, and automated keyboard avoidance.

---

## 📄 Full File Content (1:1 with Code)

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { useCherryChat } from '../../hooks/useCherryChat';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { UserProfile } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../ui/Typography';

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
    error: voiceError,
  } = useGeminiLive(userProfile, sessionId, addVoiceMessages);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setViewportH(vv.height);
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 750);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  useEffect(() => {
    if (shouldAutoScrollRef.current && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    shouldAutoScrollRef.current = true;
    setIsScrolledUp(false);
  };

  const processUserMessage = async (text: string) => {
    if (!text.trim() || isLoading || isConnecting) return;
    setInput('');
    shouldAutoScrollRef.current = true;
    if (isVoiceActive) {
      sendTextMessage(text);
    } else {
      await sendMessage(text);
    }
  };

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
    if (isVoiceActive) stopSession();
    else startSession();
  };

  return (
    <div className="fixed right-6 bottom-6 z-[100] flex flex-col items-end [gap:var(--space-fluid-m)] pointer-events-none font-sans">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with Cherry"
          aria-modal="true"
          style={{ height: `calc(${viewportH}px - 6.5rem)` }}
          className={cn(
            'pointer-events-auto w-full max-w-[clamp(360px,95vw,420px)]',
            'sm:w-[420px] sm:!h-[clamp(500px,80vh,800px)]',
            'flex flex-col overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl transition-all duration-500',
            isDarkMode ? 'bg-surface-overlay/95' : 'bg-white/95'
          )}
        >
          {/* Header */}
          <div className={cn('h-20 flex items-center justify-between [padding:var(--space-fluid-s)] shrink-0 transition-colors', isVoiceActive ? 'bg-action' : 'bg-primary')}>
            <div className="flex items-center [gap:var(--space-fluid-xs)] text-white">
              <div className={cn('size-12 rounded-full overflow-hidden flex items-center justify-center border transition-all duration-700', isVoiceActive ? 'bg-white border-action scale-105 shadow-glow-lime' : 'bg-white/10 border-white/20')}>
                <img src="/avatarCherry/600-Avatar-AuthPage.webp" alt="Cherry" className={cn('w-full h-full object-cover transition-all duration-700', isVoiceActive ? 'scale-110' : 'scale-100')} />
              </div>
              <div>
                <Typography variant="accent" className="text-sm text-white">Cherry Cheff</Typography>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn('size-2 rounded-full', (voiceError || chatError) ? 'bg-sys-error' : isConnecting ? 'bg-sys-warning animate-pulse' : isVoiceActive ? 'bg-action animate-pulse' : 'bg-sys-success')} />
                  <Typography variant="microLabel" as="p" className="opacity-80 text-white normal-case">{(voiceError || chatError) ? 'Error' : isConnecting ? 'Connecting...' : isVoiceActive ? 'Listening...' : 'Ready'}</Typography>
                </div>
              </div>
            </div>
            <button onClick={handleToggleVoice} disabled={isConnecting} className={cn('size-12 rounded-full flex items-center justify-center transition-all duration-500', isVoiceActive ? 'bg-white text-action scale-110 shadow-glow-lime' : 'bg-white/10 text-inverse border border-white/20 hover:bg-white/20')}>
              <span className="material-symbols-outlined text-xl">{isVoiceActive ? 'mic_off' : 'record_voice_over'}</span>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollContainerRef} role="log" className="flex-1 overflow-y-auto [padding:var(--space-fluid-s)] flex flex-col [gap:var(--space-fluid-m)] custom-scrollbar">
            {messages.map((m, i) => (
              <div key={m.id || i} className={cn('flex flex-col animate-in fade-in slide-in-from-bottom-2', m.role === 'user' ? 'items-end' : 'items-start')}>
                <div className={cn('max-w-[85%] [padding:var(--space-fluid-xs)] rounded-[1.5rem] shadow-sm', m.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-surface-2 border border-border text-title rounded-tl-none')}>
                  <Typography variant="body" color={m.role === 'user' ? 'inverse' : 'title'}>{m.text}</Typography>
                </div>
              </div>
            ))}

            {isVoiceActive && (inputTranscript || outputTranscript) && (
              <div className="mt-auto space-y-4 animate-in fade-in pb-4">
                {inputTranscript && <div className="flex justify-end opacity-60"><div className="bg-surface-2 p-3 rounded-2xl border border-border"><Typography variant="caption" color="muted">"{inputTranscript}..."</Typography></div></div>}
                {outputTranscript && <div className="flex justify-start"><div className="bg-action/20 p-4 rounded-2xl border border-action/30 shadow-glow-lime"><Typography variant="body" className="font-medium text-white">Cherry: {outputTranscript}</Typography></div></div>}
              </div>
            )}

            {(isLoading || isConnecting) && <div className="flex gap-1.5 py-2 px-4 rounded-full bg-white/5 w-fit"><div className="size-1.5 bg-primary rounded-full animate-bounce" /><div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" /><div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" /></div>}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input */}
          <div className="[padding:var(--space-fluid-s)] border-t border-border bg-surface-2">
            <div className="relative group">
              <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && processUserMessage(input)} placeholder={isVoiceActive ? 'Cherry is listening...' : 'Ask Cherry anything kha...'} disabled={isLoading || isConnecting || isVoiceActive} className="w-full bg-surface border border-border rounded-2xl focus:border-primary/50 py-4 pl-6 pr-14 transition-all text-title" />
              <button onClick={() => processUserMessage(input)} disabled={!input.trim() || isLoading || isConnecting || isVoiceActive} className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-primary/20"><span className="material-symbols-outlined text-lg">send</span></button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setIsOpen(!isOpen)} className={cn('pointer-events-auto size-20 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-glow-cherry hover:scale-105 active:scale-95', isOpen ? 'bg-surface text-primary rotate-90 scale-90' : 'bg-primary text-white')}>
        <span className="material-symbols-outlined text-3xl md:text-4xl">{isOpen ? 'close' : 'chat'}</span>
      </button>
    </div>
  );
};

export default ChatBox;
```

---

## 🛠 Features Integrated
1. **Hybrid Interface**: Seamlessly switches between legacy text-chat and the new Gemini Multimodal Live voice session.
2. **Keyboard Management**: Uses `visualViewport` to dynamically adjust height, ensuring the input stays visible above the mobile keyboard.
3. **Voice Visualizer**: High-gloss UI feedback (lime-glow pulses) when `isVoiceActive` is true.
4. **Auto-Summary Integration**: Triggers conversation summaries after reaching the threshold defined in `useCherryChat`.
