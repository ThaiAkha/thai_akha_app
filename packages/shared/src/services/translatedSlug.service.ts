import { supabase } from '../lib/supabase';
import { fetchWithCache, peekCache } from './_cache';
import { DEFAULT_LANG, LANGS_WITH_TRANSLATED_SLUGS } from '../lib/i18n';

/**
 * 🔗 REGISTRO SLUG TRADOTTI — lettore di `v_translated_slugs`.
 *
 * La view è il registro vivo (1.938 righe): per ogni entità pubblicata dà lo slug
 * inglese e quello tradotto, lingua per lingua. Righe SOLO per le 7 lingue europee
 * (es fr de pt it ca nl). Per th/zh/ko/ja la view non ha righe affatto: quelle
 * lingue navigano sugli slug INGLESI e traducono i contenuti. È voluto — niente
 * URL in percent-encoding, e nessun path può cadere in 404 per slug mancante.
 *
 * Gli slug NON si memorizzano da nessun'altra parte: questa view è l'unica fonte.
 */

/** I tipi di entità del registro. `page` = pagina top-level, gli altri = sotto-pagine. */
export type SlugEntityType = 'page' | 'recipe' | 'culture' | 'news' | 'ingredient' | 'category';

export interface SlugMap {
  lang: string;
  /** slug tradotto → slug inglese (rotta in ingresso: URL utente → identità DB) */
  toEn: Record<string, string>;
  /** slug inglese → slug tradotto (rotta in uscita: link/hreflang/sitemap) */
  toTranslated: Record<string, string>;
  /** slug inglese → entity_type (serve a distinguere pagina da sotto-pagina) */
  typeOf: Record<string, SlugEntityType>;
}

const EMPTY_MAP = (lang: string): SlugMap => ({ lang, toEn: {}, toTranslated: {}, typeOf: {} });

/** Cache key: bump della versione quando cambia la FORMA di SlugMap, non i dati. */
const cacheKey = (lang: string) => `slug_map_${lang}_v1`;

// Cache in-memory delle mappe già viste in questa sessione: i lookup sincroni
// (peek, soccorso cross-lingua) non devono riparsare il blob localStorage a
// ogni chiamata. Si popola da getSlugMap/peekSlugMap, mai direttamente.
const memMaps = new Map<string, SlugMap>();

/**
 * Una lingua ha senso interrogarla solo se il registro ha righe per lei.
 * Per en/th/zh/ko/ja la mappa è vuota per costruzione: zero query, zero attesa.
 */
const hasTranslatedSlugs = (lang: string): boolean =>
  lang !== DEFAULT_LANG && (LANGS_WITH_TRANSLATED_SLUGS as readonly string[]).includes(lang);

const buildMap = (
  lang: string,
  rows: Array<{ entity_type: string | null; slug_en: string | null; slug_translated: string | null }>,
): SlugMap => {
  const map = EMPTY_MAP(lang);
  for (const row of rows) {
    const en = row.slug_en;
    if (!en) continue;
    map.typeOf[en] = (row.entity_type as SlugEntityType) ?? 'page';
    // slug_translated NULL = questa entità non è (ancora) tradotta in questa lingua:
    // resta l'inglese. Non è un errore, è il fallback previsto.
    const translated = row.slug_translated;
    if (!translated) continue;
    map.toTranslated[en] = translated;
    map.toEn[translated] = en;
  }
  return map;
};

