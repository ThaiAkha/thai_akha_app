// ─────────────────────────────────────────────────────────────────────────────
// CHERRY CHAT FLOW — Tipi condivisi (ragnatela)
// Estratti da chatFlowData.ts per permettere la modularizzazione in askCherry_*.ts.
// Tutti i moduli importano i tipi da QUI; chatFlowData.ts li ri-esporta per
// retro-compatibilità con gli import esistenti.
//
// DESIGN RULES (v3):
//   • Every node has EXACTLY 4 options — no more, no less
//   • No node closes the chat — navigation keeps Cherry open alongside the page
//   • No "Go Back" buttons — every option is forward-looking
//   • Messages are substantial and exhaustive — min 4 sentences
//   • Booking CTA: P1 nodes freely · Culture L1 nodes NEVER · Culture L2+ and news nodes YES
//   • Article links (nav_culture / nav_news): appear at L2 depth or in dedicated news nodes
//   • First option = primary CTA (article link, booking, or next depth) when content warrants it
// ─────────────────────────────────────────────────────────────────────────────

// ─── Node IDs ───────────────────────────────────────────────────────────────
// SCELTA (giugno 2026): ChatNodeId = string per scalabilità — nuovi nodi si
// aggiungono in qualsiasi modulo askCherry_*.ts senza toccare una union centrale.
// La sicurezza sui link rotti è garantita a runtime da validateChatFlow() (dev).
// Il catalogo dei nodi attualmente vivi è mantenuto in KnownChatNodeId come
// riferimento/documentazione (non vincolante).
export type ChatNodeId = string;

/** Catalogo di riferimento dei nodi esistenti — NON vincolante (documentazione). */
export type KnownChatNodeId =
  // ROOT
  | 'ROOT'
  // ── P1: Classes & Booking ─────────────────────────────────────────────────
  | 'INFO_CLASSES'
  | 'MORNING_DETAILS'
  | 'EVENING_DETAILS'
  | 'PICKUP_INFO'
  | 'PICKUP_RULES'
  | 'MEETING_POINT'
  | 'BOOK_NOW'
  // ── P2: Menu & Experience ─────────────────────────────────────────────────
  | 'MENU_DIET'
  | 'SET_VEGAN'
  | 'SET_VEGETARIAN'
  | 'SET_REGULAR'
  | 'ALLERGY_INFO'
  | 'AKHA_DISHES_INFO'
  | 'AKHA_SALAD_DETAIL'
  | 'SAPI_THONG_DETAIL'
  | 'AKHA_SOUP_DETAIL'
  | 'CURRY_SELECTION_INFO'
  | 'CURRY_RED_DETAIL'
  | 'CURRY_GREEN_DETAIL'
  | 'CURRY_MASSAMAN_DETAIL'
  | 'CURRY_PANANG_DETAIL'
  | 'GIFT_CERTIFICATE'
  // ── P2: News & Practical Guides ───────────────────────────────────────────
  | 'NEWS_HOW_CLASS_WORKS'
  | 'NEWS_DIET_GUIDE'
  | 'NEWS_ALLERGY_GUIDE'
  | 'NEWS_SPICE_GUIDE'
  | 'NEWS_PREP_GUIDE'
  // ── P3: Culture & Discovery ───────────────────────────────────────────────
  | 'AKHA_CULTURE_HUB'
  | 'AKHA_ZANG_L1'
  | 'AKHA_ZANG_L2'
  | 'AKHA_ZANG_L3'
  | 'AKHA_DRESS_L1'
  | 'AKHA_DRESS_L2'
  | 'AKHA_DRESS_L3'
  | 'AKHA_FESTIVAL_L1'
  | 'AKHA_FESTIVAL_L2'
  | 'AKHA_FESTIVAL_L3'
  | 'AKHA_SPIRITGATE_L1'
  | 'AKHA_SPIRITGATE_L2'
  | 'AKHA_SPIRITGATE_L3'
  | 'AKHA_PHILOSOPHY_L1'
  | 'AKHA_PHILOSOPHY_L2'
  | 'AKHA_ORIGINS_L1'
  | 'AKHA_ORIGINS_L2'
  | 'LEARN_THAI_HUB'
  | 'LEARN_THAI_GREETINGS'
  | 'LEARN_THAI_FOOD'
  | 'LEARN_THAI_NUMBERS'
  | 'QUIZ_TEASER';

