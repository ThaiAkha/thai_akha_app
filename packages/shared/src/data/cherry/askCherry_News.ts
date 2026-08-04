// ─────────────────────────────────────────────────────────────────────────────
// askCherry — News — Practical how-to guides
// Modulo della ragnatela Cherry. Aggiungi qui nuovi nodi per questo tema.
// Merge automatico in chatFlowData.ts via spread.
// ─────────────────────────────────────────────────────────────────────────────
import type { ChatNode } from './chatFlowTypes';

export const flowNews: Record<string, ChatNode> = {
  NEWS_HOW_CLASS_WORKS: {
    id: 'NEWS_HOW_CLASS_WORKS',
    priority: 1,
    message: "**Inside the Thai Akha Experience — How It Works**\n\nFrom the moment you arrive, everything is personalised. You choose your dietary preferences, you pick your curry, and you cook at your own station alongside the chef. It's not a demonstration — you pound the paste, you control the heat, you plate the dish. The class flows through about 11 recipes: appetisers, the three Akha mountain specialties, your chosen curry, a soup, a stir-fry, and dessert.\n\nFor the morning class, the market tour comes first — roughly 45 minutes walking through Warorot or Muang Mai with your chef explaining every ingredient you'll use. We've written a full behind-the-scenes guide with photos and a step-by-step breakdown if you want to know exactly what to expect before you arrive.",
    options: [
      { label: '📖 Read the Full Guide', nextId: 'INFO_CLASSES',   action: 'nav_news',    data: { slug: 'how-thai-cooking-class-works' }, priority: 1 },
      { label: '☀️ Morning Class',       nextId: 'MORNING_DETAILS', priority: 1 },
      { label: '🌙 Evening Class',       nextId: 'EVENING_DETAILS', priority: 1 },
      { label: '📅 Open Booking Page',   nextId: 'BOOK_NOW',        action: 'nav_booking', priority: 1 },
    ],
  },

  NEWS_PREP_GUIDE: {
    id: 'NEWS_PREP_GUIDE',
    priority: 1,
    message: "**How to Prepare for Your Cooking Class**\n\nA few things make the experience much smoother: wear clothes you don't mind getting a little fragrant (chili paste and garlic are powerful), bring comfortable shoes since the market tour involves some walking, and arrive hungry — you'll be eating everything you cook.\n\nIf you have dietary restrictions, note them in your booking in advance so we can prepare substitutions before the day. The class runs regardless of rain — the school is fully covered and the market tour works even in light rain. We've put together a complete preparation guide with a packing list, timing advice, and answers to the most common first-timer questions.",
    options: [
      { label: '📖 Read the Full Guide', nextId: 'MORNING_DETAILS', action: 'nav_news',    data: { slug: 'prepare-thai-cooking-class-chiang-mai' }, priority: 1 },
      { label: '☀️ Morning Class',       nextId: 'MORNING_DETAILS', priority: 1 },
      { label: '🌙 Evening Class',       nextId: 'EVENING_DETAILS', priority: 1 },
      { label: '📅 Open Booking Page',   nextId: 'BOOK_NOW',        action: 'nav_booking', priority: 1 },
    ],
  },

  NEWS_DIET_GUIDE: {
    id: 'NEWS_DIET_GUIDE',
    priority: 2,
    message: "**Dietary Customisation — Your Wok, Your Rules**\n\nEvery person in the class cooks their own version of each dish. If you're vegan, your wok never touches fish sauce or meat. If you're gluten-free, we substitute soy sauce with tamari. If you keep kosher or halal, we accommodate that too — no pre-packaged products means we control every ingredient.\n\nThe three Akha mountain specialties are 100% plant-based by tradition, so no adaptation is needed there. All four curry options — red, green, massaman, and panang — are available in full vegan, vegetarian, and regular versions. We've written a detailed guide to every dietary option we offer, including exactly which substitutions we make for each dish.",
    options: [
      { label: '📖 Read the Full Guide', nextId: 'SET_VEGAN',       action: 'nav_news',    data: { slug: 'vegan-vegetarian-thai-cooking-guide' }, priority: 1 },
      { label: '🌱 I Cook Vegan',        nextId: 'SET_VEGAN',       action: 'set_diet',    data: { diet: 'vegan' }, priority: 2 },
      { label: '🥬 I Cook Vegetarian',   nextId: 'SET_VEGETARIAN',  action: 'set_diet',    data: { diet: 'vegetarian' }, priority: 2 },
      { label: '⚠️ I have Allergies',    nextId: 'ALLERGY_INFO',    priority: 2 },
    ],
  },

  NEWS_ALLERGY_GUIDE: {
    id: 'NEWS_ALLERGY_GUIDE',
    priority: 2,
    message: "**Allergy Protocols at Thai Akha Kitchen**\n\nWe cook everything from scratch — no pre-packaged curry pastes, no bottled sauces — which means we have full ingredient control. The most common allergies we accommodate are peanuts, shellfish, gluten, dairy, and egg. For severe allergies, we prepare a dedicated workspace before the class to eliminate cross-contamination risk.\n\nIf your allergy is life-threatening, please email us before booking so we can discuss your class in detail. We've welcomed guests with serious peanut and shellfish allergies many times and have a clear protocol for each case. Our full allergy guide explains exactly which dishes contain which allergens and what substitutions we offer for each one.",
    options: [
      { label: '📖 Read the Full Guide', nextId: 'ALLERGY_INFO',    action: 'nav_news',    data: { slug: 'allergy-safe-thai-cooking-protocols' }, priority: 1 },
      { label: '🌱 Vegan Options',       nextId: 'SET_VEGAN',       action: 'set_diet',    data: { diet: 'vegan' }, priority: 2 },
      { label: '🍽️ Explore the Menu',    nextId: 'MENU_DIET',       priority: 2 },
      { label: '📅 Open Booking Page',   nextId: 'BOOK_NOW',        action: 'nav_booking', priority: 1 },
    ],
  },

  NEWS_SPICE_GUIDE: {
    id: 'NEWS_SPICE_GUIDE',
    priority: 2,
    message: "**Thai Spice Levels — From Gentle to Warrior**\n\nWe use a five-level spice scale at Thai Akha Kitchen: The Aromatic Gateway (no heat, all flavour), The Friendly Tingle, The Thai Standard, The Chiang Mai Heat, and — for the fearless — The Akha Warrior. You set your level at the start of class and the chef adjusts every dish accordingly.\n\nThe chili pastes we use come from two sources: dried long red chilies for red curry and Sapi Thong, and fresh green chilies for green curry. The wild Akha pepper (Mak Khen) is not technically hot — it's fragrant and numbing, more like Sichuan pepper than chili heat. Our full spice guide explains each level with dish-specific notes so you can set expectations before you arrive.",
    options: [
      { label: '📖 Read the Spice Guide', nextId: 'AKHA_DISHES_INFO', action: 'nav_news', data: { slug: 'thai-spice-levels-guide' }, priority: 1 },
      { label: '🌿 Akha Dishes',          nextId: 'AKHA_DISHES_INFO', priority: 2 },
      { label: '🍛 Curry Options',        nextId: 'CURRY_SELECTION_INFO', priority: 2 },
      { label: '📅 Open Booking Page',    nextId: 'BOOK_NOW',           action: 'nav_booking', priority: 1 },
    ],
  },
};
