// ─────────────────────────────────────────────────────────────────────────────
// chatFlow.th — Override THAILANDESE dei nodi Cherry (i18n)
//
// Qui vivono SOLO i campi tradotti, per id nodo. La struttura (id, nextId,
// action, tag dieta/allergie, foto) resta unica in askCherry_*.ts (EN base).
// Per ogni nodo puoi tradurre: message, shortLabel, e le label delle opzioni
// (mappate per nextId). I campi non tradotti ricadono sull'inglese (fallback).
//
// → Riempi questo file in modo INCREMENTALE, un nodo alla volta. Finché un nodo
//   non è qui, Cherry lo mostra in inglese. Nessuna duplicazione di struttura.
//
// Formato:
//   ROOT: {
//     message: "สวัสดีค่ะ! ...",
//     shortLabel: "...",
//     optionLabels: { INFO_CLASSES: "...", MENU_DIET: "...", ... },
//   },
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatFlowOverride } from './chatFlowI18n';

export const CHAT_FLOW_TH: ChatFlowOverride = {
  // TODO: aggiungere le traduzioni thailandesi nodo per nodo.
  // Esempio (da rivedere con un madrelingua):
  // ROOT: {
  //   message: "สวัสดีค่ะ! ฉันเชอร์รี่ ผู้ช่วยของคุณที่ Thai Akha Kitchen ...",
  //   optionLabels: {
  //     INFO_CLASSES: "☀️ เกี่ยวกับคลาส",
  //     MENU_DIET:    "🍽️ เมนูและอาหาร",
  //   },
  // },
};
