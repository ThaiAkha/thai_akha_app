
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { getCherrySystemPrompt } from '../../prompts/cherrySystem';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { UserProfile } from '../../services/authService';
import { ChatMessage } from '../../types';
import { Button, Icon, Typography } from '../ui/index'; 
import { cn } from '../../lib/utils';

interface ChatBoxProps {
  isDarkMode: boolean;
  onNavigate?: (page: string, topic?: string) => void;
  userProfile?: UserProfile | null;
}

const parseCherryResponse = (raw: string): { text: string; suggestions: string[] } => {
  if (!raw) return { text: "", suggestions: [] };
  const regexFull = /{{SUGGESTIONS:\s*([\s\S]*?)}}/;
  let suggestions: string[] = [];
  let text = raw.trim();
  const matchFull = text.match(regexFull);
  if (matchFull) {
    suggestions = matchFull[1].split('|').map(s => s.trim()).filter(Boolean);
    text = text.replace(matchFull[0], '').trim();
  }
  if (text && !text.toLowerCase().includes('kha') && text.length > 5) {
    const lastChar = text.slice(-1);
    text = ['!', '?', '.'].includes(lastChar) ? text.slice(0, -1) + " kha" + lastChar : text + " kha";
  }
  return { text, suggestions };
};

export const ChatBox: React.FC<ChatBoxProps> = ({ isDarkMode, onNavigate, userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dynamicPrompt = useMemo(() => {
    return getCherrySystemPrompt(
      userProfile || {}, 
      userProfile?.dietary_profile || 'diet_regular', 
      userProfile?.allergies || []
    );
  }, [userProfile]);

  const {
    isActive: isVoiceActive,
    isConnecting,
    startSession,
    stopSession,
    sendTextMessage,
    inputTranscript,
    outputTranscript,
    error: voiceError
  } = useGeminiLive();

  useEffect(() => {
    if (messages.length === 0) {
      const firstName = userProfile?.full_name?.split(' ')[0] || '';
      const greetingText = firstName
        ? `Sawasdee kha ${firstName}! Welcome back to your Akha kitchen. Ready to cook? kha`
        : "Sawasdee kha! I'm Cherry, your Akha cultural guide. How can I help you today? kha";
      setMessages([{
        id: 'msg-init',
        role: 'model',
        text: greetingText,
        suggestions: ["🥘 See Menu", "📅 Book Class", "🛖 Akha Story", "🧩 Play Quiz"]
      }]);
    }
  }, [userProfile, messages.length]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, inputTranscript, outputTranscript, isOpen]);

  const processUserMessage = async (text: string) => {
    if (!text.trim() || isLoading || isConnecting) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text }]);
    setInput('');
    if (isVoiceActive) {
      sendTextMessage(text);
    } else {
      setIsLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: text,
          config: { systemInstruction: dynamicPrompt }
        });
        const parsed = parseCherryResponse(response.text || "");
        setMessages(prev => [...prev, { id: `model-${Date.now()}`, role: 'model', text: parsed.text, suggestions: parsed.suggestions }]);
      } catch (err) {
        setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'model', text: "The kitchen is very busy kha! Please ask again." }]);
      } finally { setIsLoading(false); }
    }
  };

  const handleToggleVoice = () => {
    if (isVoiceActive) {
      stopSession();
    } else {
      const voiceOverride = `${dynamicPrompt}\n\n### 🎤 VOICE MODE RULES: Brevity is key. Under 30 words. Warm & Spoken. Always end with 'kha'.`;
      startSession(voiceOverride);
    }
  };

  const handleSuggestion = (label: string) => {
    const norm = label.toLowerCase();
    if (norm.includes('menu')) onNavigate?.('menu');
    else if (norm.includes('class')) onNavigate?.('classes');
    else if (norm.includes('quiz')) onNavigate?.('quiz');
    processUserMessage(label);
  };

  return (
    <div className="fixed right-6 bottom-6 z-[100] flex flex-col items-end gap-6 pointer-events-none font-sans">
      {isOpen && (
        <div className={cn(
            "pointer-events-auto w-[360px] md:w-[420px] h-[min(650px,80vh)] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl transition-all duration-700 ease-cinematic animate-in fade-in slide-in-from-bottom-12",
            isDarkMode ? "bg-[#0a0b0d]/95" : "bg-white/95"
        )}>
          {/* Header */}
          <div className={cn("h-20 flex items-center justify-between px-6 shrink-0 relative overflow-hidden transition-colors duration-500", isVoiceActive ? "bg-action" : "bg-primary")}>
            <div className="flex items-center gap-4 relative z-10 text-white">
               <div className={cn("size-12 rounded-2xl flex items-center justify-center border transition-all duration-700", isVoiceActive ? "bg-white text-action animate-pulse" : "bg-white/10 border-white/20")}>
                 <span className="material-symbols-outlined text-2xl">{isVoiceActive ? 'graphic_eq' : 'face'}</span>
               </div>
               <div>
                 <h4 className="font-display font-black uppercase text-sm tracking-widest italic">Cherry</h4>
                 <p className="text-[9px] font-accent font-black opacity-60 uppercase tracking-widest">{isConnecting ? 'Connecting...' : isVoiceActive ? 'Live Voice' : 'AI Assistant'}</p>
               </div>
            </div>
            <button onClick={handleToggleVoice} disabled={isConnecting} className={cn("p-3 rounded-xl transition-all duration-500", isVoiceActive ? "bg-white text-action scale-110 shadow-lg" : "bg-white/10 text-white hover:bg-white/20")}>
                <span className="material-symbols-outlined text-lg">{isVoiceActive ? 'mic_off' : 'record_voice_over'}</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={m.id || i} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2", m.role === 'user' ? 'items-end' : 'items-start')}>
                <div className={cn("max-w-[85%] p-4 rounded-[1.5rem] text-[14px] leading-relaxed shadow-sm transition-all", m.role === 'user' ? "bg-primary text-white rounded-tr-none" : (isDarkMode ? "bg-white/5 border border-white/5 text-white/90" : "bg-white border border-black/5 text-gray-800") + " rounded-tl-none")}>
                  {m.text}
                </div>
                {m.role === 'model' && !isVoiceActive && m.suggestions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.suggestions.map((s, idx) => (
                      <button key={idx} onClick={() => handleSuggestion(s)} className="text-[9px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/40 hover:bg-primary hover:text-white transition-all uppercase tracking-widest font-black">{s}</button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {/* Live Transcription Overlay */}
            {isVoiceActive && (
              <div className="mt-auto space-y-4 animate-in fade-in duration-500">
                {inputTranscript && (
                  <div className="flex justify-end opacity-60"><div className="bg-white/10 p-3 rounded-2xl text-xs text-white italic border border-white/10">"{inputTranscript}..."</div></div>
                )}
                {outputTranscript && (
                  <div className="flex justify-start"><div className="bg-action/20 p-4 rounded-2xl text-sm text-white font-medium border border-action/30 shadow-lg">Cherry: {outputTranscript}</div></div>
                )}
              </div>
            )}

            {(isLoading || isConnecting) && (
                <div className="flex gap-1.5 py-2 px-4 rounded-full bg-white/5 w-fit animate-pulse"><div className="size-1.5 bg-primary rounded-full"/><div className="size-1.5 bg-primary rounded-full"/><div className="size-1.5 bg-primary rounded-full"/></div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/5 bg-black/5">
            <div className="relative group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && processUserMessage(input)}
                    placeholder={isVoiceActive ? "Cherry is listening..." : "Ask Cherry anything kha..."}
                    disabled={isLoading || isConnecting || isVoiceActive}
                    className={cn("w-full bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 text-sm py-4 pl-6 pr-14 transition-all", isDarkMode ? "text-white placeholder:text-white/20" : "text-gray-900")}
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

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={cn(
            "pointer-events-auto size-16 md:size-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 ease-cinematic shadow-2xl relative",
            isOpen ? "bg-surface text-primary rotate-90 scale-90" : "bg-primary text-white hover:scale-110 active:scale-95"
        )}
      >
        <span className="material-symbols-outlined text-3xl md:text-4xl">{isOpen ? 'close' : (isVoiceActive ? 'graphic_eq' : 'chat')}</span>
        {isVoiceActive && !isOpen && <div className="absolute inset-0 rounded-[2rem] border-4 border-action animate-ping"/>}
      </button>
    </div>
  );
};

export default ChatBox;
