// ─────────────────────────────────────────────────────────────────────────────
// askCherry_HomeDemo — PRIMA ragnatela demo, solo dall'entry HOME.
// Flusso ciclico L1 → L2 → L3 (ricco) → uscita → L1. Dimostra:
//   • linkCard 'hero'  (foto grande + titolo sotto) → pagina + page-intro L1
//   • linkCard 'compact' (orizzontale stile sibling)
//   • gallery 'grid' (3 foto ingredienti 1:1) → modal
//   • nodi page-intro L1 (la chat riparte dalla pagina di destinazione)
// Immagini/slug reali dal DB. NON tocca gli altri entry.
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatNode } from './chatFlowTypes';

const ING = 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/ingredients';
const GREEN_CURRY_INGREDIENTS = [
  `${ING}/01-Green-Anaheim-Pepper.webp`, // MAIN: peperoncino verde fresco
  `${ING}/01-Galangal.webp`,
  `${ING}/01-Lemongrass.webp`,
];
const GREEN_CURRY_ING_NAMES = ['Fresh Green Chili', 'Galangal', 'Lemongrass'];

const BOOK = { label: '📅 Join a Class', nextId: 'BOOK_NOW', action: 'nav_booking' as const };

export const flowHomeDemo: Record<string, ChatNode> = {
  // ── L1 hubs (entry dalla card Home) ───────────────────────────────────────
  HOME_FLAVORS: {
    id: 'HOME_FLAVORS', level: 1, shortLabel: '🍛 Flavours',
    message:
      "Kha! 🙏 Our cooking is all about bold, fresh flavour — curry pastes pounded by hand, mountain herbs, and a wok that's all yours. Where shall we start?",
    options: [
      { label: '🍛 Thai Curries', nextId: 'HOME_CURRIES' },
      { label: '🌿 Akha Signature Dishes', nextId: 'HOME_AKHA' },
      { label: '⛰️ Akha Culture', nextId: 'HOME_CULTURE' },
      BOOK,
    ],
  },
  HOME_CULTURE: {
    id: 'HOME_CULTURE', level: 1, shortLabel: '⛰️ Akha Culture',
    message:
      "Kha! 🙏 Before the cooking, there's the culture. The Akha came down from the Tibetan plateau over many generations, carrying an unwritten code — the Akha Zang — and a forest-to-table way of life. Where shall we begin?",
    options: [
      { label: '📖 Where the Akha come from', nextId: 'HOME_ORIGINS' },
      { label: '🌶️ Food as Medicine', nextId: 'HOME_AKHA_STORY' },
      { label: '🍛 Flavours & Recipes', nextId: 'HOME_FLAVORS' },
      BOOK,
    ],
  },
  HOME_VISIT: {
    id: 'HOME_VISIT', level: 1, shortLabel: '🗺️ Plan Your Visit',
    message:
      "Kha! 🙏 Ready to join us? There's a Morning class with a local market tour, and a relaxed Evening class — both at your own cooking station, with free hotel pickup across Chiang Mai.",
    options: [
      { label: '☀️ Morning vs Evening', nextId: 'INFO_CLASSES' },
      { label: '🚐 Pickup & meeting point', nextId: 'PICKUP_INFO' },
      { label: '🍛 Flavours & Recipes', nextId: 'HOME_FLAVORS' },
      BOOK,
    ],
  },

  // ── L2 info ────────────────────────────────────────────────────────────────
  HOME_CURRIES: {
    id: 'HOME_CURRIES', level: 2, shortLabel: '🍛 Thai Curries',
    message:
      "Kha! 🙏 We teach four curries, each from a paste you pound yourself in a stone mortar. The green is the brightest — fresh green chilies, galangal, lemongrass and kaffir lime. Take a closer look:",
    options: [
      { label: '💚 Explore Green Curry', nextId: 'HOME_GREEN_CURRY' },
      { label: '🌿 Akha Dishes instead', nextId: 'HOME_AKHA' },
      { label: '⛰️ Akha Culture', nextId: 'HOME_CULTURE' },
      BOOK,
    ],
  },
  HOME_AKHA: {
    id: 'HOME_AKHA', level: 2, shortLabel: '🌿 Akha Dishes',
    message:
      "Kha! 🙏 The Akha dishes are the soul of our school — recipes from the hill-tribe villages you won't find in restaurants: the Mountain Fresh Salad, the Spirit Detox Soup, and Sapi Thong, the smoky chili dip. They're always eaten together — a meal in balance.",
    options: [
      { label: '🌶️ Food as Medicine', nextId: 'HOME_AKHA_STORY' },
      { label: '🍛 Thai Curries', nextId: 'HOME_CURRIES' },
      { label: '🍛 Back to flavours', nextId: 'HOME_FLAVORS' },
      BOOK,
    ],
  },

  // ── L3 approfondimenti ricchi (terminali → uscita a L1) ────────────────────
  HOME_GREEN_CURRY: {
    id: 'HOME_GREEN_CURRY', level: 3, shortLabel: '💚 Green Curry',
    message:
      "Kha! 🙏 Green curry gets its glow from **fresh green chilies pounded young and bright** — never dried. Galangal brings the citrus-pine snap, lemongrass the perfume. Here's the dish and its three key ingredients — tap to explore, then pick where to go next.",
    blocks: [
      {
        kind: 'linkCard', layout: 'hero',
        assetId: 'Thai-Green-Curry-04',
        title: 'Thai Green Curry',
        description: 'The full recipe — paste, timing, plating.',
        action: 'nav_recipe', data: { slug: 'authentic-thai-green-curry-recipe' },
        pageIntroNodeId: 'PAGE_GREEN_CURRY',
      },
      {
        kind: 'gallery', layout: 'grid',
        title: 'Green curry — key ingredients',
        imageUrls: GREEN_CURRY_INGREDIENTS,
        names: GREEN_CURRY_ING_NAMES,
      },
    ],
    options: [
      { label: '🍛 More flavours', nextId: 'HOME_FLAVORS' },
      { label: '⛰️ Akha Culture', nextId: 'HOME_CULTURE' },
      { label: '🗺️ Plan your visit', nextId: 'HOME_VISIT' },
      BOOK,
    ],
  },
  HOME_AKHA_STORY: {
    id: 'HOME_AKHA_STORY', level: 3, shortLabel: '🌶️ Food as Medicine',
    message:
      "Kha! 🙏 For the Akha, food is medicine and the forest is the pharmacy — every meal is built to heal and balance the body. Read the story behind the table:",
    blocks: [
      {
        kind: 'linkCard', layout: 'compact',
        assetId: 'food-as-medicine-01',
        title: 'Food as Medicine: the Akha table',
        description: 'Why every Akha meal is a daily prescription.',
        action: 'nav_culture', data: { slug: 'akha-food-as-medicine-healing' },
        pageIntroNodeId: 'PAGE_FOOD_MEDICINE',
      },
    ],
    options: [
      { label: '🍛 Flavours & Recipes', nextId: 'HOME_FLAVORS' },
      { label: '⛰️ Akha Culture', nextId: 'HOME_CULTURE' },
      { label: '🗺️ Plan your visit', nextId: 'HOME_VISIT' },
      BOOK,
    ],
  },
  HOME_ORIGINS: {
    id: 'HOME_ORIGINS', level: 3, shortLabel: '📖 Akha Origins',
    message:
      "Kha! 🙏 Our roots trace back to the eastern Tibetan plateau — a long migration south through Yunnan into the mountains of Northern Thailand. You can still read that journey in the silver of the headdresses.",
    blocks: [
      {
        kind: 'linkCard', layout: 'hero',
        assetId: 'historical-roots-01',
        title: 'The Journey from the Tibetan Plateau',
        description: 'The Akha migration, told in full.',
        action: 'nav_culture', data: { slug: 'akha-migration-history-routes' },
        pageIntroNodeId: 'PAGE_ORIGINS',
      },
    ],
    options: [
      { label: '🌿 Akha dishes', nextId: 'HOME_AKHA' },
      { label: '🍛 Flavours & Recipes', nextId: 'HOME_FLAVORS' },
      { label: '🗺️ Plan your visit', nextId: 'HOME_VISIT' },
      BOOK,
    ],
  },

  // ── L1 page-intro (iniettati dopo la navigazione di una linkCard) ──────────
  PAGE_GREEN_CURRY: {
    id: 'PAGE_GREEN_CURRY', level: 1, shortLabel: '💚 Green Curry',
    message:
      "Kha! 🙏 You're on the Green Curry recipe now. Scroll down for the hand-pounded paste, the ingredient list and the step-by-step. Anything I can help with while you're here?",
    options: [
      { label: '🌶️ How spicy is it?', nextId: 'HOME_CURRIES' },
      { label: '🥗 See Akha dishes', nextId: 'HOME_AKHA' },
      { label: '🍛 Back to flavours', nextId: 'HOME_FLAVORS' },
      BOOK,
    ],
  },
  PAGE_FOOD_MEDICINE: {
    id: 'PAGE_FOOD_MEDICINE', level: 1, shortLabel: '🌶️ Food as Medicine',
    message:
      "Kha! 🙏 You're reading Food as Medicine — the Akha philosophy of thermal balance and mountain herbs. Want to bring it back to the kitchen?",
    options: [
      { label: '🌿 The Akha dishes', nextId: 'HOME_AKHA' },
      { label: '🍛 Thai flavours', nextId: 'HOME_FLAVORS' },
      { label: '⛰️ More culture', nextId: 'HOME_CULTURE' },
      BOOK,
    ],
  },
  PAGE_ORIGINS: {
    id: 'PAGE_ORIGINS', level: 1, shortLabel: '📖 Origins',
    message:
      "Kha! 🙏 You're on the Akha migration story. Scroll for the full journey from the plateau to Chiang Mai. Where to next?",
    options: [
      { label: '⛰️ More Akha culture', nextId: 'HOME_CULTURE' },
      { label: '🍛 Flavours & Recipes', nextId: 'HOME_FLAVORS' },
      { label: '🗺️ Plan your visit', nextId: 'HOME_VISIT' },
      BOOK,
    ],
  },
};
