// ─────────────────────────────────────────────────────────────────────────────
// askCherry — Classes — Morning / Evening cooking class details
// Modulo della ragnatela Cherry. Aggiungi qui nuovi nodi per questo tema.
// Merge automatico in chatFlowData.ts via spread.
// ─────────────────────────────────────────────────────────────────────────────
import type { ChatNode } from './chatFlowTypes';

export const flowClasses: Record<string, ChatNode> = {
  INFO_CLASSES: {
    id: 'INFO_CLASSES',
    priority: 1,
    message: "We offer two cooking experiences in Chiang Mai — both in small groups, hands-on, with genuine Akha recipes.\n\n- ☀️ **Morning Class** — 8:30 AM–12:30 PM · 1,400 THB · guided market tour before cooking\n- 🌙 **Evening Class** — 4:30 PM–7:30 PM · 1,300 THB · cook a full Thai dinner and eat together\n\nBoth include a personalised recipe book, a participation certificate, and free pickup from the Old City or Nimman area. All dietary preferences are fully accommodated.",
    options: [
      { label: '☀️ Morning Class',        nextId: 'MORNING_DETAILS',     priority: 1 },
      { label: '🌙 Evening Class',        nextId: 'EVENING_DETAILS',     priority: 1 },
      { label: '📰 How the Class Works',  nextId: 'NEWS_HOW_CLASS_WORKS', priority: 1 },
      { label: '🚐 Free Pickup',          nextId: 'PICKUP_INFO',         priority: 1 },
    ],
  },

  MORNING_DETAILS: {
    id: 'MORNING_DETAILS',
    priority: 1,
    message: "**Morning Cooking Class with Market Tour**\n\n⏰ 8:30 AM – 12:30 PM\n💰 1,400 THB\n👥 Small groups only\n\nYour morning starts at the local Warorot or Muang Mai market, where your chef guides you through the stalls — explaining fresh herbs, seasonal produce, and the ingredients that make Northern Thai cuisine unique. Back at the school, you cook 5 to 6 dishes by hand: curry pastes pounded in the mortar, Akha mountain specialties, and classic Thai recipes. The market tour is what makes this class unlike any other — you understand every ingredient before it reaches the wok.\n\nEveryone takes home a recipe book and a personalised certificate. Free pickup included.",
    hasRandomOption: true,
    options: [
      { label: '📅 Open Booking Page',    nextId: 'BOOK_NOW',           action: 'nav_booking', priority: 1 },
      { label: '🌙 Evening Class',        nextId: 'EVENING_DETAILS',    priority: 1 },
      { label: '📰 How to Prepare',       nextId: 'NEWS_PREP_GUIDE',    priority: 1 },
      { label: '🎁 Gifts & Certificate',  nextId: 'GIFT_CERTIFICATE',   priority: 2 },
    ],
  },

  EVENING_DETAILS: {
    id: 'EVENING_DETAILS',
    priority: 1,
    message: "**Evening Cooking Class & Dinner**\n\n⏰ 4:30 PM – 7:30 PM\n💰 1,300 THB\n👥 Small groups only\n\nThe evening class is designed for a relaxed, social experience. You arrive at the school, choose your dietary preferences, and cook 5 to 6 Thai dishes from scratch — including fresh curry paste pounded by hand, Akha specialties, and your choice of soup and stir-fry. At the end, everyone sits together and eats the dinner they just cooked. No market tour, but the cooking experience is identical to the morning class.\n\nIdeal for couples, friends, or anyone who prefers a slower-paced evening over an early start. Recipe book, certificate, and free pickup all included.",
    hasRandomOption: true,
    options: [
      { label: '📅 Open Booking Page',    nextId: 'BOOK_NOW',           action: 'nav_booking', priority: 1 },
      { label: '☀️ Morning Class',        nextId: 'MORNING_DETAILS',    priority: 1 },
      { label: '📰 How to Prepare',       nextId: 'NEWS_PREP_GUIDE',    priority: 1 },
      { label: '🎁 Gifts & Certificate',  nextId: 'GIFT_CERTIFICATE',   priority: 2 },
    ],
  },
};
