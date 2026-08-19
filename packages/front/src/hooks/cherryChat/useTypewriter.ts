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

  const stopTypewriter = useCallback((msgId: string) => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
    typeQueueRef.current = [];
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, text: fullResponseRef.current, isStreaming: false } : m)
    );
  }, [setMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, []);

  /** Reset coda + avvio consumer per lo stream reale (il server segnala la fine). */
  const startStreamTypewriter = useCallback((modelMsgId: string) => {
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
    }, CHERRY_CONFIG.TYPEWRITER_INTERVAL_MS);
  }, [updateMessages, stopTypewriter]);

  /** Testo già noto (inject/CHAT_FLOW): coda precaricata, chiusura a coda vuota. */
  const startStaticTypewriter = useCallback((modelMsgId: string, text: string) => {
    // Prepariamo la coda del typewriter
    typeQueueRef.current = [];
    serverDoneRef.current = false;
    fullResponseRef.current = text;

    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

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
  }, [updateMessages, stopTypewriter]);

  return {
    typeQueueRef,
    typeIntervalRef,
    serverDoneRef,
    fullResponseRef,
    stopTypewriter,
    startStreamTypewriter,
    startStaticTypewriter,
  };
}

export type Typewriter = ReturnType<typeof useTypewriter>;