// ─── Actions ────────────────────────────────────────────────────────────────
// nav_booking   → navigate to /book-cooking-class-chiang-mai (chat stays open)
// nav_classes   → navigate to /thai-cooking-classes-chiang-mai
// nav_menu      → navigate to /authentic-thai-akha-recipes
// nav_quiz      → navigate to /akha-wisdom-path-quiz
// open_map      → open pickup map modal
// set_diet      → update UserPassport dietary profile (uses data.diet)
// nav_culture   → navigate to /akha-culture-highland-heritage/[data.slug]
// nav_news      → navigate to /thai-cooking-tips-news/[data.slug]
export type ChatAction =
  | 'nav_booking'
  | 'nav_classes'
  | 'nav_menu'
  | 'nav_quiz'
  | 'open_map'
  | 'set_diet'
  | 'nav_culture'
  | 'nav_news'
  | 'nav_recipe'      // → pagina ricetta singola (data.slug)
  | 'nav_ingredient'  // → pagina ingrediente (data.slug)
  | 'open_gallery'    // apre un modal gallery (blocco gallery) — gestito nel renderer
  | 'nav_pickup_hotel'; // apre la PickUpPage e auto-riempie la ricerca con data.hotel

export interface ChatOption {
  label: string;
  nextId: ChatNodeId;
  action?: ChatAction | null;
  priority?: 1 | 2 | 3;
  data?: {
    diet?: 'vegan' | 'vegetarian' | 'regular' | 'pescatarian' | 'meatlover';
    slug?: string;
    /** Nome hotel da auto-cercare sulla PickUpPage (action nav_pickup_hotel). */
    hotel?: string;
  };
  /**
   * Filtro per profilo (tag hardcoded). Nascondi questa opzione se la dieta
   * dell'utente è una di queste. Es. il bottone "Regular / Other" →
   * hideForDiets: ['diet_vegan','diet_vegetarian']. Usa gli id canonici DB
   * (diet_vegan, diet_vegetarian, …). Nessun effetto se l'utente non ha
   * selezionato una dieta o ha diet_regular.
   */
  hideForDiets?: string[];
  /**
   * Nascondi questa opzione se l'utente ha una di queste allergie. Id canonici
   * con prefisso allergy_ (es. ['allergy_peanuts']). Nessun effetto se l'utente
   * non ha allergie selezionate.
   */
  hideForAllergies?: string[];
}

/** Profilo minimo necessario al filtro opzioni (sottoinsieme di UserProfile). */
export interface ChatProfileLite {
  dietary_profile?: string;
  allergies?: string[];
}

/**
 * Filtra le opzioni di un nodo in base al profilo utente (tag hardcoded).
 * Regole (volute):
 *   • profilo dieta non selezionato → nessun filtro dieta (mostra tutto)
 *   • diet_regular → nessun filtro dieta (come "non selezionato")
 *   • allergie vuote → nessun filtro allergie
 * Un'opzione viene nascosta solo se matcha una regola hideForDiets/hideForAllergies.
 */
export function filterOptionsForProfile(
  options: ChatOption[] | undefined,
  profile?: ChatProfileLite | null,
): ChatOption[] {
  if (!options || options.length === 0) return [];
  if (!profile) return options;

  const diet = profile.dietary_profile;
  const allergies = profile.allergies ?? [];
  // "Regular" e profilo non selezionato = nessuna restrizione dieta
  const dietRestrictive = !!diet && diet !== 'diet_regular';

  return options.filter(opt => {
    if (dietRestrictive && diet && opt.hideForDiets?.includes(diet)) return false;
    if (allergies.length > 0 && opt.hideForAllergies?.some(a => allergies.includes(a))) return false;
    return true;
  });
}

// ─── Rich blocks (L3) ─────────────────────────────────────────────────────────
// I blocchi ricchi vivono SOLO in coda al messaggio (dopo la trascrizione), mai
// nel testo. Due tipi: linkCard (anteprima stile WhatsApp → apre pagina, può
// iniettare l'L1 della pagina di destinazione) e gallery (apre un modal, statico).
// Le foto sono riferite via `assetId` (media_assets.asset_id) o `imageUrl` diretto.

