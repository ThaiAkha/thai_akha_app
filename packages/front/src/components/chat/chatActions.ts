import type { ChatOption, ChatNodeId } from '@thaiakha/shared/data/chatFlowData';

interface OptionHandlerDeps {
  onNavigate?: (page: string, topic?: string) => void;
  injectStaticExchange: (userLabel: string, nodeId: ChatNodeId) => Promise<void> | void;
}

/**
 * createOptionHandler — gestore unico dei click sui bottoni-nodo (CHAT_FLOW),
 * condiviso da ChatBox (laterale) e CherryInlineChat (FAQ). Esegue l'azione
 * (navigazione/eventi) e poi naviga SEMPRE l'albero CHAT_FLOW (zero API call).
 * La chat non si chiude mai su navigazione.
 */
export const createOptionHandler =
  ({ onNavigate, injectStaticExchange }: OptionHandlerDeps) =>
  (opt: ChatOption) => {
    // Pulsante mappa pickup dinamico: apre la PickUpPage e auto-cerca l'hotel.
    // NON è un nodo della ragnatela → naviga + dispatch e basta (return early).
    if (opt.action === 'nav_pickup_hotel') {
      onNavigate?.('location');
      window.dispatchEvent(new CustomEvent('cherry-pickup-search', { detail: { hotel: opt.data?.hotel } }));
      return;
    }
    switch (opt.action) {
      case 'nav_booking':
        onNavigate?.('booking');
        break;
      case 'nav_classes':
        onNavigate?.('thai-cooking-classes-chiang-mai');
        break;
      case 'nav_menu':
        onNavigate?.('recipes');
        break;
      case 'nav_quiz':
        onNavigate?.('quiz');
        break;
      case 'open_map':
        onNavigate?.('location'); // apre la PickUpPage (mappa)
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
      case 'nav_recipe':
        if (opt.data?.slug) {
          onNavigate?.(`authentic-thai-akha-recipes/${opt.data.slug}`);
        }
        break;
      default:
        break;
    }
    // Always navigate the CHAT_FLOW tree (zero API call) — chat never auto-closes
    injectStaticExchange(opt.label, opt.nextId as ChatNodeId);
  };
