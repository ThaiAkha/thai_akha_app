// ─────────────────────────────────────────────────────────────────────────────
// askCherry_L2 — DRAFT (2026-06-10) · nodi L2 riscritti al nuovo standard.
//
// L2 = livello PROFILATO + MEDIA (vedi Cherry_Master_Schema.md):
//   • FILTRATO per dieta/allergia via filterOptionsForProfile / filterBlocksForProfile
//     → diete/allergie sono un FILTRO, NON un nodo-per-dieta (anti-esplosione).
//   • MEDIA ammessi: `blocks` linkCard (→ pagina) e gallery (foto). [audio = quando
//     NodeAudio entra nella union — vedi TASK_Quiz_Hints_Preset §2a.]
//   • Titolo in **bold SENZA icona**. 4 opzioni. Inglese, voce Digital Elder.
//
// ⚠️ DRAFT non importato: NON cablato in chatFlowData.ts. Collega tu (merge +
//    cherry_button_ids + L3 target + assetId reali). I `nextId`/asset sono
//    indicativi: verifica con validateChatFlow e con media_assets reali.
//
// NOTE MEDIA: gli `assetId` foto-ricetta/cultura + le gallery ingredienti usano
// `assetIds` (media_assets). Ingredienti = pattern `{slug}-01` (es. tomato-01,
// green-chilli-01). Convertite da imageUrls-placeholder → assetIds reali (2026-06-11).
// ─────────────────────────────────────────────────────────────────────────────
import type { ChatNode } from '../chatFlowTypes';


