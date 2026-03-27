// packages/shared/src/prompts/agents/index.ts

export { agencyCopilot } from './agency-copilot';
export { internalStaff } from './internal-staff';
export { heritageGuru } from './heritage-guru';
export { cookingChef } from './cooking-chef';
export { storyteller } from './storyteller';
export { thaiTeacher } from './thai-teacher';

import { agencyCopilot } from './agency-copilot';
import { internalStaff } from './internal-staff';
import { heritageGuru } from './heritage-guru';
import { cookingChef } from './cooking-chef';
import { storyteller } from './storyteller';
import { thaiTeacher } from './thai-teacher';
import type { CherryAgentDefinition } from '../types';

export const ALL_AGENTS: CherryAgentDefinition[] = [
  agencyCopilot,
  internalStaff,
  heritageGuru,
  cookingChef,
  storyteller,
  thaiTeacher,
];
