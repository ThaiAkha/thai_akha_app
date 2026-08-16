/**
 * Gemini Live (voice) model id — SINGLE SOURCE OF TRUTH per front + admin.
 *
 * ⚠️ Deve essere l'id COMPLETO: un alias corto (es. 'gemini-2.5-flash-native-audio')
 * fa fallire `ai.live.connect` → onerror → la voce non parte. Aggiornare qui SOLO
 * quando si cambia versione del modello, così front e admin restano allineati.
 */
export const GEMINI_LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

/**
 * Cherry AI pre-defined prompt templates.
 *
 * Language strategy: prompts are stored in English only.
 * Cherry responds in the user's language automatically (Language Chameleon).
 * Future: hook useTranslatedPrompt will translate these on-demand via API + cache.
 */
export const cherryPrompts = {
  classes: {
    philosophy: "Tell me about the cooking school philosophy",
    menu: "What's included in the full menu?",
    booking: "How do I book a cooking class?"
  },
  recipes: {
    category: (name: string) => `Tell me more about the ${name} culinary tradition`,
    dish: (name: string, diet: string, allergies: string) =>
      `I am thinking of making ${name}. My diet is ${diet}${allergies ? ` and I am allergic to ${allergies}` : ''}. Can you help?`
  },
  history: {
    general: "Tell me about the Akha hill tribe culture and traditions"
  },
  quiz: {
    explain: (topic: string) => `Can you explain more about ${topic}?`
  }
} as const;

export type CherryPromptKey = keyof typeof cherryPrompts;
