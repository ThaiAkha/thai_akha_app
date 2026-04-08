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
};

export interface CherryUserContext {
  isLogged: boolean;
  name?: string;
  dietary_profile?: string;
  allergies?: string[];
  preferred_spiciness?: string;
}

/**
 * Dynamic Prompt Compiler (Cherry 2.1)
 * Decoupled from Supabase: Knowledge is purely static (RAG)
 * for peak performance and security.
 */
export const buildCherryPrompt = (userContext: CherryUserContext): string => {
  let dynamicUserBlock: string;

  if (userContext.isLogged) {
    const allergyString =
      userContext.allergies?.length ? userContext.allergies.join(', ') : 'None reported';
    dynamicUserBlock = [
      'CURRENT USER CONTEXT:',
      '- Status: LOGGED IN',
      `- Name: ${userContext.name || 'Guest'}`,
      `- Dietary Profile: ${userContext.dietary_profile || 'Regular'}`,
      `- Allergies: ${allergyString}`,
      `- Preferred Spiciness: ${userContext.preferred_spiciness || 'Not selected'}`,
    ].join('\n');
  } else {
    dynamicUserBlock = [
      'CURRENT USER CONTEXT:',
      '- Status: GUEST (Not logged in)',
      '- Dietary Needs & Allergies: UNKNOWN',
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
