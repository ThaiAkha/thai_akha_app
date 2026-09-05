/**
 * Nome dell'ingrediente al mercato: quale delle due lingue si mostra, e a chi.
 *
 * Il thai vive nella riga MADRE (`ingredients_library.name_th`, 204/204 piene), non nel
 * sidecar `ingredients_library_translations`: il sidecar copre meno item di questi (mancano
 * le righe che non sono ingredienti - Parking Fee, Taxi, Local Food, Extra Sample) e oggi
 * porta comunque le stesse identiche stringhe. Il front legge il sidecar, il market legge
 * `name_th`: chi corregge un nome thai deve toccarli entrambi.
 *
 * ⚠️ Il nome NON e' mai una chiave: il flusso market e' chiavato su `id` uuid da capo a
 * fondo (formState, items_snapshot, report, COGS) e l'Expense Zoho non riceve nomi di
 * ingredienti, solo data/importo/conteggio. Qui si sceglie soltanto cosa si LEGGE.
 * `items_snapshot.name` resta inglese e congelato: e' la traccia di audit, non un display.
 */
export interface IngredientNameSpec {
  name?: string | null;
  name_th?: string | null;
}

/**
 * Nome a schermo per lo staff: thai se l'app e' in thai e il thai c'e', altrimenti inglese.
 * Monolingua di proposito - al banco si legge una riga sola, non due.
 */
export const displayIngredientName = (spec: IngredientNameSpec, lang?: string): string =>
  (lang?.split('-')[0] === 'th' && spec.name_th) ? spec.name_th : (spec.name || '');

/**
 * Nome per il VENDITORE del banco (messaggio LINE): thai davanti sempre, qualunque sia la
 * lingua di chi manda il messaggio - il destinatario e' thai per definizione. L'inglese
 * resta fra parentesi cosi' chi ha scritto l'ordine puo' ancora ricontrollarlo.
 */
export const vendorIngredientName = (spec: IngredientNameSpec): string => {
  const th = spec.name_th?.trim();
  const en = spec.name?.trim() || '';
  if (!th) return en;
  return en ? `${th} (${en})` : th;
};
