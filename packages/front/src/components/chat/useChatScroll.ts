import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@thaiakha/shared';

/**
 * useChatScroll — logica di scorrimento condivisa tra ChatBox (laterale) e
 * CherryInlineChat (FAQ). Estratta 1:1 dal comportamento originale della ChatBox.
 *
 * Gestisce:
 *  • monitoraggio scroll manuale → flag isScrolledUp + auto-scroll on/off
 *  • auto-scroll a fondo sui nuovi messaggi (solo quando NON in streaming)
 *  • allineamento morbido in alto quando l'utente invia una nuova domanda
 *
 * `active` = la superficie è visibile/interattiva (lateral: isOpen, inline: true).
 * `idPrefix` = prefisso degli id messaggio per evitare collisioni quando due
 * superfici (laterale + inline) montano gli stessi messaggi; il lookup è scoped
 * al proprio container, così ognuna allinea il proprio elemento.
 */
export const useChatScroll = (messages: ChatMessage[], active: boolean, idPrefix = 'chat-msg-') => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // ── Monitor manual scrolling ──────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
        shouldAutoScrollRef.current = isAtBottom;
        setIsScrolledUp(!isAtBottom);
      }
    };

    const container = scrollContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Ancoraggio iniziale in basso UNA volta (mostra ultimi messaggi/greeting) ──
  // NESSUN auto-scroll continuo: a fine trascrizione la chat NON scrolla → si ferma
  // dove è (posizione fissa). L'unico scroll per-turno è l'align-to-top del nuovo
  // messaggio utente. Scroll INTERNO (page-safe).
  const didInitScrollRef = useRef(false);
  useEffect(() => {
    if (didInitScrollRef.current || messages.length === 0 || !active) return;
    didInitScrollRef.current = true;
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, active]);

  // ── New user question → align smoothly to the top ─────────────────────────
  const prevLastUserMsgIdRef = useRef<string | null>(null);
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMsg = userMessages[userMessages.length - 1];

    if (lastUserMsg && lastUserMsg.id !== prevLastUserMsgIdRef.current) {
      prevLastUserMsgIdRef.current = lastUserMsg.id;
      shouldAutoScrollRef.current = false;

      setTimeout(() => {
        const targetId = `${idPrefix}${lastUserMsg.id}`;
        const container = scrollContainerRef.current;
        // Lookup scoped al container (non document.getElementById) → robusto anche
        // con più superfici montate contemporaneamente.
        const element = container?.querySelector<HTMLElement>(`[id="${targetId}"]`);
        if (element && container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top - containerRect.top + container.scrollTop;

          container.scrollTo({
            top: absoluteElementTop - 8,
            behavior: 'smooth',
          });
        }
      }, 100); // Small timeout to ensure DOM update
    }
  }, [messages]);

  const scrollToBottom = () => {
    // Container-scoped: non muove la pagina (vedi nota sull'auto-scroll sopra).
    const el = scrollContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    shouldAutoScrollRef.current = true;
    setIsScrolledUp(false);
  };

  return { scrollContainerRef, messagesEndRef, shouldAutoScrollRef, isScrolledUp, scrollToBottom };
};
