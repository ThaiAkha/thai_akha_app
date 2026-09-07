// ─────────────────────────────────────────────────────────────────────────────
// askCherry — General — Logistics, Pickup, Meeting Point, Booking, Gifts
// Modulo della ragnatela Cherry. Aggiungi qui nuovi nodi per questo tema.
// Merge automatico in chatFlowData.ts via spread.
// ─────────────────────────────────────────────────────────────────────────────
import type { ChatNode } from './chatFlowTypes';

export const flowGeneral: Record<string, ChatNode> = {
  ROOT: {
    id: 'ROOT',
    message: "Sawasdee kha! 🙏 I'm Cherry, your guide to Thai Akha Kitchen. Whether you're planning your first cooking class, exploring our menu, or curious about Akha hill tribe culture — I'm here to help. Every class is hands-on, small group, and led by chefs with genuine Akha heritage. What would you like to know?",
    options: [
      { label: '📚 Classes & Info',   nextId: 'INFO_CLASSES',    priority: 1 },
      { label: '🍽️ Menu & Diet',      nextId: 'MENU_DIET',       priority: 1 },
      { label: '🚐 Free Pickup',      nextId: 'PICKUP_INFO',     priority: 1 },
      { label: '⛰️ Akha Culture',     nextId: 'AKHA_CULTURE_HUB', priority: 3 },
    ],
  },

  // PICKUP_INFO, PICKUP_RULES e MEETING_POINT vivono nelle bozze L1/L2 (che vincono
  // sui nodi omonimi): le copie storiche sono state tolte il 2026-09-07.

  BOOK_NOW: {
    id: 'BOOK_NOW',
    shortLabel: '📅 Book a Class',
    priority: 1,
    message: "**Ready to Book Your Class?**\n\nYou can check availability and reserve your spot directly on our booking page — pick your preferred date and we'll confirm within 24 hours.\n\nPrefer to reach us directly?\n\n- 📧 office@thaiakhakitchen.com\n- 📱 +66 61 325 4611 (WhatsApp available)\n\nAll dietary preferences — vegan, vegetarian, gluten-free, allergy-specific — are fully accommodated. Just add a note at booking. Free pickup from the Old City and Nimman is included in the price.",
    options: [
      { label: '📅 Open Booking Page',  nextId: 'BOOK_NOW',        action: 'nav_booking', priority: 1 },
      { label: '📰 How to Prepare',     nextId: 'NEWS_PREP_GUIDE', priority: 1 },
      { label: '🚐 Free Pickup Info',   nextId: 'PICKUP_INFO',     priority: 1 },
      { label: '🍽️ Menu & Dietary',     nextId: 'MENU_DIET',       priority: 2 },
    ],
  },

  GIFT_CERTIFICATE: {
    id: 'GIFT_CERTIFICATE',
    priority: 2,
    message: "**What You Take Home After Class**\n\nEvery student leaves with three things: a **personalised recipe book** containing all the dishes cooked during class (yours to keep and cook at home), a **participation certificate** signed by the chef, and a **digital photo gallery** of your experience at the kitchen.\n\nThese aren't afterthoughts — the recipe book is printed specifically for you with notes on substitutions for your dietary profile. Many guests tell us it becomes one of their most-used cookbooks. The certificate is also a practical souvenir: it records which class you attended, the date, and the dishes you cooked.",
    options: [
      { label: '📅 Open Booking Page', nextId: 'BOOK_NOW',        action: 'nav_booking', priority: 1 },
      { label: '☀️ Morning Class',     nextId: 'MORNING_DETAILS', priority: 1 },
      { label: '🌙 Evening Class',     nextId: 'EVENING_DETAILS', priority: 1 },
      { label: '🍽️ Menu & Dietary',    nextId: 'MENU_DIET',       priority: 2 },
    ],
  },
};
