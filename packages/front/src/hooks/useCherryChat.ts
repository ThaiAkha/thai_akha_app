import { useState, useRef, useCallback } from 'react';
import { CHERRY_CONFIG } from '../config/cherry';
import { sendChatMessageStream } from '@thaiakha/shared/services';
import { saveMessage } from '@thaiakha/shared/services';
import type { ChatMessage } from '@thaiakha/shared';
import type { ChatOption } from '@thaiakha/shared/data/chatFlowData';
import type { ChatLocale } from '@thaiakha/shared/data/chatFlowI18n';
import type { UserProfile } from '../services/auth.service';
import { cleanCherryResponse } from '@thaiakha/shared/lib/cherry-utils';
import { getContextualFollowups } from '@thaiakha/shared/lib/cherryFollowups';
import { detectCoveredTopics } from '@thaiakha/shared/lib/cherryCoveredTopics';
import { buildGeminiHistory } from '@thaiakha/shared/lib/cherryHistory';
import { useBookingGreeting } from './cherryChat/useBookingGreeting';
import { useChatSession } from './cherryChat/useChatSession';
import { useTypewriter } from './cherryChat/useTypewriter';
import { useCherryInjection } from './cherryChat/useCherryInjection';
import { buildSystemInstruction } from './cherryChat/buildSystemInstruction';

/**
 * @param locale lingua dei nodi della ragnatela (en | th)
 * @param lang   lingua dell'interfaccia: i contesti DB di Cherry escono in quella lingua
 */
