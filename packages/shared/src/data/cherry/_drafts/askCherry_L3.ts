// ─────────────────────────────────────────────────────────────────────────────
// askCherry_L3 — DRAFT (2026-06-10) · nodi L3 ricchi-terminali.
//
// L3 = approfondimento PIÙ RICCO + TERMINALE (vedi Cherry_Master_Schema.md):
//   • Testo più profondo (plain title, senza icona).
//   • MEDIA piena: linkCard hero (→ pagina) + gallery + AUDIO (NodeAudio reale).
//   • TERMINALE: le 4 opzioni ESCONO a un hub / quiz / booking (chiude il ciclo).
//   • Inglese, voce Digital Elder.
//
// ⚠️ DRAFT non importato: NON cablato. Richiede NodeAudio nella union (✅ aggiunto
//    a chatFlowTypes.ts) + il ramo render `audio` in CherryRichBlocks (lavoro engine).
//    `assetId` audio/foto: alcuni reali (akha-zang-01, recipe-akha-specialty-0x,
//    historical-roots-01, akha-men-01), foto-pagina da media_assets da verificare.
// ─────────────────────────────────────────────────────────────────────────────
import type { ChatNode } from '../chatFlowTypes';


export const flowL3: Record<string, ChatNode> = {
  // ── CULTURE L3 (deepest + linkCard + audio) ────────────────────────────────
  AKHA_ZANG_L3: {
    id: 'AKHA_ZANG_L3', level: 3, shortLabel: 'Akha Zang — the archive',
    message:
      "**The Living Archive**\n\nKha! 🙏 The most remarkable thing about the Zang is its genealogy: every Akha can recite their ancestry back through **60 or more named generations** — sometimes over 1,500 years. Not myth — a social technology for holding identity across borders and migrations, with no written records.\n\nAt its core is **Pyaw**, the balance between the human world and the spirit world. Break it through taboo and it must be ritually mended. It's why certain trees can't be cut, and why every meal begins with a small offering.",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'akha-zang-01',
        title: 'The Akha Way', description: 'Living by the Akha Zang — the full article.',
        action: 'nav_culture', data: { slug: 'akha-zang' } },
      { kind: 'audio', assetId: 'akha-zang-01', title: '🎧 Listen kha' },
    ],
    options: [
      { label: '🎮 Test your knowledge', nextId: 'QUIZ_TEASER' },
      { label: '⛰️ More Akha culture',   nextId: 'AKHA_CULTURE_HUB' },
      { label: '🍛 Flavours & Dishes',   nextId: 'FLAVOURS_HUB' },
      { label: '📅 Join a class',        nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  AKHA_ORIGINS_L3: {
    id: 'AKHA_ORIGINS_L3', level: 3, shortLabel: 'Origins — the heartland',
    message:
      "**The Sipsongpanna Heartland**\n\nKha! 🙏 Before Thailand there was **Sipsongpanna**, in southern Yunnan — the shared cradle of the Akha and their cousins the Hani. Same language family, same animist roots.\n\nOver centuries the branches drifted: the Hani built vast terraced rice fields and stayed; the Akha kept migrating south into the rugged mountains, carrying the Zang with them. Two branches of one tree, divided by borders but joined at the root. You can still hear it in the shared words and songs.",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'historical-roots-01',
        title: 'The Journey from the Plateau', description: 'The full Akha migration story.',
        action: 'nav_culture', data: { slug: 'akha-migration-history-routes' } },
      { kind: 'audio', assetId: 'historical-roots-01', title: '🎧 Listen kha' },
    ],
    options: [
      { label: '🎮 Test your knowledge', nextId: 'QUIZ_TEASER' },
      { label: '👘 Traditional Dress',   nextId: 'AKHA_DRESS_L2' },
      { label: '⛰️ Culture hub',         nextId: 'AKHA_CULTURE_HUB' },
      { label: '📅 Join a class',        nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  AKHA_PHILOSOPHY_L3: {
    id: 'AKHA_PHILOSOPHY_L3', level: 3, shortLabel: 'Food Philosophy — the pharmacy',
    message:
      "**The Forest Pharmacy**\n\nKha! 🙏 Take the philosophy to its root and you reach the forest itself. The Akha draw on **16 wild plants** for everyday healing and food — garlic for stings, bamboo ash for wounds, papaya for digestion — knowledge held in memory, never written.\n\nThis is the food-as-medicine worldview made literal: the forest is the pharmacy, the kitchen the clinic, and the cook the one who keeps the balance. Every dish you make carries a little of that.",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'food-as-medicine-01',
        title: 'Food as Medicine', description: 'The Akha healing table, in full.',
        action: 'nav_culture', data: { slug: 'akha-food-as-medicine-healing' } },
    ],
    options: [
      { label: '🌿 Akha dishes',         nextId: 'AKHA_DISHES_INFO' },
      { label: '🎮 Test your knowledge', nextId: 'QUIZ_TEASER' },
      { label: '⛰️ Culture hub',         nextId: 'AKHA_CULTURE_HUB' },
      { label: '📅 Join a class',        nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  AKHA_DRESS_L3: {
    id: 'AKHA_DRESS_L3', level: 3, shortLabel: 'Dress — the textile code',
    message:
      "**The Textile Code**\n\nKha! 🙏 Indigo-dyed cotton is the base of Akha dress — grown, harvested and processed by hand, darkening with each wash so **older garments are deeper and more prestigious** than new ones.\n\nThe embroidery is stitched in a set order: diagonal grid, animal motifs, then clan-specific geometry. Each motif has a name and a belief — the rooster sits near the collar because it calls the sun and keeps evil from crossing into daylight. No element is arbitrary.",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'traditional-dress-01',
        title: 'The Language of Silver', description: "The women's headdress, decoded.",
        action: 'nav_culture', data: { slug: 'traditional-akha-dress-silver' } },
    ],
    options: [
      { label: '🎡 Swing Festival',      nextId: 'AKHA_FESTIVAL_L2' },
      { label: '🎮 Test your knowledge', nextId: 'QUIZ_TEASER' },
      { label: '⛰️ Culture hub',         nextId: 'AKHA_CULTURE_HUB' },
      { label: '📅 Join a class',        nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  AKHA_FESTIVAL_L3: {
    id: 'AKHA_FESTIVAL_L3', level: 3, shortLabel: 'Festival — the full ritual',
    message:
      "**The Full Ritual Complex**\n\nKha! 🙏 Beyond the swing, Yehkuja runs four days: **ancestral offerings** on day one, food placed at the spirit gate and household altars; **call-and-response singing** on days two and three, recounting migration history and genealogy; and a **communal feast** on day four for the Agriculture Goddess.\n\nThe feast food is cooked together — every family contributing, the women cooking by the rules of the Zang. That communal cooking is the direct ancestor of what we do every single day.",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'swing-festival-01',
        title: 'The Sacred Swing Festival', description: 'Yehkuja, the full ritual.',
        action: 'nav_culture', data: { slug: 'akha-swing-festival-yehkuja' } },
      { kind: 'audio', assetId: 'akha-men-01', title: '🎧 Listen kha' },
    ],
    options: [
      { label: '🎮 Test your knowledge', nextId: 'QUIZ_TEASER' },
      { label: '🚪 The Spirit Gate',     nextId: 'AKHA_SPIRITGATE_L2' },
      { label: '⛰️ Culture hub',         nextId: 'AKHA_CULTURE_HUB' },
      { label: '📅 Join a class',        nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  AKHA_SPIRITGATE_L3: {
    id: 'AKHA_SPIRITGATE_L3', level: 3, shortLabel: 'Spirit Gate — the guardians',
    message:
      "**The Carved Guardians**\n\nKha! 🙏 Flanking the gate stand carved male and female figures — fertility and continuity, the spear and the weaving basket — together holding the whole social and cosmic order.\n\n⚠️ For a visitor it's simple but serious: the Spirit Gate is a **living sacred object**, never to be touched, leaned on, or walked beneath. Photos are usually fine if you ask. Understanding that boundary is where Akha hospitality — and our cooking — really begins.",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'spirit-gate-01',
        title: 'The Sacred Spirit Gate', description: "Loku-Pah's full meaning.",
        action: 'nav_culture', data: { slug: 'sacred-akha-spirit-gate-meaning' } },
    ],
    options: [
      { label: '📜 The Akha Zang',       nextId: 'AKHA_ZANG_L2' },
      { label: '🎮 Test your knowledge', nextId: 'QUIZ_TEASER' },
      { label: '⛰️ Culture hub',         nextId: 'AKHA_CULTURE_HUB' },
      { label: '📅 Join a class',        nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  // ── AKHA HERO RECIPES L3 (deepest + linkCard + gallery + audio) ────────────
  AKHA_SALAD_L3: {
    id: 'AKHA_SALAD_L3', level: 3, shortLabel: 'Mountain Salad — deep',
    message:
      "**Akha Mountain Salad — the full story**\n\nKha! 🙏 What makes it distinctly Akha is what's *missing*: **no fish sauce, no oil** — lime is the only acid. Each ingredient has a traditional role: cucumber cools the body, lime stirs digestion, fresh herbs restore energy after fieldwork.\n\nYou dress and finish it entirely by hand, the peanuts placed last on top. Listen to the story, then take the recipe home:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'Akha-Salad-04',
        title: 'Akha Mountain Fresh Salad', description: 'The full no-cook recipe.',
        action: 'nav_recipe', data: { slug: 'authentic-akha-mountain-salad-recipe' } },
      { kind: 'gallery', layout: 'grid', title: 'Key ingredients',
        assetIds: ['tomato-01', 'coriander-01', 'lime-01'],
        names: ['Tomato', 'Coriander', 'Lime'] },
      { kind: 'audio', assetId: 'recipe-akha-salad', title: '🎧 Listen kha' },
    ],
    options: [
      { label: '🌶️ Sapi Thong',         nextId: 'SAPI_THONG_L3' },
      { label: '🍵 Spirit Soup',        nextId: 'AKHA_SOUP_L3' },
      { label: '🌿 Food philosophy',    nextId: 'AKHA_PHILOSOPHY_L2' },
      { label: '📅 Join a class',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  SAPI_THONG_L3: {
    id: 'SAPI_THONG_L3', level: 3, shortLabel: 'Sapi Thong — deep',
    message:
      "**Sapi Thong — the full story**\n\nKha! 🙏 Sapi Thong is never blended — the slow pounding of dried chili, garlic, shallot and **wild Mak Khen pepper** in a heavy stone mortar is what builds its smoky depth. A blender physically can't make it.\n\nIn Akha homes it's pounded fresh every morning and served with rice and vegetables. The aroma when the wild pepper hits the mortar is unforgettable. Listen, then take it home:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'Sapi-Thong-04',
        title: 'Sapi Thong', description: 'The smoky Akha chili dip, by hand.',
        action: 'nav_recipe', data: { slug: 'traditional-akha-sapi-thong-recipe' } },
      { kind: 'audio', assetId: 'recipe-akha-sapi-thong', title: '🎧 Listen kha' },
    ],
    options: [
      { label: '🥗 Mountain Salad',     nextId: 'AKHA_SALAD_L3' },
      { label: '🍵 Spirit Soup',        nextId: 'AKHA_SOUP_L3' },
      { label: '🌿 Food philosophy',    nextId: 'AKHA_PHILOSOPHY_L2' },
      { label: '📅 Join a class',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },

  AKHA_SOUP_L3: {
    id: 'AKHA_SOUP_L3', level: 3, shortLabel: 'Spirit Soup — deep',
    message:
      "**Akha Spirit Soup — the full story**\n\nKha! 🙏 The absolute rule: **no meat ever enters this soup** — not even broth. The base is water, mountain vegetables and wild herbs, drunk to restore the body after heavy work or illness.\n\nThe vegetables shift with the season and the morning market. You learn to know the herbs by smell before they hit the pot. One of the most quietly medicinal dishes in the whole Akha repertoire. Listen, then take it home:",
    blocks: [
      { kind: 'linkCard', layout: 'hero', assetId: 'Akha-Spirit-Soup-04',
        title: 'Akha Spirit Soup', description: 'The clear, restorative broth.',
        action: 'nav_recipe', data: { slug: 'akha-spirit-detox-soup-recipe' } },
      { kind: 'audio', assetId: 'recipe-akha-herbal-soup', title: '🎧 Listen kha' },
    ],
    options: [
      { label: '🥗 Mountain Salad',     nextId: 'AKHA_SALAD_L3' },
      { label: '🌶️ Sapi Thong',         nextId: 'SAPI_THONG_L3' },
      { label: '🌿 Food philosophy',    nextId: 'AKHA_PHILOSOPHY_L2' },
      { label: '📅 Join a class',       nextId: 'BOOK_NOW', action: 'nav_booking' },
    ],
  },
};