export const flowL2: Record<string, ChatNode> = {
  // ── FOOD · adattamenti (UN nodo filtrato, non uno per dieta) ───────────────
  RECIPE_ADAPTATIONS_L2: {
    id: 'RECIPE_ADAPTATIONS_L2', level: 2, shortLabel: 'Your Version',
    message:
      "**Your Version of the Dish**\n\nKha! 🙏 Every dish bends to you, because you cook at your own station. The swaps happen at the ingredient level, before cooking — so nothing on your tray clashes with how you eat.\n\nWe lean on Northern Thai soy for fish sauce, mushroom stock for chicken, fresh tofu for meat, and toasted pumpkin seeds in place of peanuts. Tell me what you need and I'll show your exact setup.",
    // Le opzioni vengono pre-filtrate dal profilo attivo (filterOptionsForProfile):
    options: [
      { label: '🌱 Plant-based swaps',  nextId: 'ING_SWAPS_L2' },
      { label: '🥜 Allergy-safe swaps', nextId: 'ING_SWAPS_L2' },
      { label: '🌶️ Set my spice level', nextId: 'SPICE_LEVELS_L2' },
      { label: '🍛 Back to the curries', nextId: 'CURRY_SELECTION_INFO' },
    ],
  },

  SPICE_LEVELS_L2: {
    id: 'SPICE_LEVELS_L2', level: 2, shortLabel: 'Spice Levels',
    message:
      "**The Five Spice Levels**\n\nKha! 🙏 You're in control — you set the heat for each dish at your own station and adjust as you taste.\n\n- **The Farang** — herb-forward, barely any heat\n- **Thai Smile** — a friendly tingle\n- **Respect** — the balanced standard\n- **Thai Spicy** — how a local family eats\n- **Akha Warrior** — an honest wall of fire\n\nMild, fragrant options are always there. Where to next?",
    options: [
      { label: '🍛 Choose a curry',     nextId: 'CURRY_SELECTION_INFO' },
      { label: '🔧 Your version',       nextId: 'RECIPE_ADAPTATIONS_L2' },
      { label: '🌿 Akha dishes',        nextId: 'AKHA_DISHES_INFO' },
      { label: '🎟️ The classes',        nextId: 'INFO_CLASSES' },
    ],
  },

  // ── FOOD · curry detail L2 (con media) ─────────────────────────────────────
  CURRY_GREEN_DETAIL: {
    id: 'CURRY_GREEN_DETAIL', level: 2, shortLabel: 'Green Curry',
    message:
      "**Green Curry**\n\nKha! 🙏 The brightest of the four — its glow comes from **fresh green chilies pounded young**, with sweet basil worked straight into the paste in our highland version. Galangal and lemongrass bring the citrus snap.\n\nYou crack the coconut cream, fry the paste till fragrant, and balance it as you go. Here's the dish and its key ingredients:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'Thai-Green-Curry-04',
        title: 'Thai Green Curry', description: 'The full recipe — paste, timing, plating.',
        action: 'nav_recipe', data: { slug: 'authentic-thai-green-curry-recipe' } },
      { kind: 'gallery', layout: 'grid', title: 'Key ingredients',
        assetIds: ['green-chilli-01', 'galangal-01', 'lemongrass-01'],
        names: ['Fresh Green Chili', 'Galangal', 'Lemongrass'] },
    ],
    options: [
      { label: '❤️ Red Curry',          nextId: 'CURRY_RED_DETAIL' },
      { label: '🔧 Your version',       nextId: 'RECIPE_ADAPTATIONS_L2' },
      { label: '🍛 All curries',        nextId: 'CURRY_SELECTION_INFO' },
      { label: '🎟️ Join a class',       nextId: 'INFO_CLASSES' },
    ],
  },

  CURRY_RED_DETAIL: {
    id: 'CURRY_RED_DETAIL', level: 2, shortLabel: 'Red Curry',
    message:
      "**Red Curry**\n\nKha! 🙏 The bold classic, built on **sun-dried red chilies** pounded with lemongrass, galangal, kaffir lime and turmeric. Our highland version adds fresh wild turmeric, unique to the North.\n\nThe move that makes it: crack the coconut cream first, then fry the paste in until the oil rises and the aroma blooms. Take a look:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'Thai-Red-Curry-04',
        title: 'Thai Red Curry', description: 'Hand-pounded paste, the full method.',
        action: 'nav_recipe', data: { slug: 'authentic-thai-red-curry-recipe' } },
    ],
    options: [
      { label: '💚 Green Curry',        nextId: 'CURRY_GREEN_DETAIL' },
      { label: '🤎 Massaman',           nextId: 'CURRY_MASSAMAN_DETAIL' },
      { label: '🔧 Your version',       nextId: 'RECIPE_ADAPTATIONS_L2' },
      { label: '🎟️ Join a class',       nextId: 'INFO_CLASSES' },
    ],
  },

  CURRY_MASSAMAN_DETAIL: {
    id: 'CURRY_MASSAMAN_DETAIL', level: 2, shortLabel: 'Massaman',
    message:
      "**Massaman Curry**\n\nKha! 🙏 The gentle, warm-spiced one — shaped by old spice-trade routes. **Cinnamon, cardamom and star anise** unfold slowly over a low simmer with potato and ground peanut.\n\nIt's the mildest of the four and the most unexpected: soft, rich, a little sweet. Patience does the work. Here it is:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'Thai-Massaman-04',
        title: 'Thai Massaman Curry', description: 'Slow-simmered, spice-trade warmth.',
        action: 'nav_recipe', data: { slug: 'authentic-thai-massaman-curry-recipe' } },
    ],
    options: [
      { label: '🧡 Panang',             nextId: 'CURRY_PANANG_DETAIL' },
      { label: '❤️ Red Curry',          nextId: 'CURRY_RED_DETAIL' },
      { label: '🔧 Your version',       nextId: 'RECIPE_ADAPTATIONS_L2' },
      { label: '🎟️ Join a class',       nextId: 'INFO_CLASSES' },
    ],
  },

  CURRY_PANANG_DETAIL: {
    id: 'CURRY_PANANG_DETAIL', level: 2, shortLabel: 'Panang',
    message:
      "**Panang Curry**\n\nKha! 🙏 The thick, clinging one — less a broth, more a sauce that coats each bite. Its secret is **roasted peanuts pounded into the paste**, finished with julienned kaffir lime leaves.\n\nYou reduce the coconut milk down with the paste until it turns glossy and rich. No vegetables to dilute it. Take a look:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'Thai-Panang-04',
        title: 'Thai Panang Curry', description: 'Thick, rich, reduction-style.',
        action: 'nav_recipe', data: { slug: 'authentic-thai-panang-curry-recipe' } },
    ],
    options: [
      { label: '🤎 Massaman',           nextId: 'CURRY_MASSAMAN_DETAIL' },
      { label: '💚 Green Curry',        nextId: 'CURRY_GREEN_DETAIL' },
      { label: '🔧 Your version',       nextId: 'RECIPE_ADAPTATIONS_L2' },
      { label: '🎟️ Join a class',       nextId: 'INFO_CLASSES' },
    ],
  },

  // ── FOOD · Akha dish detail L2 (con media) ─────────────────────────────────
  AKHA_SALAD_DETAIL: {
    id: 'AKHA_SALAD_DETAIL', level: 2, shortLabel: 'Mountain Salad',
    message:
      "**Akha Mountain Fresh Salad**\n\nKha! 🙏 The Akha garden on a plate — **no oil, no cooking**, just garden vegetables and lime. The peanuts go on last, placed by hand on top, a small act of hospitality.\n\nIt's one of the three Akha dishes always eaten together. Here it is, with its key ingredients:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'Akha-Salad-04',
        title: 'Akha Mountain Fresh Salad', description: 'The full no-cook recipe.',
        action: 'nav_recipe', data: { slug: 'authentic-akha-mountain-salad-recipe' } },
      { kind: 'gallery', layout: 'grid', title: 'Key ingredients',
        assetIds: ['tomato-01', 'coriander-01', 'roasted-peanuts-01'],
        names: ['Tomato', 'Coriander', 'Roasted Peanuts'] },
    ],
    options: [
      { label: '🌶️ Sapi Thong',         nextId: 'SAPI_THONG_DETAIL' },
      { label: '🍵 Spirit Soup',        nextId: 'AKHA_SOUP_DETAIL' },
      { label: '🔧 Your version',       nextId: 'RECIPE_ADAPTATIONS_L2' },
      { label: '🎟️ Join a class',       nextId: 'INFO_CLASSES' },
    ],
  },

  SAPI_THONG_DETAIL: {
    id: 'SAPI_THONG_DETAIL', level: 2, shortLabel: 'Sapi Thong',
    message:
      "**Sapi Thong — Akha Chili Dip**\n\nKha! 🙏 The Akha signature you **won't find in restaurants** — boiled tomatoes pounded in the stone mortar with chili, garlic, coriander and roasted peanuts until smoky and chunky.\n\nIt's at the centre of every family meal. Read the philosophy behind it, or see the dish:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'Sapi-Thong-04',
        title: 'Sapi Thong', description: 'The smoky Akha chili dip, by hand.',
        action: 'nav_recipe', data: { slug: 'traditional-akha-sapi-thong-recipe' } },
    ],
    options: [
      { label: '🥗 Mountain Salad',     nextId: 'AKHA_SALAD_DETAIL' },
      { label: '🍵 Spirit Soup',        nextId: 'AKHA_SOUP_DETAIL' },
      { label: '🌿 Food philosophy',    nextId: 'AKHA_PHILOSOPHY_L2' },
      { label: '🎟️ Join a class',       nextId: 'INFO_CLASSES' },
    ],
  },

  AKHA_SOUP_DETAIL: {
    id: 'AKHA_SOUP_DETAIL', level: 2, shortLabel: 'Spirit Soup',
    message:
      "**Akha Spirit Soup**\n\nKha! 🙏 A clear, restorative broth the Akha reach for to **heal and rebalance**. By tradition it's built on water, mountain vegetables and bruised lemongrass — gentle, fragrant, finished with sweet basil.\n\nIt rounds out the Akha trio at the table. Here's the recipe:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'Akha-Spirit-Soup-04',
        title: 'Akha Spirit Soup', description: 'The clear, restorative broth.',
        action: 'nav_recipe', data: { slug: 'akha-spirit-detox-soup-recipe' } },
    ],
    options: [
      { label: '🥗 Mountain Salad',     nextId: 'AKHA_SALAD_DETAIL' },
      { label: '🌶️ Sapi Thong',         nextId: 'SAPI_THONG_DETAIL' },
      { label: '🔧 Your version',       nextId: 'RECIPE_ADAPTATIONS_L2' },
      { label: '🎟️ Join a class',       nextId: 'INFO_CLASSES' },
    ],
  },

  // ── INGREDIENTS · swaps condiviso (filtrato per allergia) ──────────────────
  ING_SWAPS_L2: {
    id: 'ING_SWAPS_L2', level: 2, shortLabel: 'Swaps & Substitutes',
    message:
      "**Swaps & Substitutes**\n\nKha! 🙏 Almost everything has a clean stand-in, set up at your own station before cooking:\n\n- **fish sauce** → Northern Thai soy or salt + herbs\n- **chicken stock** → mushroom stock\n- **meat** → fresh tofu\n- **peanuts/cashews** → toasted pumpkin seeds\n\nNothing on your tray crosses with anyone else's. What would you like to do?",
    options: [
      { label: '🍛 See the curries',    nextId: 'CURRY_SELECTION_INFO' },
      { label: '🌿 Akha dishes',        nextId: 'AKHA_DISHES_INFO' },
      { label: '🌶️ Spice levels',       nextId: 'SPICE_LEVELS_L2' },
      { label: '🎟️ Join a class',       nextId: 'INFO_CLASSES' },
    ],
  },

  // ── CULTURE L2 (deep + linkCard; audio quando NodeAudio è pronto) ──────────
  AKHA_ZANG_L2: {
    id: 'AKHA_ZANG_L2', level: 2, shortLabel: 'Akha Zang — deeper',
    message:
      "**The Akha Zang — The Oral Constitution**\n\nKha! 🙏 The Zang covers six domains of life — farming, the forest, family, social order, the ritual calendar, and the relationship between living, dead and spirits.\n\nWhat makes it extraordinary: it lives **entirely in memory**. Each elder, the Dzöma, holds a section and passes it on by chanting and practice. No priests, no temple — the knowledge lives in people. Read the full story:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'akha-zang-01',
        title: 'The Akha Way', description: 'Living by the Akha Zang — full article.',
        action: 'nav_culture', data: { slug: 'akha-zang' } },
    ],
    options: [
      { label: '🚪 The Spirit Gate',   nextId: 'AKHA_SPIRITGATE_L1' },
      { label: '⛰️ Origins',           nextId: 'AKHA_ORIGINS_L2' },
      { label: '🌿 Food philosophy',   nextId: 'AKHA_PHILOSOPHY_L2' },
      { label: '⛰️ Culture hub',       nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  AKHA_ORIGINS_L2: {
    id: 'AKHA_ORIGINS_L2', level: 2, shortLabel: 'Origins — deeper',
    message:
      "**Three Subgroups, One Migration**\n\nKha! 🙏 The Akha split into three branches — **Ulo, Pamee and Lomi** — each with its own dialect and dress, all tracing back to the Sipsongpanna region of Yunnan.\n\nThe routes aren't written in books — they live in genealogy chants, in the coins on a headdress, in place names carried in oral poetry. Read the full journey:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'historical-roots-01',
        title: 'The Journey from the Plateau', description: 'The Akha migration, in full.',
        action: 'nav_culture', data: { slug: 'akha-migration-history-routes' } },
    ],
    options: [
      { label: '👘 Traditional Dress', nextId: 'AKHA_DRESS_L2' },
      { label: '📜 The Akha Zang',     nextId: 'AKHA_ZANG_L2' },
      { label: '🎡 Swing Festival',    nextId: 'AKHA_FESTIVAL_L2' },
      { label: '⛰️ Culture hub',       nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  AKHA_PHILOSOPHY_L2: {
    id: 'AKHA_PHILOSOPHY_L2', level: 2, shortLabel: 'Food Philosophy — deeper',
    message:
      "**Coffee, Forest, and the Healing Table**\n\nKha! 🙏 Two faces of the Akha food philosophy. The **forest pantry** is the old way — wild herbs, roots and leaves foraged for centuries, many with real medicinal use. The **coffee revolution** is the new — Arabica grown on the same slopes that once held opium, protecting the forest while bringing income.\n\nBoth connect the forest, the body and the table. Read the story:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'food-as-medicine-01',
        title: 'Food as Medicine', description: 'Why every Akha meal is a daily prescription.',
        action: 'nav_culture', data: { slug: 'akha-food-as-medicine-healing' } },
    ],
    options: [
      { label: '🌿 Akha dishes',       nextId: 'AKHA_DISHES_INFO' },
      { label: '📜 The Akha Zang',     nextId: 'AKHA_ZANG_L2' },
      { label: '🚪 The Spirit Gate',   nextId: 'AKHA_SPIRITGATE_L1' },
      { label: '⛰️ Culture hub',       nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  AKHA_DRESS_L2: {
    id: 'AKHA_DRESS_L2', level: 2, shortLabel: 'Dress — deeper',
    message:
      "**The Meaning of Silver**\n\nKha! 🙏 The silver on a headdress isn't about wealth — it's believed to **hold protective energy**, deflecting harm and anchoring the soul. The coins themselves are revealing: old Burmese, French Indochinese and Yunnan pieces, a physical archive of the migration routes.\n\nReading a headdress is reading a map. Read the full piece:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'traditional-dress-01',
        title: 'The Language of Silver', description: "The women's headdress, decoded.",
        action: 'nav_culture', data: { slug: 'traditional-akha-dress-silver' } },
    ],
    options: [
      { label: '⛰️ Origins',           nextId: 'AKHA_ORIGINS_L2' },
      { label: '🎡 Swing Festival',    nextId: 'AKHA_FESTIVAL_L2' },
      { label: '📜 The Akha Zang',     nextId: 'AKHA_ZANG_L2' },
      { label: '⛰️ Culture hub',       nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  AKHA_FESTIVAL_L2: {
    id: 'AKHA_FESTIVAL_L2', level: 2, shortLabel: 'Swing Festival — deeper',
    message:
      "**The Ritual of the Swing**\n\nKha! 🙏 Swinging during Yehkuja isn't play — it's a **ritual act**. The higher a woman swings, the closer to the celestial lands and the stronger her prayer for the harvest.\n\nThe four poles stand for the four directional spirits, and the swing must be built in a single day, with prayers and offerings at each pole. Read the full ritual:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'swing-festival-01',
        title: 'The Sacred Swing Festival', description: 'Yehkuja, the full ritual.',
        action: 'nav_culture', data: { slug: 'akha-swing-festival-yehkuja' } },
    ],
    options: [
      { label: '👘 Traditional Dress', nextId: 'AKHA_DRESS_L2' },
      { label: '📜 The Akha Zang',     nextId: 'AKHA_ZANG_L2' },
      { label: '🚪 The Spirit Gate',   nextId: 'AKHA_SPIRITGATE_L1' },
      { label: '⛰️ Culture hub',       nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  AKHA_SPIRITGATE_L2: {
    id: 'AKHA_SPIRITGATE_L2', level: 2, shortLabel: 'Spirit Gate — deeper',
    message:
      "**The Gate as a Filter**\n\nKha! 🙏 The Loku-Pah works like a **membrane** — protective spirits invited in through prayer and offerings, harm deflected by the carvings and the construction ritual.\n\nThe yearly rebuild isn't maintenance: it's a complete renewal of the contract between village and spirit world. A gate dismantled wrongly leaves the village exposed. Read the full meaning:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'spirit-gate-01',
        title: 'The Sacred Spirit Gate', description: "Loku-Pah's meaning, in full.",
        action: 'nav_culture', data: { slug: 'sacred-akha-spirit-gate-meaning' } },
    ],
    options: [
      { label: '📜 The Akha Zang',     nextId: 'AKHA_ZANG_L2' },
      { label: '🌿 Food philosophy',   nextId: 'AKHA_PHILOSOPHY_L2' },
      { label: '⛰️ Origins',           nextId: 'AKHA_ORIGINS_L2' },
      { label: '⛰️ Culture hub',       nextId: 'AKHA_CULTURE_HUB' },
    ],
  },

  // ── CLASSES / LOGISTICS L2 ─────────────────────────────────────────────────
  MORNING_DETAILS: {
    id: 'MORNING_DETAILS', level: 2, shortLabel: 'Morning Class',
    message:
      "**Morning Class with Market Tour**\n\nKha! 🙏 The fullest experience. You start at a local market with your Akha teacher — tasting, asking, choosing the day's ingredients — then cook a full spread of dishes back at the open-air kitchen, eating as you go.\n\nIt's ideal if you want the whole story: culture, market, technique. You leave with a recipe booklet, a small gift, and free hotel pickup. Shall we?",
    options: [
      { label: '🌙 Evening Class',      nextId: 'EVENING_DETAILS' },
      { label: '🚐 Pickup & Meeting',   nextId: 'PICKUP_INFO' },
      { label: '🎁 What you take home', nextId: 'GIFT_CERTIFICATE' },
      { label: '📅 Open booking',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  EVENING_DETAILS: {
    id: 'EVENING_DETAILS', level: 2, shortLabel: 'Evening Class',
    message:
      "**Evening Class & Dinner**\n\nKha! 🙏 The relaxed, twilight version — no market tour, straight to the kitchen as the day cools. You take your own station, cook a full spread hands-on, and everyone sits together to eat the dinner they just made.\n\nPerfect if you're short on time but want a real home-cooked Thai dinner. Recipe booklet, gift and pickup all included. Shall we?",
    options: [
      { label: '☀️ Morning Class',      nextId: 'MORNING_DETAILS' },
      { label: '🚐 Pickup & Meeting',   nextId: 'PICKUP_INFO' },
      { label: '🎁 What you take home', nextId: 'GIFT_CERTIFICATE' },
      { label: '📅 Open booking',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  GIFT_CERTIFICATE: {
    id: 'GIFT_CERTIFICATE', level: 2, shortLabel: 'Take Home',
    message:
      "**What You Take Home**\n\nKha! 🙏 Everyone leaves with a **printed recipe booklet** of the dishes you cooked, a **participation certificate** signed by the chef, and a small ingredient gift to carry the flavours home.\n\nThe booklet is the real keeper — notes and all, so you can cook it again at your own table. Where to next?",
    options: [
      { label: '☀️ Morning Class',      nextId: 'MORNING_DETAILS' },
      { label: '🌙 Evening Class',      nextId: 'EVENING_DETAILS' },
      { label: '🍛 Flavours & Dishes',  nextId: 'FLAVOURS_HUB' },
      { label: '📅 Open booking',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  PICKUP_RULES: {
    id: 'PICKUP_RULES', level: 2, shortLabel: 'Pickup Rules',
    message:
      "**Pickup — How It Works**\n\nKha! 🙏 A few simple things: we confirm your spot and time by WhatsApp the evening before, so please be ready about **5 minutes early** — Chiang Mai traffic can be unpredictable.\n\nThe driver speaks English. Not sure if your hotel is in the zone? Share the address in the booking notes and we'll confirm — we cover the whole Old City moat and Nimman. How can I help?",
    options: [
      { label: '📍 Meeting Point',      nextId: 'MEETING_POINT' },
      { label: '🚐 Pickup info',        nextId: 'PICKUP_INFO' },
      { label: '🎟️ The classes',        nextId: 'INFO_CLASSES' },
      { label: '📅 Open booking',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  MEETING_POINT: {
    id: 'MEETING_POINT', level: 2, shortLabel: 'Meeting Point',
    message:
      "**Meeting Point — Wat Pan Whaen**\n\nKha! 🙏 Our central meeting point is **Wat Pan Whaen Temple**, on the south side of the Old City moat — an easy landmark. The driver waits there with a sign showing your name.\n\nWalking from the Old City, it's 5–10 minutes; by tuk-tuk, just say \"Wat Pan Whaen\". Want the map or the rules?",
    options: [
      { label: '🗺️ Open pickup map',    nextId: 'PICKUP_INFO', action: 'open_map' },
      { label: '📋 Pickup rules',       nextId: 'PICKUP_RULES' },
      { label: '🎟️ The classes',        nextId: 'INFO_CLASSES' },
      { label: '📅 Open booking',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  // ── NEWS / GUIDE L2 (pratiche; linkCard → articolo) ────────────────────────
  NEWS_HOW_CLASS_WORKS: {
    id: 'NEWS_HOW_CLASS_WORKS', level: 2, shortLabel: 'How It Works',
    message:
      "**Inside the Class — How It Works**\n\nKha! 🙏 From the moment you arrive it's hands-on: you pound the paste, control the heat, plate the dish. The class flows through about **11 recipes** — appetisers, the three Akha specialties, your curry, a soup, a stir-fry, dessert — eaten as you go.\n\nRead the full behind-the-scenes guide:",
    blocks: [
      { kind: 'linkCard', layout: 'compact', assetId: 'news-00-photo03',
        title: 'How the Class Works', description: 'A full step-by-step walkthrough.',
        action: 'nav_news', data: { slug: 'how-thai-cooking-class-works' } },
    ],
    options: [
      { label: '☀️ Morning Class',      nextId: 'MORNING_DETAILS' },
      { label: '🌙 Evening Class',      nextId: 'EVENING_DETAILS' },
      { label: '🎒 How to prepare',     nextId: 'NEWS_PREP_GUIDE' },
      { label: '📅 Open booking',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  NEWS_PREP_GUIDE: {
    id: 'NEWS_PREP_GUIDE', level: 2, shortLabel: 'How to Prepare',
    message:
      "**How to Prepare**\n\nKha! 🙏 A few things smooth the day: wear light clothes and closed shoes, bring a little walking comfort for the market, and **come hungry** — you'll eat everything you cook.\n\nFlag any dietary needs at booking so your station is set in advance. The class runs rain or shine. Read the full prep guide:",
    blocks: [
      { kind: 'linkCard', layout: 'compact', assetId: 'news-01-photo00',
        title: 'Preparing for Your Class', description: 'Packing, timing, first-timer tips.',
        action: 'nav_news', data: { slug: 'prepare-thai-cooking-class-chiang-mai' } },
    ],
    options: [
      { label: '🍳 How it works',       nextId: 'NEWS_HOW_CLASS_WORKS' },
      { label: '☀️ Morning Class',      nextId: 'MORNING_DETAILS' },
      { label: '🚐 Pickup & Meeting',   nextId: 'PICKUP_INFO' },
      { label: '📅 Open booking',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  NEWS_DIET_GUIDE: {
    id: 'NEWS_DIET_GUIDE', level: 2, shortLabel: 'Dietary Guide',
    message:
      "**Dietary Customisation**\n\nKha! 🙏 Every person cooks their own version. Vegan? Your wok never meets fish sauce or meat. Gluten-free, kosher, halal, Jain? All handled — no pre-packaged products means we control every ingredient.\n\nThe three Akha specialties are plant-based by tradition, and all four curries come in full vegan and vegetarian versions. Read the detailed guide:",
    blocks: [
      { kind: 'linkCard', layout: 'compact', assetId: 'news-02-photo00',
        title: 'Vegan & Vegetarian Guide', description: 'Every swap, dish by dish.',
        action: 'nav_news', data: { slug: 'vegan-vegetarian-thai-cooking-guide' } },
    ],
    options: [
      { label: '🔧 Your version',       nextId: 'RECIPE_ADAPTATIONS_L2' },
      { label: '🥜 Allergy guide',      nextId: 'NEWS_ALLERGY_GUIDE' },
      { label: '🌿 Akha dishes',        nextId: 'AKHA_DISHES_INFO' },
      { label: '📅 Open booking',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  NEWS_ALLERGY_GUIDE: {
    id: 'NEWS_ALLERGY_GUIDE', level: 2, shortLabel: 'Allergy Guide',
    message:
      "**Allergy Protocols**\n\nKha! 🙏 Everything is cooked from scratch — no bottled sauces — so we control every ingredient. The common ones we handle: peanuts, shellfish, gluten, dairy, egg. For severe allergies we set up a **dedicated workspace** before class to remove cross-contamination.\n\nLife-threatening allergy? Email us before booking. Read the full protocol:",
    blocks: [
      { kind: 'linkCard', layout: 'compact', assetId: 'news-04-photo00',
        title: 'Allergy-Safe Cooking', description: 'Which dish, which allergen, which swap.',
        action: 'nav_news', data: { slug: 'allergy-safe-thai-cooking-protocols' } },
    ],
    options: [
      { label: '🔧 Your version',       nextId: 'RECIPE_ADAPTATIONS_L2' },
      { label: '🌱 Dietary guide',      nextId: 'NEWS_DIET_GUIDE' },
      { label: '🍽️ See the dishes',     nextId: 'FLAVOURS_HUB' },
      { label: '📅 Open booking',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  NEWS_SPICE_GUIDE: {
    id: 'NEWS_SPICE_GUIDE', level: 2, shortLabel: 'Spice Guide',
    message:
      "**Thai Spice Levels**\n\nKha! 🙏 Five levels, from **The Farang** (no heat, all aroma) to the fearless **Akha Warrior**. You set yours at the start and the chef tunes every dish — and you adjust as you taste.\n\nThe wild Akha pepper, Mak Khen, isn't really hot — it's fragrant and numbing, more like Sichuan pepper. Read the full guide:",
    blocks: [
      { kind: 'linkCard', layout: 'compact', assetId: 'news-15-photo00',
        title: 'Thai Spice Levels Guide', description: 'Each level, dish by dish.',
        action: 'nav_news', data: { slug: 'thai-spice-levels-guide' } },
    ],
    options: [
      { label: '🌶️ Set my level',       nextId: 'SPICE_LEVELS_L2' },
      { label: '🍛 The curries',        nextId: 'CURRY_SELECTION_INFO' },
      { label: '🌿 Akha dishes',        nextId: 'AKHA_DISHES_INFO' },
      { label: '📅 Open booking',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },
};
