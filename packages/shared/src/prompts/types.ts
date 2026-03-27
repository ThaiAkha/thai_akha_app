// packages/shared/src/prompts/types.ts

export interface CherryAgentDefinition {
  id: string;
  name: string;
  identity: string;
  dbScope: string[];
  tools: ('search' | 'voice' | 'transfer_to_agent')[];
  voicePreset: string;
  allowedContexts: ('front' | 'admin')[];
  maxWords: { voice: number; text: number };
  color: string;   // Tailwind bg class, es. 'bg-orange-500'
  emoji: string;   // es. '🍳'
}

export interface CherryOrchestrator {
  getAgent(appContext: 'front' | 'admin', userRole?: string): CherryAgentDefinition;
  getAgentById(id: string): CherryAgentDefinition | undefined;
  buildPrompt(
    agent: CherryAgentDefinition,
    userProfile: any,
    dietaryKey: string,
    allergies: string[],
    isVoiceMode: boolean,
    appContext?: 'front' | 'admin'
  ): string;
}
