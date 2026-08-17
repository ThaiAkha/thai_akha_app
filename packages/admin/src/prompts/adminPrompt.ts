// packages/admin/src/prompts/adminPrompt.ts  (symlink -> thai_akha_brain/000_Core_Agents/
//                                              030_Cherry/033_App_Prompts/800_Admin/adminPrompt.ts)
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ QUESTO FILE NON COSTRUISCE PIU' IL PROMPT DELLA CHERRY ADMIN.
//
// Dal 2026-07-31 contiene SOLO i due tipi ancora importati dall'app. La costruzione
// del prompt vivo e' altrove:
//     packages/admin/src/prompts/adminAgents.ts   -> buildAdminAgentPrompt()
//     packages/admin/src/prompts/scopedData.ts    -> scopedDataBlocks()
//
// Perche' e' stato svuotato: conteneva ancora identita' Cherry, definizione agente e
// un blocco BUSINESS TERMS con fatti SBAGLIATI (diceva "max 16 pax"; il massimo reale
// e' 28, e la capienza corretta e' "12 per kitchen, up to 24 together - private groups
// up to 28"). Essendo importato solo con `import type`, quel testo spariva in
// compilazione e non raggiungeva mai il modello: non era un bug in produzione, ma
// restava un file che afferma il falso e che prima o poi qualcuno legge e crede.
//
// Cancellarlo del tutto non era possibile per due motivi: e' un file del VAULT (non
// del repo), e i due tipi qui sotto servono ancora a adminScopedFetch.ts e
// scopedData.ts. Se un domani i tipi si spostano nell'app (accanto ad AdminScopedData),
// questo file puo' sparire dal vault: e' una decisione sul vault, da coordinare con
// /brain-build, non un refactor.
// ─────────────────────────────────────────────────────────────────────────────

/** Riepilogo di una giornata di prenotazioni, iniettato nei blocchi dati scoped. */
export interface BookingDaySummary {
  date: string;
  session: string;
  pax: number;
  visitors: number;
  status: string;
  bookingRef?: string;
  hotelName?: string;
  pickupTime?: string;
  pickupZone?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  totalPrice?: number;
  specialRequests?: string;
  customerNote?: string;
}

/** Ospite con esigenze dietetiche o allergie da segnalare allo staff. */
export interface GuestAlert {
  name: string;
  date: string;
  session: string;
  dietary: string;
  allergies: string[];
  curryChoice?: string;
  soupChoice?: string;
  stirfryChoice?: string;
  spicinessLevel?: string;
}
