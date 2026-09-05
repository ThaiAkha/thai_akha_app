import { useState, useRef, useCallback } from 'react';
import { CHERRY_CONFIG } from '../config/cherry';
import { sendChatMessageStream } from '@thaiakha/shared/services';
import { saveMessage, checkRateLimit } from '@thaiakha/shared/services';
import type { ChatMessage } from '@thaiakha/shared';
import type { ChatOption } from '@thaiakha/shared/data/chatFlowData';
import type { ChatLocale } from '@thaiakha/shared/data/chatFlowI18n';
import type { UserProfile } from '../services/auth.service';
import { cleanCherryResponse } from '@thaiakha/shared/lib/cherry-utils';
import { getContextualFollowups } from '@thaiakha/shared/lib/cherryFollowups';
import { detectCoveredTopics } from '@thaiakha/shared/lib/cherryCoveredTopics';
import { useBookingGreeting } from './cherryChat/useBookingGreeting';
import { useChatSession } from './cherryChat/useChatSession';
import { useTypewriter } from './cherryChat/useTypewriter';
import { useCherryInjection } from './cherryChat/useCherryInjection';
import { buildSystemInstruction } from './cherryChat/buildSystemInstruction';

export const useCherryChat = (userProfile?: UserProfile | null, locale: ChatLocale = 'en') => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manteniamo un riferimento sempre aggiornato per evitare closure stale nelle funzioni memoizzate
  const messagesRef = useRef<ChatMessage[]>([]);

  // Wrapper per setMessages che aggiorna anche il ref
  const updateMessages = useCallback((updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setMessages(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      messagesRef.current = next;
      return next;
    });
  }, []);

  // Memoria anti-ripetizione: argomenti già toccati in questa sessione. Iniettati
  // nel prompt come "già coperti" così Cherry non li ripete a ogni risposta.
  const coveredTopicsRef = useRef<Set<string>>(new Set());

  // Memoria ragnatela: id dei nodi CHAT_FLOW già visitati in questa sessione
  // (ricostruita da chat_messages.node_id all'avvio). Serve a non riproporre gli
  // stessi approfondimenti/link a L3. Esposta via hasVisitedNode/markNodeVisited.
  const visitedNodesRef = useRef<Set<string>>(new Set());

  const bookingStateRef = useBookingGreeting({
    userProfile,
    messagesLength: messages.length,
    setMessages,
    messagesRef,
  });

  const { sessionId, sessionRef, triggerAutoSummary, ensureSessionId, initSession } = useChatSession({
    userProfile,
    setMessages,
    coveredTopicsRef,
    visitedNodesRef,
  });

  const {
    typeQueueRef,
    typeIntervalRef,
    serverDoneRef,
    fullResponseRef,
    startStreamTypewriter,
    startStaticTypewriter,
  } = useTypewriter(updateMessages, setMessages);

  // ── sendMessage ────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    // La sessione ora si apre alla prima richiesta vera (non piu' al mount della
    // shell): qui la si garantisce, cosi' rate limit e salvataggio hanno sempre
    // un id, anche se l'utente scrive prima che lo slot di inattivita' scatti.
    const sid = await ensureSessionId();

    if (sid) {
      const rateLimit = await checkRateLimit(userProfile?.id, sessionRef.current?.session_token ?? undefined);
      if (!rateLimit.allowed) {
        setError(rateLimit.reason ?? 'Limit reached.');
        return;
      }
    }

    const userMsgId = `user-${Date.now()}`;
    const modelMsgId = `model-${Date.now()}`;

    updateMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: userText },
      { id: modelMsgId, role: 'model', text: '', isStreaming: true },
    ]);
    setIsLoading(true);
    setError(null);

    if (sid) saveMessage(sid, 'user', userText, 'text');

    startStreamTypewriter(modelMsgId);

    try {
      const { systemInstruction, pickupResult } = await buildSystemInstruction({
        userText,
        sid,
        userProfile,
        bookingState: bookingStateRef.current,
        summary: sessionRef.current?.summary,
        coveredTopics: coveredTopicsRef.current,
      });

      // Stream from server — push word tokens into the typewriter queue
      const rawResponse = await sendChatMessageStream(
        { message: userText, systemInstruction },
        (chunk) => {
          const cleanChunk = cleanCherryResponse(chunk);
          fullResponseRef.current += cleanChunk;
          // Split into word tokens + newline tokens (preserving structure for CherryFormatter)
          const tokens = cleanChunk.match(/\S+[ \t]*|\n+/g) ?? [cleanChunk];
          typeQueueRef.current.push(...tokens);
        }
      );

      // Signal server is done — typewriter will finalize when queue empties
      const response = cleanCherryResponse(rawResponse);
      fullResponseRef.current = response;
      serverDoneRef.current = true;

      // Aggiorna la memoria anti-ripetizione con gli argomenti toccati in questo turno.
      for (const topic of detectCoveredTopics(`${userText}\n${response}`)) {
        coveredTopicsRef.current.add(topic);
      }

      // Nodi follow-up CONTESTUALI: scelti dal contenuto di domanda+risposta,
      // filtrati per profilo. Compaiono a fine stream (ChatBox mostra le opzioni
      // solo quando !isStreaming). Click → flusso nodi curato.
      const followups = getContextualFollowups(`${userText}\n${response}`, {
        count: 4,
        profile: userProfile,
        locale,
      });
      // Se il pickup ha risolto un hotel, anteponi il pulsante mappa dinamico.
      const pickupButton: ChatOption[] = pickupResult?.hotelName
        ? [{
            label: `📍 See ${pickupResult.hotelName} on the map`,
            nextId: 'PICKUP_MAP',
            action: 'nav_pickup_hotel',
            data: { hotel: pickupResult.hotelName },
            priority: 1,
          }]
        : [];
      const finalOptions = [...pickupButton, ...followups].slice(0, 4);
      if (finalOptions.length > 0) {
        updateMessages(prev =>
          prev.map(m => m.id === modelMsgId ? { ...m, options: finalOptions } : m)
        );
      }

      if (sid) saveMessage(sid, 'assistant', response, 'text');

      if (sid && sessionRef.current && sessionRef.current.message_count >= CHERRY_CONFIG.SUMMARY_THRESHOLD) {
        sessionRef.current.message_count = 0;
        triggerAutoSummary(sid);
      }
    } catch (err) {
      console.error('[useCherryChat] sendMessage error:', err);
      if (typeIntervalRef.current) {
        clearInterval(typeIntervalRef.current);
        typeIntervalRef.current = null;
      }
      setError('The kitchen is very busy kha! Please try again.');
      updateMessages(prev => prev.filter(m => m.id !== modelMsgId));
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, triggerAutoSummary, isLoading, locale, updateMessages, startStreamTypewriter, sessionRef, ensureSessionId, bookingStateRef, fullResponseRef, serverDoneRef, typeIntervalRef, typeQueueRef]);

  const { injectInteraction, injectStaticExchange, addVoiceMessages } = useCherryInjection({
    updateMessages,
    userProfile,
    locale,
    sessionRef,
    ensureSessionId,
    startStaticTypewriter,
    visitedNodesRef,
  });

  // ── Memoria ragnatela (visite nodi/link) ──────────────────────────────────
  /** true se il nodo è già stato visitato in questa sessione (anti-ripetizione L3). */
  const hasVisitedNode = useCallback((id: string) => visitedNodesRef.current.has(id), []);
  /**
   * Segna manualmente come visitato un nodo o un link/asset cliccato che NON
   * inietta un nodo (es. link-card → pagina, gallery → modal). Persiste in
   * chat_messages come riga 'system' leggera con metadata, così sopravvive al reload.
   */
  const markNodeVisited = useCallback((id: string, metadata?: Record<string, unknown>) => {
    visitedNodesRef.current.add(id);
    const sid = sessionRef.current?.id;
    if (sid) saveMessage(sid, 'system', `[visited:${id}]`, 'text', { nodeId: id, metadata: metadata ?? null });
  }, [sessionRef]);

  return {
    messages,
    sendMessage,
    addVoiceMessages,
    injectInteraction,
    injectStaticExchange,
    hasVisitedNode,
    markNodeVisited,
    isLoading,
    error,
    sessionId,
    /** Apre sessione e storico: la chiama chi mostra davvero la chat. */
    ensureChatReady: initSession,
  };
};
