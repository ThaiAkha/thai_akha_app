// packages/admin/src/providers/CherryProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useCherryChat } from '../hooks/useCherryChat';
import { useGeminiLive, SessionStatus } from '../hooks/useGeminiLive';
import { useAuth } from '../context/AuthContext';
import type { ChatMessage } from '@thaiakha/shared';

interface CherryContextType {
  // Text chat
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  chatError: string | null;
  sessionId: string | null;

  // Voice
  isVoiceActive: boolean;
  isConnecting: boolean;
  voiceStatus: SessionStatus;
  voiceError: string | null;
  inputTranscript: string;
  outputTranscript: string;
  startSession: (overrideInstruction?: string, initialPrompt?: string) => Promise<void>;
  stopSession: () => void;
  sendTextMessage: (text: string) => void;
}

const CherryContext = createContext<CherryContextType | null>(null);

export const useCherryContext = (): CherryContextType => {
  const ctx = useContext(CherryContext);
  if (!ctx) throw new Error('useCherryContext must be used inside CherryProvider');
  return ctx;
};

interface CherryProviderProps {
  children: ReactNode;
}

export const CherryProvider: React.FC<CherryProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const {
    messages,
    sendMessage,
    isLoading,
    error: chatError,
    sessionId,
  } = useCherryChat(user);

  const {
    isActive: isVoiceActive,
    isConnecting,
    status: voiceStatus,
    error: voiceError,
    inputTranscript,
    outputTranscript,
    startSession,
    stopSession,
    sendTextMessage,
  } = useGeminiLive(user, 'admin', sessionId);

  return (
    <CherryContext.Provider
      value={{
        messages,
        sendMessage,
        isLoading,
        chatError,
        sessionId,
        isVoiceActive,
        isConnecting,
        voiceStatus,
        voiceError,
        inputTranscript,
        outputTranscript,
        startSession,
        stopSession,
        sendTextMessage,
      }}
    >
      {children}
    </CherryContext.Provider>
  );
};
