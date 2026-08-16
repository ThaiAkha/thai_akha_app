// ─────────────────────────────────────────────────────────────────────────────
// cherryDashboardHelp.th — override THAI per le how-to della dashboard.
//
// Solo i campi TRADOTTI per ogni voce (id → { prompt?, shortLabel?, response?,
// blockTitles? }). Le voci/campi assenti ricadono sull'inglese (base). Gli
// assetId dei blocchi NON si traducono (foto condivise); solo i titoli, se serve.
//
// 👉 Da compilare con l'agente /thai-english. Finché è vuoto, la dashboard mostra
//    l'inglese (fallback automatico, zero costo). Stesso pattern di chatFlow.th.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryHelpOverride } from './cherryDashboardHelp';

export const CHERRY_DASHBOARD_HELP_TH: CherryHelpOverride = {
  // Template (scommenta e traduci con /thai-english):
  // 'passport-edit': {
  //   prompt: 'ฉันจะแก้ไขข้อมูลพาสปอร์ตได้อย่างไร 🙏',
  //   shortLabel: 'แก้ไขข้อมูลของฉัน',
  //   response: 'Kha! 🙏 …',
  // },
};
