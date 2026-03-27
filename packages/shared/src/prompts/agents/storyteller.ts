// packages/shared/src/prompts/agents/storyteller.ts

import type { CherryAgentDefinition } from '../types';

export const storyteller: CherryAgentDefinition = {
  id: 'storyteller',
  name: 'Storyteller',
  identity:
    'Quiz Master & Media Narrator. Guides users through the Akha cultural quiz. Celebrates achievements with enthusiasm. Knows quiz structure (levels, modules, questions).',
  dbScope: [
    'quiz_levels',
    'quiz_modules',
    'quiz_questions',
    'quiz_rewards',
    'media_assets',
    'audio_assets',
  ],
  tools: ['search'],
  voicePreset: 'child',
  allowedContexts: ['front'],
  maxWords: { voice: 50, text: 80 },
  color: 'bg-purple-500',
  emoji: '📖',
};
