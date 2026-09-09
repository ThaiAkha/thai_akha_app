// ─────────────────────────────────────────────────────────────────────────────
// validate — le regole del messaggio di contatto, senza Deno e senza rete, cosi'
// le esercita il runner di Node (packages/shared/src/lib/__tests__).
//
// Sono le STESSE lunghezze della policy `anon can insert` che verra' tolta: con
// il service_role la RLS non vale piu', quindi il controllo deve vivere qui o
// non vive da nessuna parte.
// ─────────────────────────────────────────────────────────────────────────────

export interface ContactInput {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  message?: unknown;
  /** Campo esca: gli umani non lo vedono, i robot lo compilano. */
  website?: unknown;
}

export interface ContactMessage {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export type ContactCheck =
  | { ok: true; value: ContactMessage }
  | { ok: false; error: string }
  /** Esca compilata: si risponde come se fosse andata bene, senza scrivere nulla. */
  | { ok: false; silent: true };

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Limiti della tabella: name 1..200, email 3..320 con la chiocciola, topic 1..200, message 1..8000. */
export function checkContact(input: ContactInput): ContactCheck {
  if (text(input.website)) return { ok: false, silent: true };

  const name = text(input.name);
  const email = text(input.email);
  const topic = text(input.topic);
  const message = text(input.message);

  const at = email.indexOf('@');
  const problem =
    name.length < 1 || name.length > 200 ? 'name'
    : email.length < 3 || email.length > 320 || at < 1 || at === email.length - 1 ? 'email'
    : topic.length < 1 || topic.length > 200 ? 'topic'
    : message.length < 1 || message.length > 8000 ? 'message'
    : null;

  return problem ? { ok: false, error: `invalid ${problem}` } : { ok: true, value: { name, email, topic, message } };
}
