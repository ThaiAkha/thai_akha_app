/**
 * 🇹🇭 NOME NATIVO - il "ponte" verso il thai sotto un titolo in un'altra lingua.
 *
 * Ingredienti (`name_th`, `phonetic`) e ricette (`thai_name`) portano sulla riga
 * madre il nome thai e la traslitterazione, disegnati SOTTO il titolo. Quel
 * disegno presuppone che il titolo NON sia thai: e' un ponte dalla lingua del
 * lettore alla parola thai che sentira' in cucina.
 *
 * Con la fase 4 il titolo (`name`) arriva fuso dal sidecar: su /th/ e' gia' thai,
 * e il ponte diventava la stessa stringa stampata due volte piu' un traslitterato
 * latino che un lettore thai non usa (192/192 ingredienti pubblici identici).
 *
 * La regola ragiona solo su cio' che e' A SCHERMO, mai su quale colonna sia la
 * sorgente del thai: resta corretta se domani `name_th` sparisce, se resta la
 * sorgente, o se lo diventa il sidecar (decisione #203).
 *
 *   thai      -> solo se c'e', se il titolo non e' gia' in scrittura thai e se
 *                differisce dal titolo (confronto normalizzato: NFC, spazi, case)
 *   phonetic  -> solo se c'e', se il titolo non e' thai e se la lingua non e' 'th'
 *                (a chi legge thai la romanizzazione non serve)
 *
 * Funzione pura, senza React: la usano i componenti front con `lang` dal
 * LanguageProvider, e puo' usarla domani anche l'admin o Cherry.
 */

/** Intervallo Unicode dello script thai (U+0E00-U+0E7F). */
const THAI_SCRIPT = /[\u0E00-\u0E7F]/;

const norm = (s: string | null | undefined): string =>
  (s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();

/** Cio' che serve dalla riga: il titolo mostrato e i due campi del ponte. */
export interface NativeNameSource {
  name: string | null | undefined;
  /** Ingredienti. */
  name_th?: string | null;
  /** Ricette. */
  thai_name?: string | null;
  phonetic?: string | null;
}

export interface NativeName {
  thai: string | null;
  phonetic: string | null;
}

export function nativeNameFor(src: NativeNameSource, lang: string): NativeName {
  const shown = src.name ?? '';
  const titleIsThai = THAI_SCRIPT.test(shown);
  const thaiRaw = (src.name_th ?? src.thai_name ?? '').trim();
  const thai = thaiRaw && !titleIsThai && norm(thaiRaw) !== norm(shown) ? thaiRaw : null;
  const phoneticRaw = (src.phonetic ?? '').trim();
  const phonetic = phoneticRaw && !titleIsThai && lang !== 'th' ? phoneticRaw : null;
  return { thai, phonetic };
}

/** La stessa regola in una riga di testo (`'ข่า  [kha]'`), o null se non c'e' nulla da mostrare. */
export function nativeNameLine(src: NativeNameSource, lang: string): string | null {
  const n = nativeNameFor(src, lang);
  const parts = [n.thai, n.phonetic ? `[${n.phonetic}]` : null].filter(Boolean);
  return parts.length ? parts.join('  ') : null;
}
