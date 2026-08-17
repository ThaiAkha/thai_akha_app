import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ACTIVE_LANGS,
  DEFAULT_LANG,
  I18N_ROUTES_ENABLED,
  LANG_DIR,
  LANG_LABELS,
  type SupportedLang,
} from '@thaiakha/shared/lib/i18n';
import { translatedSlugService, type SlugMap } from '@thaiakha/shared/services';
import {
  parseLangPath,
  buildLangPath,
  toEnglishSegments,
  canonicalSlugRedirect,
} from '../lib/langRouting';
import { syncI18nLanguage } from '../i18n';

/**
 * 🌍 LINGUA CORRENTE — una sola fonte: l'URL.
 *
 * La lingua si legge SEMPRE dal path, mai dal solo localStorage. Se la preferenza
 * salvata potesse cambiare da sola la lingua servita, lo stesso URL mostrerebbe
 * contenuti diversi a persone diverse: un crawler vedrebbe una pagina, l'utente
 * un'altra, e la cache HTTP servirebbe la lingua sbagliata a chi capita. La
 * preferenza si SALVA (la usa lo switcher per evidenziare la scelta) ma non
 * redirige nessuno.
 *
 * A flag spento tutto questo è inerte: ACTIVE_LANGS è ['en'], ogni prefisso viene
 * rimosso e il sito è esattamente quello di oggi.
 */

const LANG_STORAGE_KEY = 'thai_akha_lang';

interface LanguageContextValue {
  /** Lingua servita, derivata dall'URL. */
  lang: SupportedLang;
  /** true quando la lingua non è l'inglese di base. */
  isTranslated: boolean;
  /** Lingue navigabili adesso (dipende dal flag). */
  availableLangs: readonly SupportedLang[];
  /** Etichette native per lo switcher. */
  labels: Record<SupportedLang, string>;
  /** Registro slug della lingua corrente (null finché non è caricato). */
  slugMap: SlugMap | null;
  /** Segmenti del path SENZA prefisso lingua, tradotti in INGLESE (identità DB). */
  enSegments: string[];
  /** Cambia lingua RESTANDO sulla stessa pagina (slug rimappato). */
  switchLang: (next: SupportedLang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState(() => parseLangPath(window.location.pathname));
  // Peek sincrono: se la mappa è già in cache locale il primo paint ha già gli
  // slug giusti, senza un giro di loader.
  const [slugMap, setSlugMap] = useState<SlugMap | null>(
    () => translatedSlugService.peekSlugMap(parseLangPath(window.location.pathname).lang),
  );

  const lang = route.lang;

  // ── Normalizzazione dell'URL ────────────────────────────────────────────────
  // Prefisso ignoto o lingua spenta → si toglie il prefisso conservando il path.
  // replaceState e non pushState: la tappa sbagliata non deve finire nella
  // cronologia, o il tasto "indietro" ci riporterebbe dentro.
  useEffect(() => {
    if (!route.redirectTo) return;
    const target = route.redirectTo === '' ? '/' : route.redirectTo;
    window.history.replaceState({}, '', target + window.location.search + window.location.hash);
    setRoute(parseLangPath(target));
  }, [route.redirectTo]);

  // ── Reazione alla navigazione ───────────────────────────────────────────────
  //
  // `pushState` NON emette `popstate`: chi naviga così va intercettato a parte.
  // Quasi tutti i chiamanti dispatchano l'evento a mano, ma non tutti — in
  // useHistoryFeed `handleOpenSection` e `handleCategoryChange` cambiano URL in
  // silenzio. Prima li vedeva SEOHead, che patchava `pushState` per conto suo;
  // ora che la rotta ha un proprietario unico il patch sta qui, una volta sola.
  //
  // Non è un dettaglio cosmetico: se il cambio di URL non viene notato, la
  // sub-page si tiene addosso JSON-LD e hreflang della pagina-madre (doppio
  // @graph) — esattamente il difetto chiuso in 4952612.
  useEffect(() => {
    const onNavigation = () => setRoute(parseLangPath(window.location.pathname));
    window.addEventListener('popstate', onNavigation);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      onNavigation();
    };

    return () => {
      window.removeEventListener('popstate', onNavigation);
      window.history.pushState = originalPushState;
    };
  }, []);

