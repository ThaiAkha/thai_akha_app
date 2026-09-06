/**
 * I quattro riconoscitori di Cherry con nomi TRADOTTI (sidecar) accanto alla
 * chiave inglese. Nati dalla verifica avversaria del 2026-09-06: con la lista
 * di parole generiche solo inglese, "¿Puedo pagar con tarjeta?" agganciava
 * "Sopa Clara con Tofu Suave" per la parola "con" (riprodotto in produzione).
 *
 * I contesti importano i service, che importano il client Supabase: il client
 * vuole le variabili al caricamento, quindi qui si mettono finte PRIMA
 * dell'import dinamico. Nessuna rete: si esercitano solo le funzioni pure.
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

process.env.VITE_SUPABASE_URL ??= 'http://localhost:54321';
process.env.VITE_SUPABASE_ANON_KEY ??= 'test-anon-key';

type Row = Record<string, unknown>;
let findRecipeInText: (t: string, r: Row[]) => Row | null;
let findIngredient: (t: string, r: Row[]) => Row | null;
let findCultureSection: (t: string, r: Row[]) => Row | null;
let findNewsArticle: (t: string, r: Row[]) => Row | null;
let scoreName: typeof import('../cherryTextUtils').scoreName;

before(async () => {
  ({ findRecipeInText } = await import('../cherryRecipeContext'));
  ({ findIngredient } = await import('../cherryIngredientContext'));
  ({ findCultureSection } = await import('../cherryCultureContext'));
  ({ findNewsArticle } = await import('../cherryNewsContext'));
  ({ scoreName } = await import('../cherryTextUtils'));
});

// Nomi spagnoli veri del sidecar recipes_translations (lang=es).
const RECIPES_ES: Row[] = [
  { slug: 'clear-soup', name: 'Sopa Clara con Tofu Suave', name_key: 'Clear Soup with Soft Tofu' },
  { slug: 'akha-salad', name: 'Ensalada Fresca de Montaña Akha', name_key: 'Akha Mountain Fresh Salad' },
  { slug: 'papaya-salad', name: 'Ensalada de Papaya Verde', name_key: 'Green Papaya Salad' },
];
const RECIPES_EN: Row[] = RECIPES_ES.map((r) => ({ ...r, name: r.name_key }));

test('ricette: "con" tradotto non aggancia piu\' la zuppa (falso positivo riprodotto in produzione)', () => {
  assert.equal(findRecipeInText('¿Puedo pagar con tarjeta?', RECIPES_ES), null);
  assert.equal(findRecipeInText('Posso venire con mio figlio?', RECIPES_ES), null);
  assert.equal(findRecipeInText('¿Hacemos una ensalada en la clase?', RECIPES_ES), null);
});

test('ricette: la chiave inglese riconosce, il nome tradotto alza il punteggio', () => {
  assert.equal(findRecipeInText('How do you make the tofu soup?', RECIPES_ES)?.slug, 'clear-soup');
  assert.equal(findRecipeInText('quiero la sopa con tofu', RECIPES_ES)?.slug, 'clear-soup');
  assert.equal(findRecipeInText('ensalada de papaya', RECIPES_ES)?.slug, 'papaya-salad');
});

test('ricette: in inglese il comportamento e\' quello di prima', () => {
  assert.equal(findRecipeInText('papaya salad please', RECIPES_EN)?.slug, 'papaya-salad');
  assert.equal(findRecipeInText('Can I pay with card?', RECIPES_EN), null);
  assert.equal(findRecipeInText('do we make a salad in class?', RECIPES_EN), null);
});

test('ingredienti: "fideos" tradotto non aggancia, "galangal" si\'', () => {
  const ings: Row[] = [
    { name: 'Fideos de Huevo', name_key: 'Egg Noodles' },
    { name: 'Galanga', name_key: 'Galangal' },
  ];
  assert.equal(findIngredient('¿Lleva fideos?', ings), null);
  assert.equal(findIngredient('what is galangal?', ings)?.name_key, 'Galangal');
});

test('cultura e news: titolo inglese + slug riconoscono, titolo tradotto no da solo', () => {
  const sections: Row[] = [
    { slug: 'food-as-medicine', title: 'La comida como medicina', title_key: 'Food as Medicine' },
    { slug: 'spirit-gate', title: 'La puerta de los espíritus', title_key: 'The Spirit Gate' },
  ];
  assert.equal(findCultureSection('¿La comida es muy picante?', sections), null);
  assert.equal(findCultureSection('tell me about the spirit gate', sections)?.slug, 'spirit-gate');

  const news: Row[] = [
    { slug: 'fish-sauce-guide', title: 'Guía de la salsa de pescado', title_key: 'Fish Sauce Guide' },
  ];
  assert.equal(findNewsArticle('¿Tenéis salsa de tomate?', news), null);
  assert.equal(findNewsArticle('your fish sauce guide', news)?.slug, 'fish-sauce-guide');
});

test('scoreName: il punteggio conta le ripetizioni, le distintive una volta sola', () => {
  const msg = new Set(['spirit', 'gate']);
  const same = scoreName(msg, 'The Spirit Gate spirit gate', 'The Spirit Gate spirit gate', () => true);
  assert.deepEqual(same, { score: 4, distinctive: 2, distinctiveHits: 4 });
  const localized = scoreName(msg, 'Spirit Gate', 'Puerta spirit', () => true);
  assert.deepEqual(localized, { score: 2, distinctive: 2, distinctiveHits: 2 });
});

test('news: regola storica (due colpi distintivi con ripetizione); "mai" italiano no', () => {
  const news: Row[] = [
    { slug: 'sunday-walking-street-market-chiang-mai', title: 'Il mercato della domenica a Chiang Mai', title_key: 'Sunday Walking Street Market in Chiang Mai' },
    { slug: 'how-to-play-akha-wisdom-path-quiz', title: 'Come giocare al Quiz', title_key: 'How to Play the Akha Wisdom Path Quiz: Your Complete Guide' },
  ];
  assert.equal(findNewsArticle('non l\'ho mai provato', news), null);
  assert.equal(findNewsArticle('tell me about the quiz', news)?.slug, 'how-to-play-akha-wisdom-path-quiz');
  assert.equal(findNewsArticle('is the walking street market open?', news)?.slug, 'sunday-walking-street-market-chiang-mai');
  // Una parola solo nel titolo tradotto non basta.
  assert.equal(findNewsArticle('il mercato della domenica', news), null);
  // Una distintiva presente una volta sola + una generica: NON basta (era cosi' anche prima).
  const once: Row[] = [{ slug: 'akha-kitchen-story', title: 'Akha Kitchen Story', title_key: 'The Sunrise Kitchen Story' }];
  assert.equal(findNewsArticle('tell me the sunrise story', once), null);
});
