import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../i18n';
import { useCherry } from './CherryProvider';
import { useChatScroll } from './useChatScroll';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputBar } from './ChatInputBar';
import { ChatIdentityHeader } from './ChatIdentityHeader';
import { createOptionHandler } from './chatActions';

export interface CherryInlineChatProps {
  onNavigate?: (page: string, topic?: string) => void;
  className?: string;
}

/**
 * CherryInlineChat — chat Cherry embedded full-width (FAQ page), SOLO TESTO.
 * Condivide lo stato con la ChatBox laterale via CherryProvider → sync live e
 * memoria attiva (history di sessione mostrata al mount). Niente voce.
 *
 * Desktop-only: la visibilità (hidden sm:block) è gestita da chi la monta.
 */
export const CherryInlineChat: React.FC<CherryInlineChatProps> = ({ onNavigate, className }) => {
  const {
    messages,
    sendMessage,
    injectStaticExchange,
    isLoading,
    chatError,
    registerInlineSurface,
    unregisterInlineSurface,
  } = useCherry();

  // ── Registrazione superficie inline (solo quando VISIBILE, ≥lg) ─────────────
  // La inline è `hidden lg:block`: montata anche su mobile ma nascosta. Registriamo
  // solo quando il breakpoint lg matcha → la ChatBox flottante non si auto-apre su
  // desktop (scambio già visibile qui), mentre su mobile si apre come prima.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    let registered = false;
    const sync = () => {
      if (mql.matches && !registered) { registerInlineSurface(); registered = true; }
      else if (!mql.matches && registered) { unregisterInlineSurface(); registered = false; }
    };
    sync();
    mql.addEventListener('change', sync);
    return () => {
      mql.removeEventListener('change', sync);
      if (registered) unregisterInlineSurface();
    };
  }, [registerInlineSurface, unregisterInlineSurface]);

  // idPrefix dedicato: evita collisioni DOM con la ChatBox laterale (stessi messaggi)
  const ID_PREFIX = 'inline-chat-msg-';
  const { scrollContainerRef, messagesEndRef, shouldAutoScrollRef, isScrolledUp, scrollToBottom } =
    useChatScroll(messages, true, ID_PREFIX);

  // ── Click-to-activate ──────────────────────────────────────────────────────
  // Passivo finché non clicchi/focalizzi: la rotella scorre la PAGINA (no scroll-trap).
  // Attivo dopo click/focus: scroll interno abilitato. Click fuori / Esc → passivo.
  const [isActive, setIsActive] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setIsActive(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsActive(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isActive]);

  // NB: NIENTE re-anchor forzato quando la chat torna passiva. Prima si faceva
  // `el.scrollTop = el.scrollHeight` → disattivando (es. scroll/click sulla pagina)
  // la chat "saltava in fondo / ripartiva da capo". Ora la posizione resta FISSA
  // dove si trova (come la main ChatBox). L'ancoraggio iniziale in basso è gestito
  // dall'auto-scroll di useChatScroll al mount.

  const handleOptionClick = createOptionHandler({ onNavigate, injectStaticExchange });

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    shouldAutoScrollRef.current = true;
    void sendMessage(text);
  };

  return (
    <section
      ref={sectionRef}
      aria-label={t('components:cherryChat.askCherry')}
      onMouseDown={() => setIsActive(true)}
      onFocus={() => setIsActive(true)}
      className={cn(
        'w-full flex flex-col overflow-hidden border border-white/10 rounded-[2rem]',
        'shadow-2xl backdrop-blur-3xl bg-surface/95',
        'h-[clamp(420px,60vh,640px)]',
        // Stato attivo del CONTENITORE: anello turchese (ambient Cherry). Transizione cheap (ASSE 9).
        'transition-shadow duration-300',
        isActive ? 'ring-2 ring-cherry-static/70' : 'ring-0',
        className
      )}
    >
      {/* ── Header — schema identità Cherry (avatar+badge+testi), taglia lg.
          Gradiente FISSO dei pulsanti cherry (--cherry-btn-grad). */}
      <ChatIdentityHeader
        title={t('components:cherryChat.title')}
        status={chatError ? 'error' : isLoading ? 'typing' : 'ready'}
        statusLabel={chatError ? t('components:cherryChat.statusError') : isLoading ? t('components:cherryChat.statusTyping') : t('components:cherryChat.statusIdle')}
        size="lg"
        className="bg-[image:var(--cherry-btn-grad)]"
      />

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <ChatMessageList
        messages={messages}
        onOptionClick={handleOptionClick}
        scrollContainerRef={scrollContainerRef}
        messagesEndRef={messagesEndRef}
        isScrolledUp={isScrolledUp}
        scrollToBottom={scrollToBottom}
        scrollLocked={!isActive}
        idPrefix={ID_PREFIX}
      />

      {/* ── Input (text-only) ─────────────────────────────────────────────── */}
      <ChatInputBar onSend={handleSend} disabled={isLoading} />
    </section>
  );
};

export default CherryInlineChat;
