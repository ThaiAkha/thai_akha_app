// Path: packages/admin/src/components/manager/logistic/zoneColor.ts
//
// Il colore di una zona di ritiro viene dal database (`pickup_zones.color_code`) e si
// applica INLINE, non tradotto in classi Tailwind.
//
// PERCHE'. Fino al 2026-09-09 le due liste di schede del Driver Planner avevano, du-
// plicata identica, una mappa da nome-colore a classe: `'yellow' -> border-yellow-400`.
// Ma in quella colonna non ci sono nomi, ci sono esadecimali: #F4EB37, #62AF44,
// #3B82F6, #EF4444, #ff19ff, #1af0ff. La mappa non combaciava MAI e ogni riquadro
// cadeva sul grigio di ripiego. Il colore della zona non si e' mai visto in nessuna
// colonna, e nessuno se n'e' accorto perche' un grigio uniforme sembra una scelta.
// Da notare: tre delle sei zone (azure, walk-in, outside) non avevano nemmeno una
// chiave in quella mappa, quindi sarebbero rimaste grigie anche con i nomi al posto
// degli esadecimali.
//
// Inline regge qualunque valore lo staff scriva nel database - esadecimale o nome CSS -
// e non chiede a Tailwind classi che non puo' generare: il JIT vede solo le classi
// LETTERALI presenti nel codice, quindi una classe composta a runtime non esiste nel
// foglio di stile (stessa trappola documentata in CLAUDE.md per la safelist).
// E' anche cio' che fa tutto il resto del repo con questa stessa colonna:
// ZoneTimeBadge (stessa pagina), HotelsSidebar, ZoneInfoCard, ContactLocation nel front.
import type { CSSProperties } from 'react';

/** Classi fisse del riquadro zona: il grigio e' il ripiego quando la zona non ha colore. */
export const ZONE_BOX_CLASSES =
    'flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium truncate border-gray-200 dark:border-gray-700 text-body';

/**
 * Colore dal DB: bordo E velatura di fondo. `null` (nessuna zona) = grigio delle classi.
 *
 * La sola cornice di 2px non basta: `yellow` e' #F4EB37 e `azure` e' #1af0ff, che su una
 * scheda bianca danno 1,25:1 e 1,40:1 di contrasto, cioe' meno del grigio di ripiego
 * (#E5E7EB, 1,24:1). Il colore c'era e non si vedeva: distinguere le zone e' proprio il
 * mestiere di chi smista. La velatura al 12% (suffisso esadecimale 20) e' l'idioma che
 * questo repo usa gia' altrove per lo stesso dato (HotelsSidebar).
 *
 * La velatura si aggiunge solo a un esadecimale a 6 cifre: se un giorno in quella colonna
 * comparisse un nome CSS, `nome20` sarebbe un valore invalido e il fondo verrebbe
 * ignorato dal browser, mentre il bordo resta buono. Degrada, non rompe.
 */
export const zoneBoxStyle = (colorCode: string | null): CSSProperties | undefined => {
    if (!colorCode) return undefined;
    return /^#[0-9a-f]{6}$/i.test(colorCode)
        ? { borderColor: colorCode, backgroundColor: `${colorCode}20` }
        : { borderColor: colorCode };
};
