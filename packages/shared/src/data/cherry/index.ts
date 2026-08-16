// ─────────────────────────────────────────────────────────────────────────────
// data/cherry — indice della cartella Cherry (dati statici, EN base + override .th).
//
// Contenuto:
//   • askCherry_*.ts ……… nodi base EN, uniti in CHAT_FLOW da chatFlowData.ts
//   • chatFlowData.ts ……… merge → CHAT_FLOW (+ re-export dei tipi)
//   • chatFlowTypes.ts …… tipi (ChatNode, NodeBlock, filtri profilo)
//   • chatFlow.th.ts …… override THAI dei nodi
//   • chatFlowI18n.ts …… accessor multilingua (getChatFlow/getChatNode, en|th)
//   • cherryDashboardHelp(.th).ts … how-to dashboard (preset + override th)
//   • knowledge/ ………… knowledge base business/classes/meeting points
//
// NB: i consumer esterni usano i subpath del package (@thaiakha/shared/data/...),
// i cui target puntano qui via package.json exports. Questo barrel è di comodità
// interna; la lingua è gestita dal suffisso .th.ts + accessor, non da cartelle.
// ─────────────────────────────────────────────────────────────────────────────

export * from './chatFlowData';      // include i tipi (re-export interno)
export * from './chatFlowI18n';
export * from './cherryDashboardHelp';
export * from './cherryCTAs';
export * from './knowledge';
