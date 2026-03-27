// packages/shared/src/prompts/orchestrator.ts

import { CHERRY_BASE_IDENTITY } from './base-identity';
import { ALL_AGENTS } from './agents';
import type { CherryAgentDefinition, CherryOrchestrator } from './types';

// ─── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Selects the most appropriate agent for a given context + role.
 * Front default: cooking_chef (highest intent frequency).
 * Admin default: internal_staff; agency role -> agency_copilot.
 */
function getAgent(appContext: 'front' | 'admin', userRole?: string): CherryAgentDefinition {
  if (appContext === 'admin') {
    if (userRole === 'agency') return getAgentById('agency_copilot')!;
    return getAgentById('internal_staff')!;
  }
  return getAgentById('cooking_chef')!;
}

function getAgentById(id: string): CherryAgentDefinition | undefined {
  return ALL_AGENTS.find((a) => a.id === id);
}

/**
 * Security guard: verifies the agent is permitted for the given context.
 * Front users CANNOT activate admin-only agents (agency_copilot, internal_staff).
 */
export function isAgentAllowed(
  agent: CherryAgentDefinition,
  appContext: 'front' | 'admin',
  _userRole?: string
): boolean {
  if (!agent.allowedContexts.includes(appContext)) return false;
  if (
    appContext === 'front' &&
    (agent.id === 'agency_copilot' || agent.id === 'internal_staff')
  ) {
    return false;
  }
  return true;
}

/**
 * Builds the final system prompt for a specific agent, injecting:
 * - Base Cherry identity (immutable)
 * - Agent role + identity block
 * - User context (name, dietary, allergies)
 * - DB scope declaration
 * - Handover capability (if tools include transfer_to_agent)
 * - Mode constraints (voice vs text word limits)
 */
function buildPrompt(
  agent: CherryAgentDefinition,
  userProfile: any,
  dietaryKey: string,
  allergies: string[],
  isVoiceMode: boolean,
  appContext: 'front' | 'admin' = 'front'
): string {
  const wordLimit = isVoiceMode ? agent.maxWords.voice : agent.maxWords.text;

  // Name block
  const firstName = (userProfile?.full_name as string | undefined)?.split(' ')[0] ?? '';
  const nameBlock = firstName
    ? `You are talking to "${firstName}". Use their name naturally.`
    : 'The user is a guest. Call them "Khun" politely.';

  // Allergy block (safety-critical — always prominent)
  let allergyBlock = '';
  if (allergies && allergies.length > 0) {
    const list = allergies.join(', ');
    allergyBlock = `
### CRITICAL ALLERGY ALERT: ${list.toUpperCase()}
User is allergic to: ${list}. Always state: "We will prepare without [Allergen] for safety kha."
`;
  }

  // DB scope block
  const scopeBlock = `
### DATA SCOPE (Authorized Tables)
You may ONLY reference data from: ${agent.dbScope.join(', ')}.
Do NOT hallucinate data from other sources.
`;

  // Handover block (only if agent has transfer_to_agent tool)
  let transferBlock = '';
  if (agent.tools.includes('transfer_to_agent')) {
    const otherAgents = ALL_AGENTS
      .filter((a) => a.id !== agent.id && a.allowedContexts.includes(appContext))
      .map((a) => `${a.id} (${a.name})`)
      .join(', ');
    transferBlock = `
### HANDOVER CAPABILITY
If the user's question falls outside your expertise, you may transfer to another specialist. Available agents: ${otherAgents}.
To transfer, simply state: "Let me connect you with our [specialist name]" and shift your responses to match that domain.
`;
  }

  // Mode constraints
  const modeBlock = isVoiceMode
    ? `\n### VOICE MODE\nMax ${wordLimit} words. Warm spoken rhythm. End with 'kha'.\n`
    : `\n### TEXT MODE\nMax ${wordLimit} words. Use Markdown formatting.\n`;

  return `${CHERRY_BASE_IDENTITY}
### ACTIVE AGENT: ${agent.name.toUpperCase()}
${agent.identity}

### GUEST CONTEXT
- Name: ${firstName || 'Guest'}
- ${nameBlock}
- Dietary: ${dietaryKey || 'regular'}
${allergyBlock}
${scopeBlock}
${transferBlock}
${modeBlock}`;
}

// ─── Public orchestrator ───────────────────────────────────────────────────────

export const orchestrator: CherryOrchestrator = {
  getAgent,
  getAgentById,
  buildPrompt,
};
