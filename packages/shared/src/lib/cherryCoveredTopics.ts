// ─────────────────────────────────────────────────────────────────────────────
// cherryCoveredTopics — memoria anti-ripetizione per Cherry
//
// Cherry deve personalizzare ma NON ripetere ("so che sei vegano quindi…" a ogni
// risposta). Questo helper rileva quali ARGOMENTI sono già stati toccati nella
// sessione (da history + risposte) e li espone al prompt come "già coperti", così
// il modello li applica in silenzio e non li ripropone — salvo richiesta esplicita.
// ─────────────────────────────────────────────────────────────────────────────

/** Argomenti tracciati. La chiave è interna; la label va nel prompt. */
const TOPIC_KEYWORDS: Record<string, string[]> = {
  diet: ['vegan', 'vegetarian', 'pescatarian', 'plant-based', 'diet', 'dieta', 'vegano', 'vegetariano'],
  allergies: ['allerg', 'peanut', 'gluten', 'shellfish', 'dairy', 'nut ', 'intolerance', 'arachid', 'noci'],
  spice: ['spicy', 'spice', 'chili', 'chilli', 'heat level', 'mild', 'phet', 'piccant'],
  pickup: ['pickup', 'pick up', 'transport', 'transfer', 'hotel pickup', 'pulmino', 'navetta'],
  prices: ['price', 'cost', 'thb', 'baht', 'how much', 'prezzo', 'costo'],
  booking: ['booking', 'book a', 'reserve', 'reservation', 'prenotaz'],
  meeting_point: ['meeting point', 'meet at', 'wat pan whaen', 'meeting'],
  market_tour: ['market tour', 'market visit', 'mercato'],
};

/** Label leggibili usate nel blocco di prompt. */
const TOPIC_LABELS: Record<string, string> = {
  diet: 'dietary needs',
  allergies: 'allergies',
  spice: 'spice preference',
  pickup: 'pickup & transport',
  prices: 'prices',
  booking: 'booking',
  meeting_point: 'meeting point',
  market_tour: 'market tour',
};

/** Ritorna le chiavi-argomento presenti nel testo (lowercase match). */
export function detectCoveredTopics(text: string): string[] {
  const hay = (text ?? '').toLowerCase();
  const found: string[] = [];
  for (const [topic, kws] of Object.entries(TOPIC_KEYWORDS)) {
    if (kws.some(kw => hay.includes(kw))) found.push(topic);
  }
  return found;
}

/**
 * Costruisce il blocco prompt "ALREADY COVERED" da un set di chiavi-argomento.
 * Vuoto → stringa vuota (nessun blocco).
 */
export function buildCoveredTopicsBlock(topicKeys: Iterable<string>): string {
  const labels = [...new Set([...topicKeys])]
    .map(k => TOPIC_LABELS[k])
    .filter(Boolean);
  if (labels.length === 0) return '';
  return (
    `### ALREADY COVERED THIS SESSION (apply silently, do NOT restate unless the guest explicitly asks again): ` +
    labels.join(', ')
  );
}
