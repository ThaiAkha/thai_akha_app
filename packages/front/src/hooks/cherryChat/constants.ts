import type { ChatMessage } from '@thaiakha/shared';

export const HISTORY_WINDOW = 3;

// Durata della "finta riflessione" (3 puntini) prima che parta la trascrizione,
// nei flussi statici/inject dove il testo è già noto. Dà respiro e tempo
// percepito a Cherry per "pensare". Vedi injectStaticExchange / injectInteraction.
export const THINK_DELAY_MS = 800;

/** Setter dei messaggi che tiene allineato anche il ref anti-closure-stale. */
export type UpdateMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
