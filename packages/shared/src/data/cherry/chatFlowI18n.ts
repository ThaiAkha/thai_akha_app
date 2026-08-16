// ─────────────────────────────────────────────────────────────────────────────
// chatFlowI18n — Accessor multilingua per la ragnatela Cherry
//
// Punto UNICO da cui leggere i nodi. Oggi la sorgente è statica (in-bundle,
// zero-latency). L'inglese è la base (askCherry_*.ts); le altre lingue sono
// override testuali (es. chatFlow.th.ts) applicati sopra l'inglese con fallback.
//
// Vantaggio: per cambiare lingua si tocca UN solo punto (getChatFlow/getChatNode),
// senza duplicare la struttura dei nodi. Domani, se servisse, la sorgente degli
// override potrà diventare file per-lingua o un fetch DB con cache di sessione —
// senza toccare i consumer.
//
// NB: i nodi NON vivono in DB (scelta voluta: velocità). Restano statici.
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatNode } from './chatFlowTypes';
import { CHAT_FLOW } from './chatFlowData';
import { CHAT_FLOW_TH } from './chatFlow.th';

/** Lingue supportate dalla ragnatela. Allineate all'admin app (EN/TH). */
export type ChatLocale = 'en' | 'th';

/** Override testuale di un singolo nodo (solo i campi tradotti). */
export interface ChatNodeTextOverride {
  message?: string;
  shortLabel?: string;
  /** Label opzioni tradotte, mappate per nextId di destinazione. */
  optionLabels?: Record<string, string>;
}

/** Mappa id-nodo → override testuale, per una lingua. */
export type ChatFlowOverride = Record<string, ChatNodeTextOverride>;

// Registro override per lingua. EN è la base (nessun override).
const OVERRIDES: Record<ChatLocale, ChatFlowOverride> = {
  en: {},
  th: CHAT_FLOW_TH,
};

// Cache per lingua: la ragnatela localizzata si costruisce una sola volta.
const localizedCache: Partial<Record<ChatLocale, Record<string, ChatNode>>> = {};

function buildLocalizedFlow(locale: ChatLocale): Record<string, ChatNode> {
  const override = OVERRIDES[locale] ?? {};
  // Nessun override → usa direttamente l'inglese (zero costo).
  if (Object.keys(override).length === 0) return CHAT_FLOW;

  const out: Record<string, ChatNode> = {};
  for (const [id, node] of Object.entries(CHAT_FLOW)) {
    const ov = override[id];
    if (!ov) { out[id] = node; continue; } // nodo non tradotto → fallback EN
    out[id] = {
      ...node,
      message: ov.message ?? node.message,
      shortLabel: ov.shortLabel ?? node.shortLabel,
      options: node.options.map(opt => {
        const label = ov.optionLabels?.[opt.nextId];
        return label ? { ...opt, label } : opt;
      }),
    };
  }
  return out;
}

/**
 * Ritorna l'intera ragnatela nella lingua richiesta (default: en).
 * EN = base; altre lingue = override + fallback EN per i nodi non tradotti.
 */
export function getChatFlow(locale: ChatLocale = 'en'): Record<string, ChatNode> {
  if (locale === 'en') return CHAT_FLOW;
  if (!localizedCache[locale]) {
    localizedCache[locale] = buildLocalizedFlow(locale);
  }
  return localizedCache[locale]!;
}

/** Ritorna un singolo nodo nella lingua richiesta (default: en). */
export function getChatNode(nodeId: string, locale: ChatLocale = 'en'): ChatNode | undefined {
  return getChatFlow(locale)[nodeId];
}
