/* eslint-disable react-refresh/only-export-components -- Provider + hook useCherry convivono per design (context pattern) */
import React, { createContext, useContext, useRef, useCallback, ReactNode } from 'react';
import { useCherryChat } from '../../hooks/useCherryChat';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import type { UserProfile } from '../../services/auth.service';
import type { ChatMessage } from '@thaiakha/shared';
import type { ChatNodeId, ChatOption } from '@thaiakha/shared/data/chatFlowData';

/**
 * CherryProvider (front) — UNICA istanza di stato Cherry, condivisa da tutte le
 * superfici: ChatBox laterale + CherryInlineChat (FAQ). Mirror del pattern già
 * usato nell'admin (packages/admin/src/providers/CherryProvider.tsx).
 *
 * Garantisce il SYNC live e bidirezionale: una sola `messages`, un solo greeting,
 * una sola sessione voce. Le due chat sono finestre sullo stesso stato.
 */
interface CherryContextType {
  // Text chat
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  addVoiceMessages: ReturnType<typeof useCherryChat>['addVoiceMessages'];
  injectInteraction: ReturnType<typeof useCherryChat>['injectInteraction'];
  injectStaticExchange: (userLabel: string, nodeId: ChatNodeId) => Promise<void> | void;
  isLoading: boolean;
  chatError: string | null;
  sessionId: string | null;

  // Inline surface registry — una CherryInlineChat VISIBILE (es. FAQ desktop) si
  // registra qui; la ChatBox flottante NON si auto-apre se una superficie inline
  // è viva (lo scambio è già visibile inline via stato condiviso). Su mobile la
  // inline è nascosta → non si registra → la box si apre come prima.
  registerInlineSurface: () => void;
  unregisterInlineSurface: () => void;
  hasInlineSurface: () => boolean;

  // Voice
  isVoiceActive: boolean;
  isConnecting: boolean;
  voiceError: string | null;
  inputTranscript: string;
  outputTranscript: string;
  analyserRef: ReturnType<typeof useGeminiLive>['analyserRef'];
  startSession: ReturnType<typeof useGeminiLive>['startSession'];
  stopSession: () => void;
  sendTextMessage: (text: string) => void;
}

const CherryContext = createContext<CherryContextType | null>(null);

export const useCherry = (): CherryContextType => {
  const ctx = useContext(CherryContext);
  if (!ctx) throw new Error('useCherry must be used inside <CherryProvider>');
  return ctx;
};

interface CherryProviderProps {
  userProfile?: UserProfile | null;
  children: ReactNode;
}

export const CherryProvider: React.FC<CherryProviderProps> = ({ userProfile, children }) => {
  const {
    messages,
    sendMessage,
    addVoiceMessages,
    injectInteraction,
    injectStaticExchange,
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
  } = useGeminiLive(userProfile ?? undefined, sessionId, addVoiceMessages);

  // Registro superfici inline visibili (ref-counter → nessun re-render).
  const inlineSurfaceCount = useRef(0);
  const registerInlineSurface = useCallback(() => { inlineSurfaceCount.current += 1; }, []);
  const unregisterInlineSurface = useCallback(() => {
    inlineSurfaceCount.current = Math.max(0, inlineSurfaceCount.current - 1);
  }, []);
  const hasInlineSurface = useCallback(() => inlineSurfaceCount.current > 0, []);

  const value: CherryContextType = {
    messages,
    sendMessage,
    addVoiceMessages,
    injectInteraction,
    injectStaticExchange,
    isLoading,
    chatError,
    sessionId,
    registerInlineSurface,
    unregisterInlineSurface,
    hasInlineSurface,
    isVoiceActive,
    isConnecting,
    voiceError,
    inputTranscript,
    outputTranscript,
    analyserRef,
    startSession,
    stopSession,
    sendTextMessage,
  };

  return <CherryContext.Provider value={value}>{children}</CherryContext.Provider>;
};

export type { ChatOption };
export default CherryProvider;
