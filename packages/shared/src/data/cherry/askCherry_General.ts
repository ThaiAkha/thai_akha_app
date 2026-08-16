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

  PICKUP_INFO: {
    id: 'PICKUP_INFO',
    shortLabel: '🚐 Pickup Service',
    priority: 1,
    message: "**Free Pickup — Included in the Price**\n\nWe pick you up from your hotel, guesthouse, or a central meeting point within the Old City moat or Nimman Nimmanhaemin area — at no extra cost. Our driver speaks English, arrives on time, and will contact you via WhatsApp the evening before to confirm the exact pickup spot and time.\n\nIf you're staying outside the pickup zone, you can walk or take a tuk-tuk to our designated meeting point at Wat Pan Whaen Temple (south side of the Old City moat). The school is approximately 10 minutes by car from most Old City hotels.",
    hasRandomOption: true,
    options: [
      { label: '🗺️ View Pickup Map',   nextId: 'MEETING_POINT',  action: 'open_map',    priority: 1 },
      { label: '📍 Meeting Point',     nextId: 'MEETING_POINT',  priority: 1 },
      { label: '📋 Pickup Rules',      nextId: 'PICKUP_RULES',   priority: 1 },
      { label: '📅 Open Booking Page', nextId: 'BOOK_NOW',       action: 'nav_booking', priority: 1 },
    ],
  },

  PICKUP_RULES: {
    id: 'PICKUP_RULES',
    priority: 1,
    message: "**Pickup Rules & What to Expect**\n\n✅ Confirm your pickup time and location via WhatsApp or email at least one day before your class.\n✅ Please be ready at your pickup spot 5 minutes before the agreed time — traffic in Chiang Mai can be unpredictable.\n✅ Our driver speaks English and will send you a confirmation message the evening before.\n✅ Flexible start times are available — just ask when booking if you need an earlier or later pickup.\n\nIf you're unsure whether your hotel is within the pickup zone, share your address in the booking notes and we'll confirm. We cover the entire Old City moat area and Nimman Nimmanhaemin.",
    options: [
      { label: '🗺️ View Pickup Map',   nextId: 'MEETING_POINT',  action: 'open_map',    priority: 1 },
      { label: '📍 Meeting Point',     nextId: 'MEETING_POINT',  priority: 1 },
      { label: '☀️ About the Classes', nextId: 'INFO_CLASSES',   priority: 1 },
      { label: '📅 Open Booking Page', nextId: 'BOOK_NOW',       action: 'nav_booking', priority: 1 },
    ],
  },

  MEETING_POINT: {
    id: 'MEETING_POINT',
    priority: 1,
    message: "**Meeting Point — Wat Pan Whaen Temple**\n\nOur central meeting point is Wat Pan Whaen Temple, located on the south side of the Old City moat — one of the most recognisable landmarks in central Chiang Mai. The driver will be there with a sign showing your name.\n\nIf you're walking from the Old City, it's a 5 to 10 minute walk from most guesthouses. If you're using a tuk-tuk or songthaew, just say \"Wat Pan Whaen\" and they'll know exactly where to go. The pickup map shows the exact location with all surrounding landmarks.",
    options: [
      { label: '🗺️ Open Pickup Map',   nextId: 'MEETING_POINT',  action: 'open_map',    priority: 1 },
      { label: '📋 Pickup Rules',      nextId: 'PICKUP_RULES',   priority: 1 },
      { label: '☀️ About the Classes', nextId: 'INFO_CLASSES',   priority: 1 },
      { label: '📅 Open Booking Page', nextId: 'BOOK_NOW',       action: 'nav_booking', priority: 1 },
    ],
  },

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