export const translatedSlugService = {
  /**
   * Mappa slug per una lingua. Scarica SOLO le righe di quella lingua (~277),
   * non l'intero registro: il payload resta piccolo e la cache non si gonfia.
   */
  async getSlugMap(lang: string): Promise<SlugMap> {
    if (!hasTranslatedSlugs(lang)) return EMPTY_MAP(lang);

    const cached = await fetchWithCache<SlugMap>(cacheKey(lang), async () => {
      const { data, error } = await supabase
        .from('v_translated_slugs')
        .select('entity_type, slug_en, slug_translated')
        .eq('lang', lang);

      if (error) {
        console.error(`[slug-map] errore lettura v_translated_slugs (${lang}):`, error);
        return null;
      }
      return buildMap(lang, data ?? []);
    });

    const map = cached ?? EMPTY_MAP(lang);
    memMaps.set(lang, map);
    return map;
  },

  /**
   * Lettura SINCRONA dalla cache locale, per il primo paint.
   * Il router deve decidere quale pagina montare prima di poter attendere una
   * fetch: se la mappa è già in cache la usa subito (nessun flash di loader),
   * altrimenti parte dagli slug inglesi e si ri-risolve quando la mappa arriva.
   */
  peekSlugMap(lang: string): SlugMap | null {
    if (!hasTranslatedSlugs(lang)) return EMPTY_MAP(lang);
    const inMem = memMaps.get(lang);
    if (inMem) return inMem;
    const fromStorage = peekCache<SlugMap>(cacheKey(lang));
    if (fromStorage) memMaps.set(lang, fromStorage);
    return fromStorage;
  },

  /**
   * 🛟 Soccorso cross-lingua SINCRONO: slug sconosciuto alla mappa corrente →
   * si cerca nelle mappe delle ALTRE lingue già in cache locale (zero rete).
   *
   * Il caso reale che lo richiede: cambiando pt→zh lo slug portoghese finiva
   * sotto prefisso /zh/ (la mappa zh è vuota per design e non può risolverlo:
   * l'URL restava rotto per sempre). Se la lingua di provenienza è stata
   * visitata, la sua mappa è in cache — e da lì si torna all'inglese.
   *
   * Nessun falso positivo praticabile: si scatta solo su match ESATTO di uno
   * slug tradotto completo (stringhe lunghe tipo 'ingredientes-cozinha-…'),
   * che non collidono con slug inglesi o alias legacy corti.
   */
  peekReverseToEnglish(slug: string): string | null {
    for (const l of LANGS_WITH_TRANSLATED_SLUGS) {
      const en = this.peekSlugMap(l)?.toEn[slug];
      if (en) return en;
    }
    return null;
  },

  /**
   * Tutte le varianti di UN solo slug, per gli hreflang di quella pagina.
   *
   * Una query mirata (≤7 righe) invece delle 7 mappe intere: gli hreflang
   * servono su ogni pagina, e caricare l'intero registro per emetterne dodici
   * sarebbe sproporzionato.
   *
   * @returns lingua → slug tradotto. Le lingue assenti (th/zh/ko/ja, o entità
   *          non ancora tradotta) semplicemente non compaiono: chi costruisce
   *          l'URL ricade sullo slug inglese.
   */
  async getAlternatesForSlug(enSlug: string): Promise<Record<string, string>> {
    const cached = await fetchWithCache<Record<string, string>>(
      `slug_alternates_${enSlug}_v1`,
      async () => {
        const { data, error } = await supabase
          .from('v_translated_slugs')
          .select('lang, slug_translated')
          .eq('slug_en', enSlug);

        if (error) {
          console.error(`[slug-map] errore alternates per ${enSlug}:`, error);
          return null;
        }

        const out: Record<string, string> = {};
        for (const row of data ?? []) {
          if (row.lang && row.slug_translated) out[row.lang] = row.slug_translated;
        }
        return out;
      },
    );
    return cached ?? {};
  },

  /** slug in URL (tradotto o inglese) → slug inglese, l'identità con cui si legge il DB. */
  toEnglishSlug(map: SlugMap | null, slug: string): string {
    if (!map) return slug;
    return map.toEn[slug] ?? slug;
  },

  /**
   * slug inglese → slug da mettere in URL per quella lingua.
   * Nessuna traduzione (th/zh/ko/ja, o entità non ancora tradotta) → resta inglese.
   */
  toLocalizedSlug(map: SlugMap | null, enSlug: string): string {
    if (!map) return enSlug;
    return map.toTranslated[enSlug] ?? enSlug;
  },
};