interface BlockProfileGate {
  /** Nascondi il blocco se la dieta utente è una di queste (id canonici, es. diet_vegan). */
  hideForDiets?: string[];
  /** Nascondi il blocco se l'utente ha una di queste allergie (es. allergy_peanuts). */
  hideForAllergies?: string[];
}

export interface NodeLinkCard extends BlockProfileGate {
  kind: 'linkCard';
  /** Layout: 'compact' (orizzontale stile sibling) · 'hero' (foto grande + titolo sotto). */
  layout?: 'compact' | 'hero';
  title: string;
  description?: string;
  /** Thumbnail: asset_id (media_assets) preferito, o url diretto. */
  assetId?: string;
  imageUrl?: string;
  /** Azione di navigazione (nav_recipe/nav_culture/nav_news/…). */
  action?: ChatAction | null;
  data?: ChatOption['data'];
  /** Nodo L1-guida da iniettare in chat DOPO la navigazione (page-intro). */
  pageIntroNodeId?: ChatNodeId;
}

export interface NodeGallery extends BlockProfileGate {
  kind: 'gallery';
  /** Layout: 'strip' (thumb sovrapposte) · 'grid' (3 colonne 1:1, stile ingredienti). */
  layout?: 'strip' | 'grid';
  title?: string;
  /** Foto via asset_id (media_assets) o url diretti. */
  assetIds?: string[];
  imageUrls?: string[];
  /** Nomi paralleli alle foto (didascalie nel modal). Il primo = ingrediente main. */
  names?: string[];
}

/** Blocco audio: ascolta un messaggio/indizio. Render: AudioPlayer (assetId→audio_assets o url). */
export interface NodeAudio extends BlockProfileGate {
  kind: 'audio';
  /** asset_id su audio_assets, oppure url diretto. */
  assetId?: string;
  url?: string;
  /** Etichetta breve (es. "🎧 Listen kha"). */
  title?: string;
}

export type NodeBlock = NodeLinkCard | NodeGallery | NodeAudio;

/** Filtra i blocchi ricchi per profilo (stessa logica di filterOptionsForProfile). */
export function filterBlocksForProfile(
  blocks: NodeBlock[] | undefined,
  profile?: ChatProfileLite | null,
): NodeBlock[] {
  if (!blocks || blocks.length === 0) return [];
  if (!profile) return blocks;
  const diet = profile.dietary_profile;
  const allergies = profile.allergies ?? [];
  const dietRestrictive = !!diet && diet !== 'diet_regular';
  return blocks.filter(b => {
    if (dietRestrictive && diet && b.hideForDiets?.includes(diet)) return false;
    if (allergies.length > 0 && b.hideForAllergies?.some(a => allergies.includes(a))) return false;
    return true;
  });
}

export interface ChatNode {
  id: ChatNodeId;
  message: string;
  shortLabel?: string;
  /** Ruolo nella ragnatela: 1 hub/smistamento · 2 info contestuale · 3 approfondimento (ricco, terminale). */
  level?: 1 | 2 | 3;
  priority?: 1 | 2 | 3;
  options: ChatOption[]; // Always exactly 4
  /** Blocchi ricchi (linkCard/gallery) mostrati in coda — tipicamente solo a L3. */
  blocks?: NodeBlock[];
  hasRandomOption?: boolean;
}

/**
 * Valida l'integrità della ragnatela: controlla che ogni `option.nextId`
 * punti a un nodo esistente. Da usare in dev (es. in un test o a bootstrap).
 * Ritorna l'elenco dei link rotti — vuoto se tutto ok.
 */
export function validateChatFlow(
  flow: Record<string, ChatNode>,
): Array<{ node: string; option: string; missingNextId: string }> {
  const broken: Array<{ node: string; option: string; missingNextId: string }> = [];
  for (const [nodeId, node] of Object.entries(flow)) {
    for (const opt of node.options) {
      if (!flow[opt.nextId]) {
        broken.push({ node: nodeId, option: opt.label, missingNextId: opt.nextId });
      }
    }
  }
  return broken;
}
