import { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatMessageProxy, sendChatMessageStream } from '@thaiakha/shared/services';
import { buildCherryPrompt, type CherryUserContext } from '../prompts/cherryPrompt';
import {
  getOrCreateSession,
  loadRecentMessages,
  saveMessage,
  updateSummary,
  checkRateLimit,
  getUserBookingState,
  type ChatSession,
  type UserBookingState,
} from '@thaiakha/shared/services';
import type { ChatMessage } from '@thaiakha/shared';
import { filterOptionsForProfile, filterBlocksForProfile, type ChatNodeId, type ChatOption, type NodeBlock } from '@thaiakha/shared/data/chatFlowData';
import { getChatNode, type ChatLocale } from '@thaiakha/shared/data/chatFlowI18n';
import type { UserProfile } from '../services/auth.service';
import { t, tObj } from '../i18n';
import { cleanCherryResponse } from '@thaiakha/shared/lib/cherry-utils';
import { getContextualFollowups } from '@thaiakha/shared/lib/cherryFollowups';
import { getRecipeContextForCherry } from '@thaiakha/shared/lib/cherryRecipeContext';
import { getCultureContextForCherry } from '@thaiakha/shared/lib/cherryCultureContext';
import { getNewsContextForCherry } from '@thaiakha/shared/lib/cherryNewsContext';
import { getIngredientContextForCherry } from '@thaiakha/shared/lib/cherryIngredientContext';
import { getGamificationContextForCherry } from '@thaiakha/shared/lib/cherryGamificationContext';
import { getBookingContextForCherry } from '@thaiakha/shared/lib/cherryBookingContext';
import { getPickupContextForCherry } from '@thaiakha/shared/lib/cherryPickupContext';
import { getStaticKnowledge } from '@thaiakha/shared/data/cherryKnowledge';
import { getLegalContext } from '@thaiakha/shared/lib/cherryLegalContext';
import { getMenuContextForCherry } from '@thaiakha/shared/lib/cherryMenuContext';
import { getDietContextForCherry } from '@thaiakha/shared/lib/cherryDietContext';
import { detectCoveredTopics, buildCoveredTopicsBlock } from '@thaiakha/shared/lib/cherryCoveredTopics';

const HISTORY_WINDOW = 3;

// Durata della "finta riflessione" (3 puntini) prima che parta la trascrizione,
// nei flussi statici/inject dove il testo è già noto. Dà respiro e tempo
// percepito a Cherry per "pensare". Vedi injectStaticExchange / injectInteraction.
const THINK_DELAY_MS = 800;

/**
 * Saluto proattivo per chi ha una prenotazione. Statico (zero token), caldo,
 * mostrato una sola volta a sessione. Vedi Step 4 / 04_Target_Architecture.
 */
function buildBookingGreeting(fullName: string | undefined, b: UserBookingState): string {
  const first = fullName ? fullName.split(' ')[0] : '';
  const hi = first ? `Sawasdee kha ${first}!` : 'Sawasdee kha!';
  const cls = b.sessionType === 'evening' ? 'evening class' : 'morning class';
  const n = b.daysUntil ?? 0;
  if (b.state === 'imminent') {
    return n <= 0
      ? `${hi} 🍒 Your ${cls} is today! Remember our meeting point — and tell me if there's anything you'd like to prepare kha.`
      : `${hi} 🍒 Your ${cls} is just ${n} day${n === 1 ? '' : 's'} away! Remember our meeting point — anything you'd like to know before then kha?`;
  }
  // future
  return `${hi} 🍒 ${n} day${n === 1 ? '' : 's'} until your ${cls}! Are you training with our quizzes to win prizes? I'm here for anything you need kha.`;
}

