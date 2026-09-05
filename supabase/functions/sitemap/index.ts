import { createClient } from "jsr:@supabase/supabase-js@2";
import { DEFAULT_LANG, activeLangs, prefixedActiveLangs } from "../_shared/langPerimeter.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// ⚠️ Must use www to match canonical URLs in the DB and avoid duplicate content penalty
const SITE_URL = "https://www.thaiakha.com";


// Rete di sicurezza sulle route private. Il filtro vero è access_level='public'
// (strutturale: una nuova pagina privata è esclusa da sola); questa lista resta
// per le pagine che fossero pubbliche ma non hanno senso in sitemap.
const SITEMAP_BLACKLIST = new Set([
  "user", "user-dashboard", "user-menu", "user-quiz", "user-passport",
  "auth", "menu", "home",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** Un'entità del sito, espressa in segmenti di slug INGLESI. */
interface SitemapEntry {
  /** Segmenti inglesi del path. [] = home. */
  segments: string[];
  priority: string;
  changefreq: string;
  lastmod?: string | null;
}

/** lingua → (slug inglese → slug tradotto). Righe solo per le 7 lingue europee. */
type SlugIndex = Record<string, Record<string, string>>;
type SlugRow = { lang: string | null; slug_en: string | null; slug_translated: string | null };
type QueryResult<T> = { data: T[] | null; error: { message: string } | null };

/** Ogni query PostgREST ha al massimo questo tempo: una bloccata non tiene la funzione fino al wall clock. */
const QUERY_TIMEOUT_MS = 8000;

/**
 * Una query fallita fa fallire la sitemap (500, vedi catch), MAI un urlset vuoto
 * con 200: Google prenderebbe la sitemap vuota per buona e la ritenterebbe con
 * calma, mentre un 500 lo fa riprovare presto e si vede in Search Console.
 */
async function must<T>(p: PromiseLike<QueryResult<T>>, what: string): Promise<T[]> {
  const { data, error } = await p;
  if (error) throw new Error(`[SITEMAP] ${what}: ${error.message}`);
  return data ?? [];
}

/**
 * Soglia per un eventuale sitemap INDEX (protocollo: 50.000 URL / 52.428.800 byte
 * per file): si passa all'index quando entita' x |lingue attive| > 25.000 URL o la
 * risposta supera 26 MB. Misura 2026-09-04: 269 entita'; a 12 lingue 3.228 URL e
 * ~5,9 MB, cioe' 6% e 11% dei tetti. L'index NON riduce ne' la massa ne' il lavoro
 * DB: non e' un'ottimizzazione, e' un cambio di forma per Google. Non serve.
 */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    /**
     * Registro slug di UNA lingua, paginato a 1.000. PostgREST tronca a max_rows
     * (config.toml: 1000) e la view intera ha ~1.939 righe: la lettura piatta
     * perdeva in silenzio le lingue in coda all'UNION. Per th/zh/ko/ja torna 0
     * righe (navigano su slug inglesi per scelta): innocuo. Closure e non
     * funzione di modulo: tipizzare il client fuori dal handler costa un TS2345
     * (vedi og-meta-tags), qui il tipo viene dall'istanza.
     */
    const readSlugRows = async (lang: string): Promise<SlugRow[]> => {
      const rows: SlugRow[] = [];
      const PAGE = 1000;
      for (let from = 0; ; from += PAGE) {
        const batch = await must<SlugRow>(
          supabase
            .from("v_translated_slugs")
            .select("lang, slug_en, slug_translated")
            .eq("lang", lang)
            .order("slug_en", { ascending: true })
            .range(from, from + PAGE - 1)
            .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS)),
          `v_translated_slugs ${lang}`,
        );
        rows.push(...batch);
        if (batch.length < PAGE) break;
      }
      return rows;
    };

    const ACTIVE = activeLangs();
    const I18N = ACTIVE.length > 1;
    const tDb = performance.now();

    // ── Letture in PARALLELO ─────────────────────────────────────────────────
    // Prima erano sette `await` in sequenza: sette round-trip edge -> Tokyo uno dietro
    // l'altro, cioe' i 5-8 secondi di TTFB misurati sulla sitemap monolingua. Il
    // costo di costruzione dell'XML e' di decine di millisecondi anche a 12 lingue.
    // access_level='public' e' il filtro autorevole sulle statiche: senza, ogni
    // futura pagina riservata finirebbe in sitemap finche' qualcuno non aggiorna la
    // blacklist. `.order('slug')` rende l'uscita deterministica (diff e cache).
    const q = (b: { abortSignal(s: AbortSignal): unknown }) =>
      b.abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS)) as PromiseLike<QueryResult<Record<string, string | null>>>;
    const [staticPages, recipes, cultureSections, news, ingredients, ingredientCategories, slugRowsPerLang] =
      await Promise.all([
        must(q(supabase.from("site_metadata").select("page_slug, created_at").eq("show_in_menu", true).eq("access_level", "public").order("menu_order", { ascending: true })), "site_metadata"),
        must(q(supabase.from("recipes").select("slug, updated_at").eq("is_published", true).order("slug")), "recipes"),
        must(q(supabase.from("culture_sections").select("slug, updated_at").eq("is_published", true).order("slug")), "culture_sections"),
        must(q(supabase.from("akha_news").select("slug, updated_at").eq("is_published", true).order("slug")), "akha_news"),
        must(q(supabase.from("ingredients_library").select("slug, updated_at").eq("is_published", true).order("slug")), "ingredients_library"),
        must(q(supabase.from("content_categories").select("slug, updated_at").eq("domain", "ingredient").eq("is_active", true).order("slug")), "content_categories"),
        // Registro slug tradotti: una lettura per lingua ATTIVA a prefisso, paginata.
        // A lista vuota non si legge affatto.
        Promise.all(prefixedActiveLangs().map((l) => readSlugRows(l))),
      ]);
    const dbMs = Math.round(performance.now() - tDb);
    const tBuild = performance.now();

    const slugIndex: SlugIndex = {};
    for (const row of slugRowsPerLang.flat()) {
      if (!row.lang || !row.slug_en || !row.slug_translated) continue;
      (slugIndex[row.lang] ??= {})[row.slug_en] = row.slug_translated;
    }

    // ── Costruzione delle entità (in slug INGLESI) ────────────────────────────
    const entries: SitemapEntry[] = [];
    const seen = new Set<string>();

    /**
     * Dedup sulla chiave inglese: i 4 hub (culture/recipes/news/ingredients)
     * hanno show_in_menu=true, quindi arrivavano DUE volte — dal ciclo delle
     * pagine statiche e dai push hardcoded qui sotto. Un URL duplicato in
     * sitemap è un segnale sporco che Google riporta come warning.
     */
    const push = (entry: SitemapEntry) => {
      const key = entry.segments.join("/");
      if (seen.has(key)) return;
      seen.add(key);
      entries.push(entry);
    };

    // Homepage — highest priority
    push({ segments: [], priority: "1.0", changefreq: "daily", lastmod: new Date().toISOString() });

    // Hub pages (content index pages) — PRIMA delle statiche, così vincono loro
    // priorità e changefreq (0.9/weekly) e non quelli generici (0.8/monthly).
    const HUBS = [
      "akha-culture-highland-heritage",
      "authentic-thai-akha-recipes",
      "thai-cooking-tips-news",
      "thai-cooking-ingredients",
    ];
    for (const hub of HUBS) {
      push({ segments: [hub], priority: "0.9", changefreq: "weekly", lastmod: new Date().toISOString() });
    }

    // Static public pages (excluding private/app routes)
    for (const page of staticPages || []) {
      const slug = page.page_slug;
      if (!slug || SITEMAP_BLACKLIST.has(slug)) continue;
      push({ segments: [slug], priority: "0.8", changefreq: "monthly", lastmod: page.created_at });
    }

    // Recipe detail pages
    for (const recipe of recipes || []) {
      if (!recipe.slug) continue;
      push({ segments: ["authentic-thai-akha-recipes", recipe.slug], priority: "0.9", changefreq: "weekly", lastmod: recipe.updated_at });
    }

    // Culture/history detail pages
    for (const section of cultureSections || []) {
      if (!section.slug) continue;
      push({ segments: ["akha-culture-highland-heritage", section.slug], priority: "0.8", changefreq: "monthly", lastmod: section.updated_at });
    }

    // News/blog detail pages
    for (const article of news || []) {
      if (!article.slug) continue;
      push({ segments: ["thai-cooking-tips-news", article.slug], priority: "0.7", changefreq: "weekly", lastmod: article.updated_at });
    }

    // Ingredient category guides
    for (const cat of ingredientCategories || []) {
      if (!cat.slug) continue;
      push({ segments: ["thai-cooking-ingredients", cat.slug], priority: "0.8", changefreq: "monthly", lastmod: cat.updated_at });
    }

    // Ingredient detail pages
    for (const ingredient of ingredients || []) {
      if (!ingredient.slug) continue;
      push({ segments: ["thai-cooking-ingredients", ingredient.slug], priority: "0.7", changefreq: "monthly", lastmod: ingredient.updated_at });
    }

    // ── Emissione ─────────────────────────────────────────────────────────────
    const urls: string[] = [];
    for (const entry of entries) {
      for (const lang of ACTIVE) {
        urls.push(buildUrl(entry, lang, slugIndex, ACTIVE, I18N));
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;
    const buildMs = Math.round(performance.now() - tBuild);
    const bytes = new TextEncoder().encode(xml).byteLength;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        // Diagnostica leggibile con `curl -I`: cosa e' acceso e quanto costa. E' il
        // gate del RUNBOOK 6.D: url = entita' x |lingue|, senza aprire il file.
        "X-Sitemap-Langs": ACTIVE.join(","),
        "X-Sitemap-Urls": String(urls.length),
        "X-Sitemap-Entities": String(entries.length),
        "X-Sitemap-Bytes": String(bytes),
        "Server-Timing": `db;dur=${dbMs}, build;dur=${buildMs}`,
      },
    });
  } catch (error) {
    // 500 e non un urlset vuoto con 200: la sitemap che sparisce si vede subito
    // in Search Console ("impossibile recuperare") e Google la ritenta presto;
    // una vuota con 200 verrebbe presa per buona. Mai in cache.
    console.error("[SITEMAP] Error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "no-store",
          "Retry-After": "300",
        },
      },
    );
  }
});

