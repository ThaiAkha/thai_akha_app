import type { ChatOption, ChatNodeId } from '@thaiakha/shared/data/chatFlowData';

interface OptionClickDeps {
  onNavigate?: (page: string, topic?: string) => void;
  injectStaticExchange: (userLabel: string, nodeId: ChatNodeId) => void;
}

// ── Chat option button handler — processes action + navigates if needed ────
export function createOptionClickHandler({ onNavigate, injectStaticExchange }: OptionClickDeps) {
  return (opt: ChatOption) => {
    // Pulsante mappa pickup dinamico: apre la PickUpPage e auto-cerca l'hotel.
    // NON è un nodo della ragnatela → naviga + dispatch e basta (return early).
    if (opt.action === 'nav_pickup_hotel') {
      // sessionStorage sopravvive al lazy-mount della PickUpPage (l'evento da solo
      // andrebbe perso perché la pagina monta il listener dopo). L'evento copre il
      // caso "pagina già aperta".
      try { if (opt.data?.hotel) sessionStorage.setItem('cherry_pickup_hotel', opt.data.hotel); } catch { /* noop */ }
      onNavigate?.('location');
      window.dispatchEvent(new CustomEvent('cherry-pickup-search', { detail: { hotel: opt.data?.hotel } }));
      return;
    }
    switch (opt.action) {
      case 'nav_booking':
        onNavigate?.('booking');
        break; // chat stays open — navigation opens in app, chat persists
      case 'nav_classes':
        onNavigate?.('thai-cooking-classes-chiang-mai');
        break;
      case 'nav_menu':
        onNavigate?.('recipes');
        break;
      case 'nav_quiz':
        onNavigate?.('quiz');
        break; // chat stays open — no close on navigation
      case 'open_map':
        onNavigate?.('location'); // apre la PickUpPage (mappa). Prima l'evento 'open-pickup-map' era morto.
        break;
      case 'set_diet':
        if (opt.data?.diet) {
          window.dispatchEvent(
            new CustomEvent('cherry-set-diet', { detail: { diet: opt.data.diet } })
          );
        }
        break;
      case 'nav_culture':
        if (opt.data?.slug) {
          onNavigate?.(`akha-culture-highland-heritage/${opt.data.slug}`);
        }
        break;
      case 'nav_news':
        if (opt.data?.slug) {
          onNavigate?.(`thai-cooking-tips-news/${opt.data.slug}`);
        }
        break;
      default:
        break;
    }
    // Always navigate the CHAT_FLOW tree (zero API call) — chat never auto-closes
    injectStaticExchange(opt.label, opt.nextId as ChatNodeId);
  };
}