export const useCherryChat = (userProfile?: UserProfile | null, locale: ChatLocale = 'en') => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  const sessionRef = useRef<ChatSession | null>(null);
  const initialized = useRef(false);

  // Stato prenotazione (read-only) — recuperato una volta per profilo e riusato
  // nel prompt. Guida la response policy (guest/loggato × booking).
  // Ref per le closure (sendMessage) + state per il saluto proattivo (Step 4).
  const bookingStateRef = useRef<UserBookingState>({ state: 'none' });
  const [bookingState, setBookingState] = useState<UserBookingState>({ state: 'none' });

  // Memoria anti-ripetizione: argomenti già toccati in questa sessione. Iniettati
  // nel prompt come "già coperti" così Cherry non li ripete a ogni risposta.
  const coveredTopicsRef = useRef<Set<string>>(new Set());

  // Memoria ragnatela: id dei nodi CHAT_FLOW già visitati in questa sessione
  // (ricostruita da chat_messages.node_id all'avvio). Serve a non riproporre gli
  // stessi approfondimenti/link a L3. Esposta via hasVisitedNode/markNodeVisited.
  const visitedNodesRef = useRef<Set<string>>(new Set());

  // Guard: il saluto proattivo va mostrato UNA sola volta per sessione.
  const greetedRef = useRef(false);

  useEffect(() => {
    let active = true;
    if (!userProfile?.id) {
      bookingStateRef.current = { state: 'none' };
      setBookingState({ state: 'none' });
      return;
    }
    getUserBookingState(userProfile.id)
      .then(s => { if (active) { bookingStateRef.current = s; setBookingState(s); } })
      .catch(() => { if (active) { bookingStateRef.current = { state: 'none' }; setBookingState({ state: 'none' }); } });
    return () => { active = false; };
  }, [userProfile?.id]);

  // ── Saluto proattivo (Step 4) ────────────────────────────────────────────────
  // Se l'utente ha una prenotazione, personalizziamo il messaggio di apertura.
  // Mostrato UNA volta al giorno (prima sessione della giornata) — non a ogni
  // apertura. Statico → zero token. Solo su apertura "fresca" (esiste il greeting
  // generico); per chi è già a metà conversazione, skip. Stato in localStorage
  // (app-side, NON scritto da Cherry).
  useEffect(() => {
    if (greetedRef.current) return;
    if (bookingState.state === 'none') return;
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem('cherry_greeting_date') === today) {
        greetedRef.current = true; // già salutato oggi → niente saluto
        return;
      }
    } catch { /* localStorage non disponibile → fallback: una volta a sessione */ }
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === 'static:greeting');
      if (idx === -1) return prev; // utente con history → niente saluto invasivo
      greetedRef.current = true;
      try { localStorage.setItem('cherry_greeting_date', today); } catch { /* noop */ }
      const copy = [...prev];
      copy[idx] = { ...copy[idx], text: buildBookingGreeting(userProfile?.full_name, bookingState) };
      messagesRef.current = copy;
      return copy;
    });
    // messages.length nelle deps: cattura il momento in cui init aggiunge il
    // greeting, qualunque sia l'ordine rispetto al fetch del booking.
  }, [bookingState, userProfile?.full_name, messages.length]);

  // ── Typewriter refs ─────────────────────────────────────────────────────────
  const typeQueueRef = useRef<string[]>([]);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const serverDoneRef = useRef(false);
  const fullResponseRef = useRef('');

  const stopTypewriter = useCallback((msgId: string) => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
    typeQueueRef.current = [];
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, text: fullResponseRef.current, isStreaming: false } : m)
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, []);

  // ── Initialization ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const session = await getOrCreateSession(userProfile?.id);
      sessionRef.current = session;
      setSessionId(session.id);

      const history = await loadRecentMessages(session.id, HISTORY_WINDOW * 2);
      // Le righe 'system' (es. marker [visited:…]) non si mostrano: servono solo
      // a ricostruire la memoria, non sono messaggi di conversazione.
      const initialMessages: ChatMessage[] = history
        .filter(m => m.sender_role === 'user' || m.sender_role === 'assistant')
        .map(
          (m): ChatMessage => ({
            id: m.id,
            role: m.sender_role === 'user' ? 'user' : 'model',
            text: m.content,
          })
        );

      // Seed della memoria anti-ripetizione dagli argomenti già discussi.
      for (const m of history) {
        for (const topic of detectCoveredTopics(m.content)) coveredTopicsRef.current.add(topic);
        // Seed della memoria ragnatela: nodi già visitati (da node_id persistito).
        if (m.node_id) visitedNodesRef.current.add(m.node_id);
      }

      if (initialMessages.length === 0) {
        const greeting = userProfile?.full_name
          ? `Sawasdee kha ${(userProfile.full_name).split(' ')[0]}! 🍒 Welcome back to your Akha kitchen. How can I help you today?`
          : "Sawasdee kha! 🍒 I'm Cherry, your Akha cultural guide and chef. Ask me anything about our courses, recipes or Thai culture!";
        initialMessages.push({ id: 'static:greeting', role: 'model', text: greeting });
      }

      setMessages(initialMessages);
    };

    init();
  }, [userProfile?.id]);

  // ── Auto-summary ───────────────────────────────────────────────────────────

  const triggerAutoSummary = useCallback(async (sid: string) => {
    try {
      const recentMessages = await loadRecentMessages(sid, HISTORY_WINDOW * 2);
      const transcript = recentMessages
        .map(m => `${m.sender_role === 'user' ? 'Guest' : 'Cherry'}: ${m.content}`)
        .join('\n');

      const summary = await sendChatMessageProxy({
        message: `Summarize in 2 sentences, focusing on: dietary preferences, booking interests, specific requests:\n${transcript}`,
        systemInstruction: 'You are a concise conversation summarizer. Output plain text only.',
      });

      if (summary) {
        await updateSummary(sid, summary);
        if (sessionRef.current && sessionRef.current.id === sid) {
          sessionRef.current.summary = summary;
        }
      }
    } catch {
      // silent fail
    }
  }, []);

  // ── sendMessage ────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const sid = sessionRef.current?.id ?? null;

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

    // Reset typewriter state for this message
    typeQueueRef.current = [];
    serverDoneRef.current = false;
    fullResponseRef.current = '';
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }

    // Start typewriter consumer — drains word queue at fixed cadence
    typeIntervalRef.current = setInterval(() => {
      if (typeQueueRef.current.length > 0) {
        const token = typeQueueRef.current.shift()!;
        updateMessages(prev =>
          prev.map(m => m.id === modelMsgId ? { ...m, text: m.text + token } : m)
        );
      } else if (serverDoneRef.current) {
        // Queue empty + server stream finished → snap to final text and close
        stopTypewriter(modelMsgId);
      }
      // else: queue empty but server still streaming → wait next tick
    }, t('cherry:typewriterIntervalMs'));

    try {
      const userContext: CherryUserContext = {
        isLogged: !!userProfile,
        role: userProfile?.role,
        name: userProfile?.full_name,
        dietary_profile: userProfile?.dietary_profile ? ((tObj('cherry:dietaryMap') as Record<string, string>)[userProfile.dietary_profile] ?? userProfile.dietary_profile) : undefined,
        allergies: userProfile?.allergies,
        preferred_spiciness: userProfile?.preferred_spiciness_id ? (tObj('cherry:spicinessMap') as Record<string, string>)[String(userProfile.preferred_spiciness_id)] : undefined,
        booking_state: bookingStateRef.current.state,
        days_until_class: bookingStateRef.current.daysUntil,
        session_type: bookingStateRef.current.sessionType ?? undefined,
      };
      const basePrompt = buildCherryPrompt(userContext);

      const recentHistory = await loadRecentMessages(sid || '', HISTORY_WINDOW * 2);
      const historyText = recentHistory
        .slice(-HISTORY_WINDOW)
        .map(m => `${m.sender_role === 'user' ? 'Guest' : 'Cherry'}: ${m.content}`)
        .join('\n');

      const summaryText = sessionRef.current?.summary
        ? `\n### PREVIOUS CONVERSATION SUMMARY:\n${sessionRef.current.summary}`
        : '';

      // RAG ricette: se la domanda cita un piatto, iniettiamo i suoi ingredienti
      // reali dal DB (importanza progressiva + sostituzioni risolte per il profilo)
      // così Cherry non inventa. null se nessuna ricetta è riconosciuta.
      const activeProfileIds = [
        userProfile?.dietary_profile,
        ...(userProfile?.allergies ?? []),
      ].filter((p): p is string => !!p && p !== 'diet_regular');
      // RAG knowledge: i filtri sono INDIPENDENTI → eseguiti in PARALLELO per non
      // sommare la latenza. Ognuno fa fetch (cached) + match e ritorna null se non
      // pertinente. Cultura/news/ricette/gamification non si escludono a vicenda.
      const [recipeBlock, cultureBlock, newsBlock, gamificationBlock, bookingBlock] = await Promise.all([
        getRecipeContextForCherry(userText, activeProfileIds),
        getCultureContextForCherry(userText),
        getNewsContextForCherry(userText),
        getGamificationContextForCherry(userText), // esce subito se nessun intento quiz
        getBookingContextForCherry(userText, { isLogged: !!userProfile, userId: userProfile?.id }), // booking/availability su intento
      ]);
      // Ingrediente: solo se NESSUNA ricetta ha matchato (le domande sul piatto hanno
      // precedenza e già includono gli ingredienti). Dipende da recipeBlock → dopo.
      // Pickup hotel→zona→orario: solo se NESSUNA prenotazione personale ha già
      // risposto (quella contiene il pickup dell'utente). Per guest e lookup generici.
      const pickupResult = bookingBlock ? null : await getPickupContextForCherry(userText);

      const ingredientBlock = recipeBlock ? null : await getIngredientContextForCherry(userText);

      const recipeText = recipeBlock ? `\n${recipeBlock}` : '';
      const cultureText = cultureBlock ? `\n${cultureBlock}` : '';
      const newsText = newsBlock ? `\n${newsBlock}` : '';
      const ingredientText = ingredientBlock ? `\n${ingredientBlock}` : '';
      const gamificationText = gamificationBlock ? `\n${gamificationBlock}` : '';
      const bookingText = bookingBlock ? `\n${bookingBlock}` : '';
      const pickupText = pickupResult ? `\n${pickupResult.text}` : '';
      // Sapere statico (classi, meeting point, business…): in-memory, su intento.
      const staticKnowledge = getStaticKnowledge(userText);
      const staticText = staticKnowledge ? `\n${staticKnowledge}` : '';
      // Clausole legali (RAG locale sui file generati): in-memory, match su domanda.
      // Gli altri temi arrivano dai contesti dedicati, che leggono le fonti dal DB.
      const faqBlock = getLegalContext(userText);
      const faqText = faqBlock ? `\n${faqBlock}` : '';
      // Menu del cliente (per-utente, read-only): solo loggato + intento menu.
      const menuBlock = userProfile ? await getMenuContextForCherry(userText, { isLogged: true, userId: userProfile.id }) : null;
      const menuText = menuBlock ? `\n${menuBlock}` : '';
      // Conoscenza diete/allergie (DB profili + sostituzioni), su intento, read-only.
      // Mira ai profili citati nel testo + quelli attivi dell'utente.
      const dietBlock = await getDietContextForCherry(userText, { activeProfileIds });
      const dietText = dietBlock ? `\n${dietBlock}` : '';

      // Anti-ripetizione: argomenti già coperti in sessione (da prima di questo turno).
      const coveredBlock = buildCoveredTopicsBlock(coveredTopicsRef.current);
      const coveredText = coveredBlock ? `\n${coveredBlock}` : '';

      const systemInstruction =
        basePrompt + summaryText + recipeText + cultureText + newsText + ingredientText + gamificationText + bookingText + pickupText + staticText + faqText + menuText + dietText + coveredText +
        (historyText ? `\n### RECENT CONVERSATION:\n${historyText}` : '');


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

      if (sid && sessionRef.current && sessionRef.current.message_count >= t('cherry:summaryThreshold')) {
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
  }, [userProfile, triggerAutoSummary, stopTypewriter, isLoading, locale]);

  // ── injectInteraction (Zero-Latency UI) ───────────────────────────────────
  const injectInteraction = useCallback(async (
    userText: string,
    assistantText: string,
    options?: ChatOption[],
    blocks?: NodeBlock[]
  ) => {
    if (!userText.trim() || !assistantText.trim()) return;

    // NB: injectInteraction è chiamato SOLO con un presetResponse autorevole dal
    // DB (pulsanti Ask Cherry). Quindi iniettiamo SEMPRE il preset — anche al
    // 2°+ click sullo stesso pulsante. (Rimosso il vecchio shortcut
    // "isRepeatedQuestion → sendMessage" che scartava il preset DB e lo
    // rigenerava con l'AI: bug 1°click=DB / 2°click=AI.)

    const userMsgId = `inject-user-${Date.now()}`;
    const modelMsgId = `inject-model-${Date.now()}`;

    // Opzioni follow-up: se il pulsante passa opzioni esplicite le filtriamo per
    // profilo; ALTRIMENTI generiamo follow-up CONTESTUALI (come sendMessage) così
    // anche gli Ask Cherry preset mostrano le pillole a fine risposta.
    const filteredOptions = (options && options.length > 0)
      ? filterOptionsForProfile(options, userProfile)
      : getContextualFollowups(`${userText}\n${assistantText}`, { count: 4, profile: userProfile, locale });
    const filteredBlocks = filterBlocksForProfile(blocks, userProfile);

    // 1. INIEZIONE UTENTE + bolla Cherry VUOTA (puntini) immediati.
    //    fullText noto → reveal già-formattato, niente salto di formattazione.
    updateMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: userText },
      {
        id: modelMsgId,
        role: 'model',
        text: '',
        isStreaming: true,
        fullText: assistantText,
        options: filteredOptions.length ? filteredOptions : undefined,
        blocks: filteredBlocks.length ? filteredBlocks : undefined,
      },
    ]);

    // 2. SIMULAZIONE PENSIERO (puntini THINK_DELAY_MS) + START TYPEWRITER
    setTimeout(async () => {
      // Prepariamo la coda del typewriter
      typeQueueRef.current = [];
      serverDoneRef.current = false;
      fullResponseRef.current = assistantText;

      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

      const tokens = assistantText.match(/\S+[ \t]*|\n+/g) ?? [assistantText];
      typeQueueRef.current.push(...tokens);

      typeIntervalRef.current = setInterval(() => {
        if (typeQueueRef.current.length > 0) {
          const token = typeQueueRef.current.shift()!;
          updateMessages(prev =>
            prev.map(m => m.id === modelMsgId ? { ...m, text: m.text + token } : m)
          );
        } else {
          serverDoneRef.current = true;
          stopTypewriter(modelMsgId);
        }
      }, t('cherry:typewriterIntervalMs'));
    }, THINK_DELAY_MS);

    // 3. BACKGROUND SYNC
    try {
      let sid = sessionRef.current?.id;
      if (!sid) {
        const session = await getOrCreateSession(userProfile?.id);
        sessionRef.current = session;
        setSessionId(session.id);
        sid = session.id;
      }
      if (sid) {
        await Promise.all([
          saveMessage(sid, 'user', userText, 'text'),
          saveMessage(sid, 'assistant', assistantText, 'text')
        ]);
      }
    } catch (err) {
      console.error('[useCherryChat] injectInteraction sync error:', err);
    }
  }, [userProfile?.id, stopTypewriter]);

  // ── injectStaticExchange (CHAT_FLOW navigation — typewriter simulated) ────
  const injectStaticExchange = useCallback(async (userLabel: string, nodeId: ChatNodeId) => {
    const node = getChatNode(nodeId, locale);
    if (!node) return;

    // Memoria ragnatela: segna il nodo come visitato (skip futuri approfondimenti ripetuti).
    visitedNodesRef.current.add(nodeId);

    const userMsgId = `static-user-${Date.now()}`;
    const modelMsgId = `static-model-${Date.now()}`;

    // Filtra le opzioni in base al profilo (dieta/allergie). Profilo non
    // selezionato o diet_regular → nessun filtro (mostra tutto).
    const filteredOptions = filterOptionsForProfile(node.options, userProfile);
    // Blocchi ricchi (linkCard/gallery) filtrati per profilo (dieta/allergie).
    const filteredBlocks = filterBlocksForProfile(node.blocks, userProfile);

    // 1. Messaggio utente + bolla Cherry VUOTA (puntini) immediati.
    //    fullText è già noto → il formatter calcolerà la struttura HTML finale
    //    dal primo carattere e la rivelerà progressivamente (niente salto).
    updateMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: userLabel },
      {
        id: modelMsgId,
        role: 'model',
        text: '',
        isStreaming: true,
        fullText: node.message,
        options: filteredOptions.length ? filteredOptions : undefined,
        blocks: filteredBlocks.length ? filteredBlocks : undefined,
        nodeLevel: node.level,
      },
    ]);

    // 2. Dopo la finta riflessione (puntini visibili THINK_DELAY_MS) → typewriter
    setTimeout(() => {
      typeQueueRef.current = [];
      serverDoneRef.current = false;
      fullResponseRef.current = node.message;

      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

      const tokens = node.message.match(/\S+[ \t]*|\n+/g) ?? [node.message];
      typeQueueRef.current.push(...tokens);

      typeIntervalRef.current = setInterval(() => {
        if (typeQueueRef.current.length > 0) {
          const token = typeQueueRef.current.shift()!;
          updateMessages(prev =>
            prev.map(m => m.id === modelMsgId ? { ...m, text: m.text + token } : m)
          );
        } else {
          serverDoneRef.current = true;
          stopTypewriter(modelMsgId);
        }
      }, t('cherry:typewriterIntervalMs'));
    }, THINK_DELAY_MS);

    // 3. BACKGROUND SYNC (to database for session persistence)
    try {
      let sid = sessionRef.current?.id;
      if (!sid) {
        const session = await getOrCreateSession(userProfile?.id);
        sessionRef.current = session;
        setSessionId(session.id);
        sid = session.id;
      }
      if (sid) {
        await Promise.all([
          saveMessage(sid, 'user', userLabel, 'text', { nodeId }),
          saveMessage(sid, 'assistant', node.message, 'text', { nodeId })
        ]);
      }
    } catch (err) {
      console.error('[useCherryChat] injectStaticExchange sync error:', err);
    }
  }, [updateMessages, stopTypewriter, userProfile?.id, userProfile, locale]);

  const addVoiceMessages = useCallback(async (
    userText: string,
    assistantText: string
  ) => {
    if (!userText.trim() || !assistantText.trim()) return;

    const userMsgId = `voice-user-${Date.now()}`;
    const modelMsgId = `voice-model-${Date.now()}`;

    updateMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: userText, type: 'voice' as any },
      { id: modelMsgId, role: 'model', text: assistantText, type: 'voice' as any }
    ]);

    const sid = sessionRef.current?.id;
    if (sid) {
      await Promise.all([
        saveMessage(sid, 'user', userText, 'voice'),
        saveMessage(sid, 'assistant', assistantText, 'voice')
      ]);
    }
  }, []);
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
  }, []);

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
  };
};