export const useCherryChat = (userProfile?: UserProfile | null, locale: ChatLocale = 'en', lang = 'en') => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manteniamo un riferimento sempre aggiornato per evitare closure stale nelle funzioni memoizzate
  const messagesRef = useRef<ChatMessage[]>([]);

  // Setter UNICO dei messaggi: calcola il prossimo stato dal ref, in modo
  // sincrono, e lo passa a React gia' pronto. Cosi' il ref e' esatto in ogni
  // istante (storico per il modello, chiusura del typewriter) senza dipendere
  // da quando React esegue gli updater. Vale finche' NESSUNO chiama il setState
  // grezzo: typewriter, sessione, saluto e inject passano tutti di qui. Prima
  // il ref si aggiornava dentro l'updater e restava indietro di un turno
  // (verifica avversaria del 2026-09-06).
  const updateMessages = useCallback((updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    const next = typeof updater === 'function' ? updater(messagesRef.current) : updater;
    messagesRef.current = next;
    setMessages(next);
  }, []);

  // Memoria anti-ripetizione: argomenti già toccati in questa sessione. Iniettati
  // nel prompt come "già coperti" così Cherry non li ripete a ogni risposta.
  const coveredTopicsRef = useRef<Set<string>>(new Set());

  // Memoria ragnatela: id dei nodi CHAT_FLOW già visitati in questa sessione
  // (ricostruita da chat_messages.node_id all'avvio). Serve a non riproporre gli
  // stessi approfondimenti/link a L3. Esposta via hasVisitedNode/markNodeVisited.
  const visitedNodesRef = useRef<Set<string>>(new Set());

  // Un solo setter per tutti: ogni scrittura passa dal ref (vedi sopra).
  const bookingStateRef = useBookingGreeting({
    userProfile,
    messagesLength: messages.length,
    setMessages: updateMessages,
    messagesRef,
  });

  const { sessionId, sessionRef, triggerAutoSummary, ensureSessionId, initSession } = useChatSession({
    userProfile,
    setMessages: updateMessages,
    coveredTopicsRef,
    visitedNodesRef,
  });

  const {
    typeQueueRef,
    serverDoneRef,
    fullResponseRef,
    startStreamTypewriter,
    startStaticTypewriter,
    stopTypewriter,
    finalizeActive,
    isActive,
  } = useTypewriter(updateMessages, updateMessages);

  // ── sendMessage ────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    // Se Cherry sta ancora battendo la risposta precedente (l'input si riabilita
    // a fine stream, non a fine trascrizione), la si chiude: il testo completo e'
    // gia' noto e deve entrare nello storico, e la bolla non resta "in streaming".
    finalizeActive();
    // Chat ancora vuota = bootstrap (sessione + storico dal DB) non concluso: lo
    // si aspetta dentro il try, a bolle gia' mostrate, cosi' il primo messaggio
    // di chi torna parte con il suo storico. Idempotente, costa solo l'attesa.
    const bootstrapped = messagesRef.current.length > 0;

    const userMsgId = `user-${Date.now()}`;
    const modelMsgId = `model-${Date.now()}`;

    // Le bolle compaiono SUBITO. Prima aspettavano sessione e rate limit, due giri
    // di rete durante i quali l'ospite fissava un campo vuoto senza sapere se il
    // click fosse passato. Il limite lo applica la edge, l'unico posto in cui
    // conta: la RPC client `check_chat_rate_limit` rispondeva sempre "limits
    // disabled" e costava un giro a ogni messaggio.
    updateMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: userText },
      { id: modelMsgId, role: 'model', text: '', isStreaming: true },
    ]);
    setIsLoading(true);
    setError(null);
    startStreamTypewriter(modelMsgId);

    try {
      if (!bootstrapped) await initSession();
      // Storico per il modello: le due bolle appena aggiunte cadono da sole (la
      // bolla vuota in streaming si scarta, l'utente in coda si toglie), e il
      // messaggio corrente lo aggiunge la edge come ultimo turno.
      const history = buildGeminiHistory(messagesRef.current);

      // Sessione e prompt non dipendono l'uno dall'altra: partono insieme. Il
      // riassunto delle sessioni passate vive nella sessione: se non e' ancora
      // aperta (messaggio scritto prima del bootstrap) la si aspetta prima.
      const sidPromise = ensureSessionId();
      if (!sessionRef.current) await sidPromise;
      const [sid, { systemInstruction, pickupResult }] = await Promise.all([
        sidPromise,
        buildSystemInstruction({
          userText,
          lang,
          userProfile,
          bookingState: bookingStateRef.current,
          summary: sessionRef.current?.summary,
          coveredTopics: coveredTopicsRef.current,
        }),
      ]);
      if (sid) saveMessage(sid, 'user', userText, 'text');

      // Stream from server — push word tokens into the typewriter queue
      const rawResponse = await sendChatMessageStream(
        { message: userText, systemInstruction, history, lang },
        (chunk) => {
          // La coda e il testo pieno appartengono al typewriter ATTIVO: se nel
          // frattempo un nodo cliccato ha preso il turno (le pillole restano
          // cliccabili durante lo stream), i pezzi non finiscono nella sua bolla.
          if (!isActive(modelMsgId)) return;
          const cleanChunk = cleanCherryResponse(chunk);
          fullResponseRef.current += cleanChunk;
          // Split into word tokens + newline tokens (preserving structure for CherryFormatter)
          const tokens = cleanChunk.match(/\S+[ \t]*|\n+/g) ?? [cleanChunk];
          typeQueueRef.current.push(...tokens);
        }
      );

      // Signal server is done — typewriter will finalize when queue empties.
      // Se la bolla e' stata presa in consegna da un nodo, i ref sono del nodo:
      // il testo definitivo va scritto direttamente (vedi finalOptions sotto).
      const response = cleanCherryResponse(rawResponse);
      const takenOver = !isActive(modelMsgId);
      if (!takenOver) {
        fullResponseRef.current = response;
        serverDoneRef.current = true;
      }

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
      if (finalOptions.length > 0 || takenOver) {
        updateMessages(prev =>
          prev.map(m => m.id === modelMsgId
            ? {
                ...m,
                // Presa in consegna: chiusa da finalizeActive col testo parziale
                // di allora, qui riceve la risposta intera, la stessa salvata nel DB.
                ...(takenOver && { text: response, isStreaming: false }),
                ...(finalOptions.length > 0 && { options: finalOptions }),
              }
            : m)
        );
      }

      if (sid) saveMessage(sid, 'assistant', response, 'text');

      if (sid && sessionRef.current && sessionRef.current.message_count >= CHERRY_CONFIG.SUMMARY_THRESHOLD) {
        sessionRef.current.message_count = 0;
        triggerAutoSummary(sid);
      }
    } catch (err) {
      console.error('[useCherryChat] sendMessage error:', err);
      // Si ferma solo il PROPRIO typewriter: se un nodo ha preso il turno, il
      // suo intervallo continua (prima si cancellava l'intervallo di chiunque).
      if (isActive(modelMsgId)) stopTypewriter(modelMsgId);
      setError('The kitchen is very busy kha! Please try again.');
      updateMessages(prev => prev.filter(m => m.id !== modelMsgId));
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, triggerAutoSummary, isLoading, locale, lang, updateMessages, startStreamTypewriter, stopTypewriter, finalizeActive, isActive, initSession, sessionRef, ensureSessionId, bookingStateRef, fullResponseRef, serverDoneRef, typeQueueRef]);

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
