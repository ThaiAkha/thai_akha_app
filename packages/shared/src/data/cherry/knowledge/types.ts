// ─────────────────────────────────────────────────────────────────────────────
// cherryKnowledge — sapere STATICO di Cherry (tabelle piccole e stabili)
//
// Principio: per tabelle piccole + stabili (classi, meeting point, …) NON facciamo
// query Supabase (spreco per 2-12 righe). I dati vivono in file tipizzati e si
// iniettano nel prompt SOLO su intento (in-memory, zero DB, token-efficienti).
// Riusabili da chat testo (per-messaggio) e voce (a inizio sessione).
//
// Aggiungere un argomento = creare un file modulo + registrarlo in index.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface CherryKnowledgeModule {
  /** id univoco del modulo (es. 'classes'). */
  id: string;
  /** Parole-chiave (lowercase) che attivano l'iniezione del blocco. */
  keywords: string[];
  /** true = in ogni messaggio, a prescindere dall'intento (il livello base). */
  always?: boolean;
  /** Costruisce il blocco di prompt dai fatti generati. Nessun I/O. */
  build: (facts: CherryFacts) => string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CherryFacts — i fatti canonici GENERATI dal database, uno per lingua
// (`generated/facts.<lang>.ts`, da `pnpm gen-cherry-facts`). Solo dati: il testo
// per il prompt lo compongono i moduli qui accanto, cosi' la forma vive in un
// posto solo e si testa senza database.
// ─────────────────────────────────────────────────────────────────────────────

export interface CherryFactsBusiness {
  name: string;
  legalName: string | null;
  foundingYear: number | null;
  address: string;
  telephone: string | null;
  whatsapp: string | null;
  email: string | null;
  openingHours: string[];
  priceRange: string | null;
  areaServed: string[];
  rating: { value: string; count: string } | null;
  /** Canali attivi (instagram, youtube, tripadvisor, maps...). */
  socials: Array<{ type: string; url: string }>;
}

export interface CherryFactsClass {
  id: string;
  title: string;
  badge: string | null;
  priceThb: number;
  currency: string;
  unit: string;
  /** HH:MM */
  startTime: string;
  endTime: string;
  durationText: string | null;
  hasMarketTour: boolean;
  marketTour: { start: string; end: string } | null;
  capacityText: string | null;
  inclusions: string[];
  /** Cronologia della giornata: etichetta, orario, nota. */
  schedule: Array<{ label: string; time: string; description: string }>;
  /** Punti d'incontro senza pickup (scuola, tempio del mercato) con orario. */
  walkIn: Array<{ name: string; time: string; note: string }>;
}

export interface CherryFactsMeetingPoint {
  id: string;
  name: string;
  type: 'pickup' | 'walk_in' | 'dropoff' | string;
  description: string;
  dropoffDescription: string | null;
  isDropoff: boolean;
  morning: { from: string; to: string | null } | null;
  evening: { from: string; to: string | null } | null;
}

/** Una zona di pickup (tabella pickup_zones): finestre di mattina e sera, inizio e fine. */
export interface CherryFactsPickupZone {
  id: string;
  name: string;
  description: string;
  morning: { from: string; to: string } | null;
  evening: { from: string; to: string } | null;
}

export interface CherryFacts {
  lang: string;
  generatedAt: string;
  business: CherryFactsBusiness;
  classes: CherryFactsClass[];
  /** Solo le zone con una finestra (walk-in e fuori zona stanno nei punti di ritrovo). */
  pickupZones: CherryFactsPickupZone[];
  meetingPoints: CherryFactsMeetingPoint[];
  dishes: Array<{ category: string; categorySlug: string; items: Array<{ slug: string; name: string }> }>;
  diets: { lifestyle: string[]; religious: string[]; allergies: string[] };
}
