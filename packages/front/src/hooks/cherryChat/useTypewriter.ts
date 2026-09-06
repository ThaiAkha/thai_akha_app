import { useEffect, useRef, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { CHERRY_CONFIG } from '../../config/cherry';
import type { ChatMessage } from '@thaiakha/shared';
import type { UpdateMessages } from './constants';

/**
 * Typewriter condiviso da sendMessage (stream reale) e dai flussi inject/statici.
 * I ref restano UNICI e condivisi come nell'originale: un solo intervallo attivo
 * alla volta, chiunque lo avvii.
 */
/**
 * NOTA (review #16): il return espone anche i 4 ref grezzi perche' `sendMessage` alimenta la coda
 * dall'esterno durante lo stream. Non azzerare mai `typeIntervalRef` senza `clearInterval`
 * (intervallo orfano). Da restringere quando #86 tocchera' lo streaming.
 */
export function useTypewriter(
  updateMessages: UpdateMessages,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>
) {
  // ── Typewriter refs ─────────────────────────────────────────────────────────
  const typeQueueRef = useRef<string[]>([]);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const serverDoneRef = useRef(false);
  const fullResponseRef = useRef('');
  /** Id della bolla che il typewriter sta rivelando, null quando ha finito. */
  const activeIdRef = useRef<string | null>(null);

  const stopTypewriter = useCallback((msgId: string) => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
    typeQueueRef.current = [];
    if (activeIdRef.current === msgId) activeIdRef.current = null;
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, text: fullResponseRef.current, isStreaming: false } : m)
    );
  }, [setMessages]);

  /**
   * Chiude la bolla ancora in trascrizione, se c'e': testo completo, niente piu'
   * streaming. La chiama chi apre un turno nuovo (messaggio scritto o nodo
   * iniettato) mentre Cherry sta ancora "battendo". Prima il turno nuovo
   * cancellava solo l'intervallo: la bolla interrotta restava in streaming per
   * sempre, senza opzioni e fuori dallo storico per il modello.
   */
  const finalizeActive = useCallback(() => {
    if (activeIdRef.current) stopTypewriter(activeIdRef.current);
  }, [stopTypewriter]);

  /** true se il typewriter sta ancora rivelando QUESTA bolla (nessun turno l'ha presa in consegna). */
  const isActive = useCallback((msgId: string) => activeIdRef.current === msgId, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, []);

  /** Reset coda + avvio consumer per lo stream reale (il server segnala la fine). */
  const startStreamTypewriter = useCallback((modelMsgId: string) => {
    // Prima si chiude la trascrizione precedente (usa ancora il suo testo
    // completo), poi si azzera lo stato per questo messaggio.
    finalizeActive();
    typeQueueRef.current = [];
    serverDoneRef.current = false;
    fullResponseRef.current = '';
    activeIdRef.current = modelMsgId;

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
    }, CHERRY_CONFIG.TYPEWRITER_INTERVAL_MS);
  }, [updateMessages, stopTypewriter, finalizeActive]);

  /** Testo già noto (inject/CHAT_FLOW): coda precaricata, chiusura a coda vuota. */
  const startStaticTypewriter = useCallback((modelMsgId: string, text: string) => {
    // Come sopra: chiusura della precedente, poi coda precaricata.
    finalizeActive();
    typeQueueRef.current = [];
    serverDoneRef.current = false;
    fullResponseRef.current = text;
    activeIdRef.current = modelMsgId;

    const tokens = text.match(/\S+[ \t]*|\n+/g) ?? [text];
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
    }, CHERRY_CONFIG.TYPEWRITER_INTERVAL_MS);
  }, [updateMessages, stopTypewriter, finalizeActive]);

  return {
    typeQueueRef,
    typeIntervalRef,
    serverDoneRef,
    fullResponseRef,
    stopTypewriter,
    finalizeActive,
    isActive,
    startStreamTypewriter,
    startStaticTypewriter,
  };
}

export type Typewriter = ReturnType<typeof useTypewriter>;