/**
 * Path assoluto di un'entità in una lingua.
 * Ogni segmento viene tradotto singolarmente (l'hub e l'articolo hanno slug
 * propri); un segmento senza traduzione resta inglese — è il caso di th/zh/ko/ja,
 * che navigano su slug inglesi con contenuti tradotti.
 */
function localizedUrl(entry: SitemapEntry, lang: string, slugIndex: SlugIndex): string {
  const map = slugIndex[lang] ?? {};
  const segments = entry.segments.map((seg) => map[seg] ?? seg);
  const prefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
  const path = segments.length ? `${prefix}/${segments.join("/")}` : `${prefix}/`;
  return `${SITE_URL}${path}`.replace(/&/g, "&amp;");
}

function buildUrl(entry: SitemapEntry, lang: string, slugIndex: SlugIndex, active: readonly string[], i18n: boolean): string {
  const loc = localizedUrl(entry, lang, slugIndex);
  const lastmodTag = entry.lastmod
    ? `\n    <lastmod>${entry.lastmod.slice(0, 10)}</lastmod>`
    : "";

  // hreflang reciproci: ogni URL elenca TUTTE le lingue, sé stesso compreso.
  // Google scarta i gruppi hreflang non reciproci, quindi l'auto-riferimento non
  // è ridondante — è la condizione perché il gruppo venga considerato valido.
  // A lista vuota `active` è ['en'] e questo blocco non emette nulla.
  const alternates = i18n
    ? active.map(
        (alt) =>
          `\n    <xhtml:link rel="alternate" hreflang="${alt}" href="${localizedUrl(entry, alt, slugIndex)}"/>`,
      ).join("") +
      `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl(entry, DEFAULT_LANG, slugIndex)}"/>`
    : "";

  return `  <url>
    <loc>${loc}</loc>${lastmodTag}${alternates}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}
