/**
 * Gli slug CANONICI degli hub, cioe' il PRIMO id di ogni route in `routes.tsx`.
 *
 * Le route accettano anche gli alias storici (`history`, `news`, `recipes`,
 * `faq`, `booking`), e diversi link interni li usavano: rispondono 200 ma non
 * sono l'indirizzo canonico della pagina, quindi un motore di ricerca li vede
 * come URL diversi dallo stesso contenuto e il Cloudflare Worker non redirige i
 * sotto-percorsi. I link nascono da qui, gli alias restano validi solo in entrata.
 */
export const HUB_SLUGS = {
  recipes: 'authentic-thai-akha-recipes',
  culture: 'akha-culture-highland-heritage',
  news: 'thai-cooking-tips-news',
  ingredients: 'thai-cooking-ingredients',
  booking: 'book-cooking-class-chiang-mai',
  faq: 'cooking-class-faq-chiang-mai',
} as const;
