// ─────────────────────────────────────────────────────────────────────────────
// askCherry_L1 — DRAFT (2026-06-10) · nodi L1 riscritti al nuovo standard.
//
// Regole L1 (vedi Cherry_Master_Schema.md):
//   • Titolo in **bold SENZA icona** (l'icona resta solo sull'entry-point DB).
//   • NEUTRO: niente diete/allergie a L1 (quelle vivono a L2, filtrate). Solo
//     "cose non filtrabili": esperienza, cultura, tecnica, sapore, categoria.
//   • Solo testo ricco (CherryFormat md). NIENTE foto/audio a L1 (media da L2).
//   • Esattamente 4 opzioni. Le label dei bottoni possono tenere l'icona (chip).
//   • Inglese, voce Digital Elder.
//
// ⚠️ Questo file è un DRAFT non importato: NON è cablato in chatFlowData.ts.
// Collega tu i nodi (merge nei moduli giusti + cherry_button_ids + L2/L3).
// I `nextId` sono indicativi: verifica i target con validateChatFlow.
// ─────────────────────────────────────────────────────────────────────────────
import type { ChatNode } from '../chatFlowTypes';

export const flowL1: Record<string, ChatNode> = {
  // ── Global hub ─────────────────────────────────────────────────────────────
  ROOT: {
    id: 'ROOT', level: 1, shortLabel: 'Start',
    message:
      "Sawasdee kha! 🙏 I'm Cherry, your guide to Thai Akha Kitchen. I can help you plan a class, walk you through the dishes you'll cook, or share the story of our Akha hill-tribe heritage. Everything here is hands-on, small-group, and taught by Akha cooks. Where shall we start?",
    options: [
      { label: '🍛 Flavours & Dishes', nextId: 'FLAVOURS_HUB' },
      { label: '⛰️ Akha Culture',      nextId: 'AKHA_CULTURE_HUB' },
      { label: '🗺️ Plan Your Visit',   nextId: 'PLAN_VISIT' },
      { label: '🎟️ The Classes',       nextId: 'INFO_CLASSES' },
    ],
  },

  // ── Flavours / food hub (neutral) ──────────────────────────────────────────
  FLAVOURS_HUB: {
    id: 'FLAVOURS_HUB', level: 1, shortLabel: 'Flavours',
    message:
      "**Flavours & Dishes**\n\nKha! 🙏 Our cooking is all about bold, fresh flavour built by hand — curry pastes pounded in a stone mortar, mountain herbs, and a wok that's yours alone for the class.\n\nThere are two worlds on the menu: the famous Thai classics, and the Akha hill-tribe dishes you won't find in restaurants. Which way pulls you?",
    options: [
      { label: '🍛 Thai Curries',          nextId: 'CURRY_SELECTION_INFO' },
      { label: '🌿 Akha Signature Dishes', nextId: 'AKHA_DISHES_INFO' },
      { label: '🔨 How We Cook It',         nextId: 'RECIPE_TECHNIQUE' },
      { label: '⛰️ Akha Culture',           nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  // ── Technique (neutral, shared by every recipe) ────────────────────────────
  RECIPE_TECHNIQUE: {
    id: 'RECIPE_TECHNIQUE', level: 1, shortLabel: 'The Technique',
    message:
      "**The Technique — By Hand, From Scratch**\n\nKha! 🙏 Nothing here comes from a jar. You pound your own curry paste in a heavy granite mortar, one ingredient at a time, and cook over a real wok at your own station.\n\nThe mortar matters: pounding **bruises and tears** the aromatics so their oils bloom slowly — a depth a blender simply can't reach. It's a workout for your arm and the best smell in the room. Want to see the dishes you'll build this way?",
    options: [
      { label: '🍛 Thai Curries',          nextId: 'CURRY_SELECTION_INFO' },
      { label: '🌿 Akha Signature Dishes', nextId: 'AKHA_DISHES_INFO' },
      { label: '🎟️ The Classes',           nextId: 'INFO_CLASSES' },
      { label: '🗺️ Plan Your Visit',       nextId: 'PLAN_VISIT' },
    ],
  },

  // ── Curry hub (neutral — diet/spice variants live at L2) ───────────────────
  CURRY_SELECTION_INFO: {
    id: 'CURRY_SELECTION_INFO', level: 1, shortLabel: 'Thai Curries',
    message:
      "**The Four Thai Curries**\n\nKha! 🙏 We teach four curries, each from a paste you pound yourself — no jars, no powders. You'll learn which aromatic goes in first and why the order of pounding changes everything.\n\n- **Red** — the classic, deep and warming\n- **Green** — the brightest and most herbal\n- **Massaman** — gentle, spice-trade warmth\n- **Panang** — thick and rich with pounded peanuts\n\nTake a closer look at one:",
    options: [
      { label: '💚 Green Curry',    nextId: 'CURRY_GREEN_DETAIL' },
      { label: '❤️ Red Curry',      nextId: 'CURRY_RED_DETAIL' },
      { label: '🤎 Massaman',       nextId: 'CURRY_MASSAMAN_DETAIL' },
      { label: '🧡 Panang',         nextId: 'CURRY_PANANG_DETAIL' },
    ],
  },

  // ── Akha dishes hub (neutral) ──────────────────────────────────────────────
  AKHA_DISHES_INFO: {
    id: 'AKHA_DISHES_INFO', level: 1, shortLabel: 'Akha Dishes',
    message:
      "**The Akha Signature Dishes**\n\nKha! 🙏 These come straight from the hill-tribe villages — recipes you won't meet in a restaurant. They're always eaten together, a meal in balance:\n\n- **Mountain Fresh Salad** — no oil, just lime and garden vegetables\n- **Spirit Soup** — a clear, restorative mountain broth\n- **Sapi Thong** — the smoky, hand-pounded chili dip\n\nThey're the soul of our school. Which one shall we open?",
    options: [
      { label: '🥗 Mountain Salad', nextId: 'AKHA_SALAD_DETAIL' },
      { label: '🌶️ Sapi Thong',     nextId: 'SAPI_THONG_DETAIL' },
      { label: '🍵 Spirit Soup',    nextId: 'AKHA_SOUP_DETAIL' },
      { label: '🔨 How We Cook It',  nextId: 'RECIPE_TECHNIQUE' },
    ],
  },

  // ── Ingredients hubs (neutral, shared by all 162 ingredients) ──────────────
  ING_IN_DISHES: {
    id: 'ING_IN_DISHES', level: 1, shortLabel: 'In Which Dishes',
    message:
      "**Where This Ingredient Shows Up**\n\nKha! 🙏 Most of what we cook with earns its place in several dishes — pounded into a paste, fired in a wok, or scattered on at the end for crunch and aroma.\n\nTell me a direction and I'll point you to the dishes and flavours it belongs to.",
    options: [
      { label: '🍛 Thai Curries',          nextId: 'CURRY_SELECTION_INFO' },
      { label: '🌿 Akha Signature Dishes', nextId: 'AKHA_DISHES_INFO' },
      { label: '🔨 How We Cook It',         nextId: 'RECIPE_TECHNIQUE' },
      { label: '🍛 Back to Flavours',       nextId: 'FLAVOURS_HUB' },
    ],
  },

  ING_FAMILIES: {
    id: 'ING_FAMILIES', level: 1, shortLabel: 'Flavour Families',
    message:
      "**The Flavour Families**\n\nKha! 🙏 Thai and Akha cooking leans on a handful of families that do the heavy lifting: the **aromatics** (lemongrass, galangal, kaffir lime), the **chilies**, the **herbs**, and the **savoury backbones** that bring depth.\n\nLearn the families and the whole pantry starts to make sense. Where shall we wander?",
    options: [
      { label: '🌿 Aromatics & Herbs', nextId: 'ING_IN_DISHES' },
      { label: '🌶️ Chilies & Heat',    nextId: 'ING_IN_DISHES' },
      { label: '🍛 Thai Curries',       nextId: 'CURRY_SELECTION_INFO' },
      { label: '🍛 Back to Flavours',   nextId: 'FLAVOURS_HUB' },
    ],
  },

  // ── Plan your visit hub (logistics, neutral) ───────────────────────────────
  PLAN_VISIT: {
    id: 'PLAN_VISIT', level: 1, shortLabel: 'Plan Your Visit',
    message:
      "**Plan Your Visit**\n\nKha! 🙏 Ready to join us? There's a Morning class that opens with a market tour, and a relaxed Evening class — both at your own cooking station, with free hotel pickup across the Old City and Nimman.\n\nWhat would help most?",
    options: [
      { label: '☀️ Morning vs Evening', nextId: 'INFO_CLASSES' },
      { label: '🚐 Pickup & Meeting',   nextId: 'PICKUP_INFO' },
      { label: '🎁 What You Take Home',  nextId: 'GIFT_CERTIFICATE' },
      { label: '🍛 Flavours & Dishes',  nextId: 'FLAVOURS_HUB' },
    ],
  },

  // ── Classes hub (neutral — prices/diets handled in detail/L2) ──────────────
  INFO_CLASSES: {
    id: 'INFO_CLASSES', level: 1, shortLabel: 'The Classes',
    message:
      "**Two Ways to Cook With Us**\n\nKha! 🙏 Both classes are small-group, hands-on, and built on real Akha recipes — you cook a full spread and eat as you go.\n\n- **Morning** — opens with a guided local market tour, then the kitchen\n- **Evening** — straight to the kitchen as the day cools, relaxed and social\n\nSame menu, different mood. Which suits you?",
    options: [
      { label: '☀️ Morning Class',  nextId: 'MORNING_DETAILS' },
      { label: '🌙 Evening Class',  nextId: 'EVENING_DETAILS' },
      { label: '🚐 Pickup & Meeting', nextId: 'PICKUP_INFO' },
      { label: '🍛 Flavours & Dishes', nextId: 'FLAVOURS_HUB' },
    ],
  },

  // ── Pickup / logistics L1 (neutral) ────────────────────────────────────────
  PICKUP_INFO: {
    id: 'PICKUP_INFO', level: 1, shortLabel: 'Pickup',
    message:
      "**Free Pickup — Included**\n\nKha! 🙏 We collect you from your hotel or a central point inside the Old City moat or Nimman, at no extra cost. The driver speaks English and confirms the exact spot and time the evening before by WhatsApp.\n\nStaying further out? You can meet us at **Wat Pan Whaen Temple** on the south side of the moat. How can I help?",
    options: [
      { label: '📍 Meeting Point',    nextId: 'MEETING_POINT' },
      { label: '📋 Pickup Rules',     nextId: 'PICKUP_RULES' },
      { label: '🎟️ The Classes',      nextId: 'INFO_CLASSES' },
      { label: '🗺️ Plan Your Visit',  nextId: 'PLAN_VISIT' },
    ],
  },

  // ── Culture hub (neutral) ──────────────────────────────────────────────────
  AKHA_CULTURE_HUB: {
    id: 'AKHA_CULTURE_HUB', level: 1, shortLabel: 'Akha Culture',
    message:
      "**Akha Culture — A Living Tradition**\n\nKha! 🙏 The Akha came down from the Tibetan plateau over many generations, carrying an unwritten code — the **Akha Zang** — and a forest-to-table way of life. The food we cook is inseparable from all of it.\n\nUnderstanding where these recipes come from changes how they taste. Where shall we begin?",
    options: [
      { label: '📜 The Akha Zang',     nextId: 'AKHA_ZANG_L1' },
      { label: '⛰️ Origins & History', nextId: 'AKHA_ORIGINS_L1' },
      { label: '🌿 Food Philosophy',   nextId: 'AKHA_PHILOSOPHY_L1' },
      { label: '🍛 Flavours & Dishes', nextId: 'FLAVOURS_HUB' },
    ],
  },

  // ── Culture theme L1s (neutral, text-only; titles without icon) ────────────
  AKHA_ZANG_L1: {
    id: 'AKHA_ZANG_L1', level: 1, shortLabel: 'Akha Zang',
    message:
      "**The Akha Zang — The Akha Way**\n\nKha! 🙏 The Akha Zang is our **unwritten code of conduct**, passed by voice from elder to child and never written down. It's the compass that keeps the community, nature and the ancestors in harmony.\n\nIt isn't a religion or a rulebook on a shelf — it's a living way of doing things, held in memory and daily practice. Where to next?",
    options: [
      { label: '🚪 The Spirit Gate',   nextId: 'AKHA_SPIRITGATE_L1' },
      { label: '⛰️ Origins & History', nextId: 'AKHA_ORIGINS_L1' },
      { label: '🌿 Food Philosophy',   nextId: 'AKHA_PHILOSOPHY_L1' },
      { label: '👘 Traditional Dress', nextId: 'AKHA_DRESS_L1' },
    ],
  },

  AKHA_ORIGINS_L1: {
    id: 'AKHA_ORIGINS_L1', level: 1, shortLabel: 'Origins',
    message:
      "**From the Tibetan Plateau**\n\nKha! 🙏 Our roots climb back to the **eastern Tibetan plateau**. Over many generations the Akha migrated south — through Yunnan, into Myanmar and Laos, and finally into the mountains of Northern Thailand.\n\nThat long walk split us into three subgroups, and you can still read the route in the silver of a woman's headdress. Where shall we go?",
    options: [
      { label: '👘 Traditional Dress', nextId: 'AKHA_DRESS_L1' },
      { label: '📜 The Akha Zang',     nextId: 'AKHA_ZANG_L1' },
      { label: '🎡 The Swing Festival', nextId: 'AKHA_FESTIVAL_L1' },
      { label: '⛰️ Culture Hub',       nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  AKHA_PHILOSOPHY_L1: {
    id: 'AKHA_PHILOSOPHY_L1', level: 1, shortLabel: 'Food Philosophy',
    message:
      "**Food as Medicine — The Akha Way**\n\nKha! 🙏 For the Akha, food is medicine before it's flavour. The forest is the pantry and the plants at altitude the pharmacy — every dish built to heal and balance the body.\n\nWhat you cook in our kitchen is the edible expression of that worldview: highland ecology and centuries of nutritional knowledge, on a plate. Where to?",
    options: [
      { label: '🌳 The Forest Pantry', nextId: 'AKHA_SPIRITGATE_L1' },
      { label: '📜 The Akha Zang',     nextId: 'AKHA_ZANG_L1' },
      { label: '🌿 Akha Dishes',       nextId: 'AKHA_DISHES_INFO' },
      { label: '⛰️ Culture Hub',       nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  AKHA_DRESS_L1: {
    id: 'AKHA_DRESS_L1', level: 1, shortLabel: 'Traditional Dress',
    message:
      "**The Language of Silver**\n\nKha! 🙏 An Akha woman's dress is a **language spoken without words**. The silver headdress and indigo embroidery announce her subgroup, her age, even whether she's married — all readable at a glance.\n\nThe coins sewn into a headdress aren't decoration: they're a map of the family's journey through Southeast Asia. Where shall we look?",
    options: [
      { label: '⛰️ Origins & History',  nextId: 'AKHA_ORIGINS_L1' },
      { label: '🎡 The Swing Festival',  nextId: 'AKHA_FESTIVAL_L1' },
      { label: '📜 The Akha Zang',       nextId: 'AKHA_ZANG_L1' },
      { label: '⛰️ Culture Hub',         nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  AKHA_FESTIVAL_L1: {
    id: 'AKHA_FESTIVAL_L1', level: 1, shortLabel: 'Swing Festival',
    message:
      "**Yehkuja — The Swing Festival**\n\nKha! 🙏 Yehkuja, the Swing Festival, is our **Women's New Year** and a celebration of the rice harvest. For four days every August the whole village builds a giant ritual swing and comes alive.\n\nSwinging high isn't play — it's a prayer for good rice and the ancestors' blessing. Where to next?",
    options: [
      { label: '👘 Traditional Dress', nextId: 'AKHA_DRESS_L1' },
      { label: '📜 The Akha Zang',     nextId: 'AKHA_ZANG_L1' },
      { label: '🚪 The Spirit Gate',   nextId: 'AKHA_SPIRITGATE_L1' },
      { label: '⛰️ Culture Hub',       nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  AKHA_SPIRITGATE_L1: {
    id: 'AKHA_SPIRITGATE_L1', level: 1, shortLabel: 'Spirit Gate',
    message:
      "**Loku-Pah — The Spirit Gate**\n\nKha! 🙏 Every traditional Akha village has a **Loku-Pah** at its entrance — the boundary between the ordered human world inside and the wild spirit world beyond.\n\nThe part most people miss: it isn't built to keep people out — it keeps the harmony in. The village rebuilds it every single year. Where shall we go?",
    options: [
      { label: '📜 The Akha Zang',     nextId: 'AKHA_ZANG_L1' },
      { label: '🌿 Food Philosophy',   nextId: 'AKHA_PHILOSOPHY_L1' },
      { label: '🎡 The Swing Festival', nextId: 'AKHA_FESTIVAL_L1' },
      { label: '⛰️ Culture Hub',       nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  // ── Learn Thai hub (neutral) ───────────────────────────────────────────────
  LEARN_THAI_HUB: {
    id: 'LEARN_THAI_HUB', level: 1, shortLabel: 'Learn Thai',
    message:
      "**A Little Thai Before You Come**\n\nKha! 🙏 A few words go a long way in Chiang Mai — locals love the effort, and knowing the food words makes the market come alive. Thai is tonal, so pronunciation matters, but don't let that stop you.\n\nThe one word to know before you arrive: *aroi mak* — very delicious. Where shall we start?",
    options: [
      { label: '🙏 Greetings',         nextId: 'LEARN_THAI_GREETINGS' },
      { label: '🍜 Food Words',        nextId: 'LEARN_THAI_FOOD' },
      { label: '🔢 Numbers',           nextId: 'LEARN_THAI_NUMBERS' },
      { label: '⛰️ Akha Culture',      nextId: 'AKHA_CULTURE_HUB' },
    ],
  },
};
