
import React, { useState, useRef, useEffect } from 'react';
import { useCherryChat } from '../../hooks/useCherryChat';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { UserProfile } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';
import { ALL_AGENTS, isAgentAllowed } from '@thaiakha/shared/prompts';

interface ChatBoxProps {
  isDarkMode: boolean;
  onNavigate?: (page: string, topic?: string) => void;
  userProfile?: UserProfile | null;
}

// Agents allowed in front context, in display order
const FRONT_AGENTS = ALL_AGENTS.filter(a => isAgentAllowed(a, 'front'));

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
    currentAgentId,
    switchAgent,
    pendingConfirmation,
    confirmSwitch,
    cancelSwitch,
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
  } = useGeminiLive(userProfile, 'front', sessionId);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, inputTranscript, outputTranscript, isOpen]);



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

  const handleAgentClick = (agentId: string) => {
    // Guest lock: only cooking_chef is free for guests
    if (!userProfile && agentId !== 'cooking_chef') {
      return;
    }
    switchAgent(agentId);
  };

  const activeAgent = FRONT_AGENTS.find(a => a.id === currentAgentId);
  const headerColor = activeAgent?.color ?? 'bg-primary';

  // Show agent selector after the first (greeting) message
  const showAgentSelector = messages.length >= 1;

  return (
    <div className="fixed right-6 bottom-6 z-[100] flex flex-col items-end gap-6 pointer-events-none font-sans">
      {isOpen && (
        <div
          className={cn(
            'pointer-events-auto w-[360px] md:w-[420px] h-[min(650px,80vh)] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl transition-all duration-700 ease-cinematic animate-in fade-in slide-in-from-bottom-12',
            isDarkMode ? 'bg-surface-overlay/95' : 'bg-white/95'
          )}
        >
          {/* Header */}
          <div
            className={cn(
              'h-20 flex items-center justify-between px-6 shrink-0 relative overflow-hidden transition-colors duration-500',
              isVoiceActive ? 'bg-action' : headerColor
            )}
          >
            <div className="flex items-center gap-4 relative z-10 text-white">
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
                    {activeAgent?.emoji ?? '🍒'}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-display font-black uppercase text-sm tracking-widest italic">
                  {activeAgent?.name ?? 'Cherry'}
                </h4>
                <p className="text-[9px] font-accent font-black opacity-60 uppercase tracking-widest">
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
                </p>
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

          {/* Agent Selector */}
          {showAgentSelector && !isVoiceActive && (
            <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 shrink-0">
              {FRONT_AGENTS.filter(agent => userProfile || agent.id === 'cooking_chef').map(agent => {
                const isActive = agent.id === currentAgentId;
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentClick(agent.id)}
                    title={agent.name}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all duration-300 flex items-center gap-1',
                      agent.color,
                      isActive && 'ring-2 ring-white scale-110 shadow-lg'
                    )}
                  >
                    <span>{agent.emoji}</span>
                    <span>{agent.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
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
                    'max-w-[85%] p-4 rounded-[1.5rem] text-[14px] leading-relaxed shadow-sm transition-all',
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : (isDarkMode
                          ? 'bg-white/5 border border-white/5 text-white/90'
                          : 'bg-white border border-black/5 text-gray-800') +
                        ' rounded-tl-none'
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Pending Confirmation Chip */}
            {pendingConfirmation && (
              <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white/10 border border-white/10 text-sm">
                  <span className={isDarkMode ? 'text-white/80' : 'text-gray-700'}>
                    Vuoi parlare con <strong>{pendingConfirmation.agentName}</strong>?
                  </span>
                  <button
                    onClick={confirmSwitch}
                    className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Si, connetti
                  </button>
                  <button
                    onClick={cancelSwitch}
                    className="px-3 py-1 rounded-full border border-white/20 text-white/60 text-xs hover:bg-white/5 transition-colors"
                  >
                    No, resta qui
                  </button>
                </div>
              </div>
            )}

            {/* Live Transcription Overlay */}
            {isVoiceActive && (
              <div className="mt-auto space-y-4 animate-in fade-in duration-500">
                {inputTranscript && (
                  <div className="flex justify-end opacity-60">
                    <div className="bg-white/10 p-3 rounded-2xl text-xs text-white italic border border-white/10">
                      "{inputTranscript}..."
                    </div>
                  </div>
                )}
                {outputTranscript && (
                  <div className="flex justify-start">
                    <div className="bg-action/20 p-4 rounded-2xl text-sm text-white font-medium border border-action/30 shadow-lg">
                      Cherry: {outputTranscript}
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
          <div className="p-6 border-t border-white/5 bg-black/5">
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
                  'w-full bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 text-sm py-4 pl-6 pr-14 transition-all',
                  isDarkMode ? 'text-white placeholder:text-white/20' : 'text-gray-900'
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
            : cn(activeAgent?.color ?? 'bg-primary', 'text-white hover:scale-110 active:scale-95')
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
