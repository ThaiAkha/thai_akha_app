import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { saveMessage, type ChatSession } from '@thaiakha/shared/services';
import { filterOptionsForProfile, filterBlocksForProfile, type ChatNodeId, type ChatOption, type NodeBlock } from '@thaiakha/shared/data/chatFlowData';
import { getChatNode, type ChatLocale } from '@thaiakha/shared/data/chatFlowI18n';
import { getContextualFollowups } from '@thaiakha/shared/lib/cherryFollowups';
import type { UserProfile } from '../../services/auth.service';
import { THINK_DELAY_MS, type UpdateMessages } from './constants';
import type { Typewriter } from './useTypewriter';

interface InjectionParams {
  updateMessages: UpdateMessages;
  userProfile?: UserProfile | null;
  locale: ChatLocale;
  sessionRef: MutableRefObject<ChatSession | null>;
  ensureSessionId: () => Promise<string>;
  startStaticTypewriter: Typewriter['startStaticTypewriter'];
  visitedNodesRef: MutableRefObject<Set<string>>;
}

/**
 * Flussi che NON passano dall'AI: preset Ask Cherry (injectInteraction), nodi
 * CHAT_FLOW (injectStaticExchange) e trascrizioni vocali (addVoiceMessages).
 * Estratti 1:1 da useCherryChat.
 */
export function useCherryInjection({
  updateMessages,
  userProfile,
  locale,
  sessionRef,
  ensureSessionId,
  startStaticTypewriter,
  visitedNodesRef,
}: InjectionParams) {
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
    setTimeout(() => {
      startStaticTypewriter(modelMsgId, assistantText);
    }, THINK_DELAY_MS);

    // 3. BACKGROUND SYNC
    try {
      const sid = await ensureSessionId();
      if (sid) {
        await Promise.all([
          saveMessage(sid, 'user', userText, 'text'),
          saveMessage(sid, 'assistant', assistantText, 'text')
        ]);
      }
    } catch (err) {
      console.error('[useCherryChat] injectInteraction sync error:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on userProfile.id on purpose (object identity churns); updateMessages is a stable setter
  }, [userProfile?.id, startStaticTypewriter, ensureSessionId]);

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
      startStaticTypewriter(modelMsgId, node.message);
    }, THINK_DELAY_MS);

    // 3. BACKGROUND SYNC (to database for session persistence)
    try {
      const sid = await ensureSessionId();
      if (sid) {
        await Promise.all([
          saveMessage(sid, 'user', userLabel, 'text', { nodeId }),
          saveMessage(sid, 'assistant', node.message, 'text', { nodeId })
        ]);
      }
    } catch (err) {
      console.error('[useCherryChat] injectStaticExchange sync error:', err);
    }
  }, [updateMessages, startStaticTypewriter, ensureSessionId, userProfile, locale, visitedNodesRef]);

  const addVoiceMessages = useCallback(async (
    userText: string,
    assistantText: string
  ) => {
    if (!userText.trim() || !assistantText.trim()) return;

    const userMsgId = `voice-user-${Date.now()}`;
    const modelMsgId = `voice-model-${Date.now()}`;

    updateMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: userText, type: 'voice' },
      { id: modelMsgId, role: 'model', text: assistantText, type: 'voice' }
    ]);

    const sid = sessionRef.current?.id;
    if (sid) {
      await Promise.all([
        saveMessage(sid, 'user', userText, 'voice'),
        saveMessage(sid, 'assistant', assistantText, 'voice')
      ]);
    }
  }, [updateMessages, sessionRef]);

  return { injectInteraction, injectStaticExchange, addVoiceMessages };
}
