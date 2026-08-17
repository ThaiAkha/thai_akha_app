import { AGENT_IDENTITY } from './subagents/01-identity';
import { AGENT_SPICES_ALLERGIES } from './subagents/02-spices-allergies';
import { AGENT_RECIPES } from './subagents/03-recipes';
import { AGENT_AKHA_HISTORY } from './subagents/04-akha-history';
import { AGENT_CLASSES_BOOKING } from './subagents/05-classes-booking';
import { AGENT_EXAMPLES } from './subagents/06-examples';

/**
 * Cherry UI branding and configuration
 */
export const cherryFront = {
  name: 'Cherry',
  personality: 'Friendly, expert Akha cooking instructor, with a touch of Thai warmth. You often use "kha" at the end of sentences.',
  voiceName: 'Sulafat', // Gemini Live prebuilt voice
  // ⚠️ Deve combaciare con GEMINI_LIVE_MODEL in @thaiakha/shared/lib/cherry-prompts.
  // Questo file è un symlink dal brain → NON può importare l'alias @thaiakha/shared
  // (Vite risolve dal path reale nel brain, fuori dal package). Tenere id COMPLETO.
  liveModel: 'gemini-2.5-flash-native-audio-preview-12-2025',
};

/**
 * Ruoli NON-cliente: staff interno + agency. Sul sito pubblico B2C ricevono un
 * trattamento collegiale (niente booking-push, niente personalizzazione-cliente).
 * I dati/azioni operativi vivono nell'app ADMIN (multi-Cherry per ruolo), NON qui.
 */
const NON_CUSTOMER_ROLES = new Set([
  'admin', 'manager', 'kitchen', 'driver', 'logistic', 'logistics', 'agency',
]);
const isStaffRole = (role?: string): boolean =>
  !!role && NON_CUSTOMER_ROLES.has(role.toLowerCase());

export interface CherryUserContext {
  isLogged: boolean;
  /** Ruolo DB (profiles.role). Se staff/agency → tono collegiale, no booking-push. */
  role?: string;
  name?: string;
  dietary_profile?: string;
  allergies?: string[];
  preferred_spiciness?: string;
  /** Stato della prossima prenotazione (solo loggati). Guida la response policy. */
  booking_state?: 'none' | 'future' | 'imminent';
  /** Giorni mancanti alla classe prenotata (se presente). */
  days_until_class?: number;
  /** Tipo classe prenotata: 'morning' | 'evening'. */
  session_type?: string;
}

/**
 * Dynamic Prompt Compiler (Cherry 2.1)
 * Decoupled from Supabase: Knowledge is purely static (RAG)
 * for peak performance and security.
 */
export const buildCherryPrompt = (userContext: CherryUserContext): string => {
  let dynamicUserBlock: string;

  // ── Personalization rule (applies whenever we know the user) ────────────────
  // Active but NEVER repetitive: facts are applied silently, mentioned only when
  // relevant or asked. Never open an answer with "Since you are vegan…".
  const NON_REPEAT_RULE =
    'PERSONALIZATION RULE: Apply the user\'s known facts (diet, allergies, spice, booking) SILENTLY. ' +
    'Mention a personal fact ONLY if it is directly relevant to the question or explicitly asked. ' +
    'NEVER open a reply with "Since you are vegan…" or restate a fact already covered earlier in this session.';

  if (userContext.isLogged && isStaffRole(userContext.role)) {
    // ── STAFF / AGENCY sul sito pubblico (Chameleon) ──────────────────────────
    // Membro del team che naviga il B2C: NON è un cliente. Niente push booking,
    // niente personalizzazione-cliente (dieta/allergie), tono diretto e collegiale.
    // Dati/azioni operativi → app ADMIN (multi-Cherry per ruolo), non qui.
    dynamicUserBlock = [
      'CURRENT USER CONTEXT:',
      `- Status: LOGGED IN — TEAM MEMBER (role: ${userContext.role}) browsing the public site`,
      `- Name: ${userContext.name || 'Colleague'}`,
      'RESPONSE POLICY (staff on public site): This is a Thai Akha team member, NOT a customer. ' +
      'Do NOT push booking, do NOT surface prices or booking CTAs, do NOT personalize with customer diet/allergies. ' +
      'Be warm, direct and collegial. For internal/operational data (bookings, guests, payouts, market, pickup ops) ' +
      'point them to the Admin app assistant. Answer public-content questions (recipes, culture, class info) normally kha.',
    ].join('\n');
  } else if (userContext.isLogged) {
    const allergyString =
      userContext.allergies?.length ? userContext.allergies.join(', ') : 'None reported';
    const bookingState = userContext.booking_state ?? 'none';

    // Response policy that changes with booking state (the 2nd axis).
    let bookingPolicy: string;
    if (bookingState === 'imminent') {
      bookingPolicy = [
        `- Booking: CONFIRMED, IMMINENT (${userContext.session_type || 'class'} in ${userContext.days_until_class ?? 0} day(s)).`,
        'RESPONSE POLICY (booking imminent): They know the basics already. Do NOT volunteer prices or generic class info. Focus on last-mile details if asked (meeting point, what to bring, inclusions/exclusions). You may give a brief, warm reminder only if relevant. NO booking push.',
      ].join('\n');
    } else if (bookingState === 'future') {
      bookingPolicy = [
        `- Booking: CONFIRMED, upcoming (${userContext.session_type || 'class'} in ${userContext.days_until_class ?? 0} day(s)).`,
        'RESPONSE POLICY (has booking): Assume they know prices and general logistics. Do NOT repeat prices or generic info unless asked. Focus on details (what is included/excluded, what to bring, dietary adaptations). Almost no booking push.',
      ].join('\n');
    } else {
      bookingPolicy = [
        '- Booking: none yet.',
        'RESPONSE POLICY (logged, no booking): Personalize with their diet/allergies. You may gently orient toward booking when relevant — soft, never pushy (at most ~1 in 4 replies).',
      ].join('\n');
    }

    dynamicUserBlock = [
      'CURRENT USER CONTEXT:',
      '- Status: LOGGED IN',
      `- Name: ${userContext.name || 'Guest'}`,
      `- Dietary Profile: ${userContext.dietary_profile || 'Regular'}`,
      `- Allergies: ${allergyString}`,
      `- Preferred Spiciness: ${userContext.preferred_spiciness || 'Not selected'}`,
      bookingPolicy,
      NON_REPEAT_RULE,
    ].join('\n');
  } else {
    dynamicUserBlock = [
      'CURRENT USER CONTEXT:',
      '- Status: GUEST (Not logged in)',
      '- Dietary Needs & Allergies: UNKNOWN',
      'RESPONSE POLICY (guest): This guest likely has no booking. Surface practical value — prices, that free hotel pickup is included, and what they get from a class. Gently orient toward booking, but only when relevant (at most ~1 in 4 replies). Never hard-sell.',
    ].join('\n');
  }

  return [
    AGENT_IDENTITY,
    '',
    dynamicUserBlock,
    '',
    '--- MASTER KNOWLEDGE BASE ---',
    '',
    AGENT_SPICES_ALLERGIES,
    '',
    AGENT_RECIPES,
    '',
    AGENT_AKHA_HISTORY,
    '',
    AGENT_CLASSES_BOOKING,
    '',
    AGENT_EXAMPLES,
    '',
    '## GUIDELINES',
    '1. Be concise but warm.',
    '2. If you don\'t know something about a specific recipe not in your knowledge base, say you\'ll ask the chef.',
    '3. Always prioritize user safety regarding allergies.',
  ]
    .join('\n')
    .trim();
};
