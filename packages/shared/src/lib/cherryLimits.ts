// ─────────────────────────────────────────────────────────────────────────────
// cherryLimits — quanto puo' essere lungo un messaggio dell'ospite.
//
// In CARATTERI, non in parole: dodici lingue, e il thai non separa le parole.
// Il campo di input non lascia scrivere oltre (maxLength), e sendMessage
// rifiuta comunque quel che lo supera, senza chiamare la edge e senza salvare
// la riga. La edge gemini-proxy-chat tiene la sua rete di sicurezza a 4.000
// caratteri (MAX_MESSAGE_CHARS): questo valore deve restarle sotto.
//
// Fino al 2026-09-07 il campo non aveva limite: un testo incollato oltre i
// 4.000 caratteri tornava dalla edge come 400, il client lo mostrava come
// "kitchen is very busy", e la riga finiva comunque nel database.
// ─────────────────────────────────────────────────────────────────────────────

/** Tetto per un messaggio (una domanda a una scuola di cucina ne usa di norma meno di 200). */
export const CHERRY_MESSAGE_MAX_CHARS = 1000;
/** Da questa frazione del tetto il campo mostra il contatore. */
export const CHERRY_MESSAGE_WARN_RATIO = 0.8;

export interface MessageLength {
  length: number;
  max: number;
  /** Vicino al tetto: il contatore compare. */
  nearLimit: boolean;
  /** Al tetto: il campo non accetta altro, il contatore lo dice col colore. */
  atLimit: boolean;
  /** Oltre il tetto: possibile solo fuori dal campo (voce, preset). Non parte. */
  tooLong: boolean;
}

/** Misura come misura la edge (`.length`), cosi' i due tetti parlano la stessa lingua. */
export function measureMessage(text: string, max = CHERRY_MESSAGE_MAX_CHARS): MessageLength {
  const length = text.length;
  return {
    length,
    max,
    nearLimit: length >= Math.ceil(max * CHERRY_MESSAGE_WARN_RATIO),
    atLimit: length >= max,
    tooLong: length > max,
  };
}
