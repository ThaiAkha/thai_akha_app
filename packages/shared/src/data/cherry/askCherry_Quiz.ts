// ─────────────────────────────────────────────────────────────────────────────
// askCherry — Quiz — Akha Wisdom Path teaser
// Modulo della ragnatela Cherry. Aggiungi qui nuovi nodi per questo tema.
// Merge automatico in chatFlowData.ts via spread.
// ─────────────────────────────────────────────────────────────────────────────
import type { ChatNode } from './chatFlowTypes';

export const flowQuiz: Record<string, ChatNode> = {
  QUIZ_TEASER: {
    id: 'QUIZ_TEASER',
    shortLabel: '🎮 Quiz',
    priority: 3,
    message: "**Akha Wisdom Path — Test Your Knowledge**\n\nThe full quiz has 21 questions across three levels: Easy (Akha origins, the Zang, the Swing Festival), Medium (genealogy system, traditional music, highland ingredients), and Expert (Akha cosmology, the Spirit Gate, culinary philosophy). Each level unlocks a special cultural card.\n\nComplete all three levels and earn your **Akha Expert Certificate** — plus a chance to win exclusive prizes from Thai Akha Kitchen. The quiz is free, plays directly in the app, and takes about 10 minutes to complete. It's the deepest dive into Akha culture available outside the classroom.",
    options: [
      { label: '🎮 Open Quiz Page',    nextId: 'QUIZ_TEASER',        action: 'nav_quiz',    priority: 3 },
      { label: '⛰️ Akha Culture Hub',  nextId: 'AKHA_CULTURE_HUB',  priority: 3 },
      { label: '📜 Explore Akha Zang', nextId: 'AKHA_ZANG_L1',      priority: 3 },
      { label: '📅 Book a Class',      nextId: 'BOOK_NOW',           action: 'nav_booking', priority: 1 },
    ],
  },
};
