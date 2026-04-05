
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

// Agent state is now completely handled within useCherryChat

export const ChatBox: React.FC<ChatBoxProps> = ({ isDarkMode, onNavigate, userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
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
  } = useGeminiLive(userProfile, sessionId);

  const processUserMessage = async (text: string) => {
    if (!text.trim() || isLoading || isConnecting) return;
    setInput('');
    if (isVoiceActive) {
      sendTextMessage(text);
    } else {
      await sendMessage(text);
    }
  };

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, inputTranscript, outputTranscript, isOpen]);

  // --- EVENT LISTENER PER TRIGGER ESTERNI (Es: Ask Cherry in RecipeSingle) ---
  useEffect(() => {
    const handleTriggerTopic = (e: any) => {
      const topic = e.detail?.topic;
      if (!topic) return;

      // 1. Apri la chat
      setIsOpen(true);
      
      // 2. Invia il messaggio (piccolo delay per assicurarsi che lo stato sia pronto)
      setTimeout(() => {
        processUserMessage(topic);
      }, 300);
    };

    window.addEventListener('trigger-chat-topic', handleTriggerTopic);
    return () => window.removeEventListener('trigger-chat-topic', handleTriggerTopic);
  }, [isLoading, isConnecting, isVoiceActive]); // Re-bind se lo stato degli agenti cambia

  const handleToggleVoice = () => {
    if (isVoiceActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const headerColor = 'bg-primary';

  // Show agent selector space if needed (removed agent selector logic)

  return (
    <div className="fixed right-6 bottom-6 z-[100] flex flex-col items-end [gap:var(--space-fluid-m)] pointer-events-none font-sans">
      {isOpen && (
        <div
          className={cn(
            'pointer-events-auto w-full max-w-[clamp(360px,95vw,420px)] sm:w-[420px] h-[clamp(500px,80vh,800px)] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl transition-all duration-700 ease-cinematic animate-in fade-in slide-in-from-bottom-12',
            isDarkMode ? 'bg-surface-overlay/95' : 'bg-white/95'
          )}
        >
          {/* Header */}
          <div
            className={cn(
              'h-20 flex items-center justify-between [padding:var(--space-fluid-s)] shrink-0 relative overflow-hidden transition-colors duration-500',
              isVoiceActive ? 'bg-action' : headerColor
            )}
          >
            <div className="flex items-center [gap:var(--space-fluid-xs)] relative z-10 text-white">
              <div
                className={cn(
                  'size-12 rounded-2xl flex items-center justify-center border transition-all duration-700',
                  isVoiceActive
                    ? 'bg-white text-action animate-pulse'
                    : 'bg-white/10 border-white/20'
                )}
              >
                {isVoiceActive ? (
                  <span className="material-symbols-outlined text-2xl">graphic_eq</span>
                ) : (
                  <span className="text-2xl leading-none">
                    🍒
                  </span>
                )}
              </div>
              <div>
                <Typography variant="accent" color="inverse" className="italic text-sm">
                  Cherry
                </Typography>
                <Typography variant="microLabel" as="p" className="opacity-60 text-inverse">
                  {voiceError || chatError ? (
                    <span className="text-white/80 normal-case">
                      {voiceError || chatError}
                    </span>
                  ) : isConnecting ? (
                    'Connecting...'
                  ) : isVoiceActive ? (
                    'Live Voice'
                  ) : (
                    'AI Assistant'
                  )}
                </Typography>
              </div>
            </div>
            <button
              onClick={handleToggleVoice}
              disabled={isConnecting}
              className={cn(
                'p-3 rounded-xl transition-all duration-500',
                isVoiceActive
                  ? 'bg-white text-action scale-110 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              <span className="material-symbols-outlined text-lg">
                {isVoiceActive ? 'mic_off' : 'record_voice_over'}
              </span>
            </button>
          </div>



          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto [padding:var(--space-fluid-s)] flex flex-col [gap:var(--space-fluid-m)] custom-scrollbar">
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
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-surface-2 border border-border text-title rounded-tl-none'
                  )}
                >
                  <Typography variant="body" color={m.role === 'user' ? 'inverse' : 'title'}>
                    {m.text}
                  </Typography>
                </div>
              </div>
            ))}



            {/* Live Transcription Overlay */}
            {isVoiceActive && (
              <div className="mt-auto space-y-4 animate-in fade-in duration-500">
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
                        Cherry: {outputTranscript}
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(isLoading || isConnecting) && (
              <div className="flex gap-1.5 py-2 px-4 rounded-full bg-white/5 w-fit animate-pulse">
                <div className="size-1.5 bg-primary rounded-full" />
                <div className="size-1.5 bg-primary rounded-full" />
                <div className="size-1.5 bg-primary rounded-full" />
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Area */}
          <div className="[padding:var(--space-fluid-s)] border-t border-border bg-surface-2">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && processUserMessage(input)}
                placeholder={
                  isVoiceActive ? 'Cherry is listening...' : 'Ask Cherry anything kha...'
                }
                disabled={isLoading || isConnecting || isVoiceActive}
                className={cn(
                  'w-full bg-surface border border-border rounded-2xl focus:border-primary/50 py-4 pl-6 pr-14 transition-all text-title placeholder:text-muted',
                  '[font-size:var(--text-fluid-body)]'
                )}
              />
              <button
                onClick={() => processUserMessage(input)}
                disabled={!input.trim() || isLoading || isConnecting || isVoiceActive}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle FAB — colore dinamico agente attivo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'pointer-events-auto size-16 md:size-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 ease-cinematic shadow-2xl relative',
          isOpen
            ? 'bg-surface text-primary rotate-90 scale-90'
            : cn('bg-primary', 'text-white hover:scale-110 active:scale-95')
        )}
      >
        <span className="material-symbols-outlined text-3xl md:text-4xl">
          {isOpen ? 'close' : isVoiceActive ? 'graphic_eq' : 'chat'}
        </span>
        {isVoiceActive && !isOpen && (
          <div className="absolute inset-0 rounded-[2rem] border-4 border-action animate-ping" />
        )}
      </button>
    </div>
  );
};

export default ChatBox;
