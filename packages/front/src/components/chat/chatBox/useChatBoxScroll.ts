import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@thaiakha/shared';

/**
 * Scorrimento della ChatBox laterale: ancoraggio all'apertura, monitor dello
 * scroll manuale e allineamento in alto della nuova domanda. Estratto 1:1.
 */
export function useChatBoxScroll(isOpen: boolean, messages: ChatMessage[]) {
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

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

  // ── Ancoraggio in basso all'APERTURA (mostra ultimi messaggi) ────────────
  // NESSUN auto-scroll continuo: a fine trascrizione la chat NON scrolla → si ferma
  // dove è (posizione fissa). L'unico scroll per-turno è l'align-to-top del nuovo
  // messaggio utente.
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [isOpen]);

  // ── Monitor when a new user question is submitted to align smoothly to the top ──
  const prevLastUserMsgIdRef = useRef<string | null>(null);
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMsg = userMessages[userMessages.length - 1];

    if (lastUserMsg && lastUserMsg.id !== prevLastUserMsgIdRef.current) {
      prevLastUserMsgIdRef.current = lastUserMsg.id;
      shouldAutoScrollRef.current = false;

      setTimeout(() => {
        const targetId = `chat-msg-${lastUserMsg.id}`;
        const element = document.getElementById(targetId);
        const container = scrollContainerRef.current;
        if (element && container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top - containerRect.top + container.scrollTop;

          container.scrollTo({
            top: absoluteElementTop - 8,
            behavior: 'smooth'
          });
        }
      }, 100); // Small timeout to ensure DOM update
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    shouldAutoScrollRef.current = true;
    setIsScrolledUp(false);
  };

  return { isScrolledUp, messagesEndRef, scrollContainerRef, shouldAutoScrollRef, scrollToBottom };
}
