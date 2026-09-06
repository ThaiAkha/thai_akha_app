import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { buildLangPath } from '../lib/langRouting';

/**
 * Costruisce l'indirizzo di un link INTERNO, con il prefisso della lingua e gli
 * slug tradotti.
 *
 * Serve perche' `RippleLink` e le card intercettano il click sinistro e navigano
 * via `onNavigate`, che la lingua la gestisce gia'; ma l'`href` grezzo resta
 * quello che il browser usa per il clic centrale, per "apri in una scheda nuova"
 * e per copia-indirizzo. Scritto a mano, quello portava sempre alla radice
 * inglese: l'utente perdeva la lingua a meta' navigazione, e il DOM di ogni
 * pagina tradotta dichiarava link verso URL inglesi.
 *
 * I segmenti si passano SEMPRE in inglese e SEMPRE canonici (il primo id della
 * route in `lib/routes.tsx`, non un alias come `history` o `news`): la
 * localizzazione avviene qui, in un punto solo.
 *
 *   const href = useInternalHref();
 *   <a href={href(CULTURE_HUB_SLUG, section.slug)}>
 */
export function useInternalHref(): (...enSegments: string[]) => string {
  const { lang, slugMap } = useLanguage();
  return useCallback(
    (...enSegments: string[]) => buildLangPath(lang, enSegments, slugMap),
    [lang, slugMap],
  );
}

export default useInternalHref;