  // ── Registro slug della lingua corrente ─────────────────────────────────────
  useEffect(() => {
    let alive = true;
    translatedSlugService.getSlugMap(lang).then((map) => {
      if (alive) setSlugMap(map);
    });
    return () => { alive = false; };
  }, [lang]);

  // ── Slug inglese sotto prefisso → slug tradotto ─────────────────────────────
  // `/es/about-thai-akha-kitchen` → `/es/sobre-thai-akha-kitchen`.
  // Qui è un replaceState; il 301 vero lo emette il Worker (vedi langRouting.ts).
  useEffect(() => {
    if (!slugMap || route.redirectTo) return;
    const canonical = canonicalSlugRedirect(lang, route.segments, slugMap);
    if (!canonical) return;
    window.history.replaceState({}, '', canonical + window.location.search + window.location.hash);
    setRoute(parseLangPath(canonical));
  }, [slugMap, lang, route.segments, route.redirectTo]);

  // ── <html lang>, dir, e stringhe UI ─────────────────────────────────────────
  // Il tag lang è il segnale che leggono screen reader, traduttori automatici e
  // motori: se resta 'en' su una pagina spagnola, tutti e tre sbagliano.
  // Nello stesso punto la lingua dell'URL diventa la lingua di i18next: le
  // stringhe UI (t('quiz:…')) seguono l'URL, mai il browser — una fonte sola.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANG_DIR;
    syncI18nLanguage(lang);
  }, [lang]);

  // ── Preferenza salvata (informativa, non redirige) ──────────────────────────
  useEffect(() => {
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch { /* quota/privata */ }
  }, [lang]);

  const enSegments = useMemo(
    () => toEnglishSegments(route.segments, slugMap),
    [route.segments, slugMap],
  );

  /**
   * Cambio lingua MANTENENDO la pagina: si passa dagli slug inglesi (identità)
   * e si ricostruisce il path nella lingua di destinazione. Chi sta leggendo le
   * ricette in spagnolo e passa al giapponese resta sulle ricette.
   *
   * Servono DUE mappe, entrambe attese qui: quella della lingua CORRENTE (per
   * tornare agli slug inglesi) e quella di destinazione (per localizzarli).
   * Usare `enSegments` dallo stato non basta: subito dopo un cambio lingua la
   * mappa corrente può non essere ancora in stato, e lo slug partirebbe NON
   * tradotto — successo davvero: pt→zh produceva
   * /zh/ingredientes-cozinha-tailandesa, un URL che poi nessuna mappa poteva
   * più riparare. getSlugMap è cache+dedup: dopo la prima visita costa zero.
   */
  const switchLang = useCallback((next: SupportedLang) => {
    if (next === lang) return;

    Promise.all([
      translatedSlugService.getSlugMap(lang),
      translatedSlugService.getSlugMap(next),
    ]).then(([currentMap, targetMap]) => {
      const enSegs = toEnglishSegments(route.segments, currentMap);
      const path = buildLangPath(next, enSegs, targetMap);
      window.history.pushState({}, '', path);
      // pushState non emette popstate: lo notifichiamo noi, come fa App.tsx.
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      setRoute(parseLangPath(path));
    });
  }, [lang, route.segments]);

  const value = useMemo<LanguageContextValue>(() => ({
    lang,
    isTranslated: lang !== DEFAULT_LANG,
    availableLangs: ACTIVE_LANGS,
    labels: LANG_LABELS,
    slugMap,
    enSegments,
    switchLang,
  }), [lang, slugMap, enSegments, switchLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

/**
 * Hook lingua. Fuori dal provider restituisce lo stato inglese di default invece
 * di lanciare: un componente montato fuori dall'albero (test, storybook) deve
 * degradare a inglese, non rompere la pagina.
 */
export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;
  return {
    lang: DEFAULT_LANG,
    isTranslated: false,
    availableLangs: I18N_ROUTES_ENABLED ? ACTIVE_LANGS : [DEFAULT_LANG],
    labels: LANG_LABELS,
    slugMap: null,
    enSegments: [],
    switchLang: () => { /* no-op fuori dal provider */ },
  };
};
