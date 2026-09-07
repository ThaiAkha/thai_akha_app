/**
 * Pezzi puri degli strumenti di Cherry nella edge (supabase/functions/gemini-proxy-chat/toolsPure.ts).
 * Il file non importa nulla di Deno, cosi' lo esercita il runner di Node.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as loaded from '../../../../../supabase/functions/gemini-proxy-chat/toolsPure';
// Il file vive fuori dai package (nessun "type": "module"): il runner lo carica
// come CommonJS e gli export nominati stanno sotto `default`. Dentro Deno e' ESM.
type Pure = typeof import('../../../../../supabase/functions/gemini-proxy-chat/toolsPure');
const pure = ((loaded as unknown as { default?: Pure }).default ?? loaded) as Pure;
const { contentUrl, snippet, pick, rankHits, buildRecipeResult, looksNonEnglish, TOOL_DECLARATIONS, MIN_SIMILARITY } = pure;

test('url: slug inglese con prefisso lingua; ingredienti a tre livelli', () => {
  assert.equal(contentUrl('recipes', 'pad-thai', 'en'), '/authentic-thai-akha-recipes/pad-thai');
  assert.equal(contentUrl('recipes', 'pad-thai', 'es'), '/es/authentic-thai-akha-recipes/pad-thai');
  // Due livelli anche per gli ingredienti: la pagina legge solo il secondo segmento.
  assert.equal(contentUrl('ingredients', 'galangal', 'th'), '/th/thai-cooking-ingredients/galangal');
  assert.equal(contentUrl('culture', 'spirit-gate', 'ja'), '/ja/akha-culture-highland-heritage/spirit-gate');
});

test('snippet: via l HTML, taglio su parola intera', () => {
  assert.equal(snippet('<p>Hello   <b>world</b></p>'), 'Hello world');
  const long = 'parola '.repeat(80);
  const s = snippet(long, 50);
  assert.ok(s.length <= 51 && s.endsWith('…') && !s.includes('  '));
});

test('pick: tradotto se c e, altrimenti inglese', () => {
  assert.equal(pick({ name: 'Green Curry', translations: [{ name: 'Curry Verde' }] }, 'name'), 'Curry Verde');
  assert.equal(pick({ name: 'Green Curry', translations: [{ name: '  ' }] }, 'name'), 'Green Curry');
  assert.equal(pick({ name: 'Green Curry' }, 'name'), 'Green Curry');
});

test('rankHits: ordina per somiglianza, scarta i deboli, taglia', () => {
  const h = (kind: 'recipes' | 'news', slug: string, similarity: number) => ({ kind, slug, name: slug, summary: '', url: '', similarity });
  const out = rankHits([h('news', 'a', 0.31), h('recipes', 'b', 0.62), h('recipes', 'c', MIN_SIMILARITY - 0.01), h('news', 'd', 0.5)], 2);
  assert.deepEqual(out.map((x) => x.slug), ['b', 'd']);
});

test('buildRecipeResult: importanza progressiva e sostituzioni dal dato', () => {
  const recipe = {
    slug: 'green-curry', name: 'Green Curry', translations: [{ name: 'Curry Verde' }],
    recipe_key_ingredients: [
      { ingredient: 'Chicken', ingredient_id: 'i1', display_order: 2, ui_role: 'main', dietary_adaptations: { diet_vegan: { action: 'substitute', substitute_id: 'i9' } } },
      { ingredient: 'Green paste', ingredient_id: 'i2', display_order: 1, ui_role: 'main', dietary_adaptations: null },
      { ingredient: 'Fish sauce', ingredient_id: 'i3', display_order: 3, ui_role: 'base', dietary_adaptations: { diet_vegan: { action: 'omit' } } },
      { ingredient: 'Thai basil', ingredient_id: null, display_order: 4, ui_role: 'regular' },
    ],
  };
  const lib = new Map<string, Record<string, unknown>>([
    ['i1', { name: 'Chicken', description: 'Free-range chicken.' }],
    ['i2', { name: 'Green curry paste', description: 'Pounded by hand.' }],
    ['i3', { name: 'Fish sauce', description: '' }],
    ['i9', { name: 'Tofu', description: '' }],
  ]);
  const r = buildRecipeResult(recipe, lib, ['diet_vegan'], 'es');
  assert.equal(r.name, 'Curry Verde');
  assert.equal(r.url, '/es/authentic-thai-akha-recipes/green-curry');
  assert.deepEqual(r.mostImportant.map((m) => m.name), ['Green curry paste', 'Chicken']);
  assert.deepEqual(r.supporting, ['Thai basil']);
  assert.deepEqual(r.seasonings, ['Fish sauce']);
  assert.deepEqual(r.substitutions, ['Chicken → Tofu (diet_vegan)', 'Fish sauce → omitted (diet_vegan)']);
});

test('dichiarazioni: due strumenti, parametri richiesti', () => {
  assert.deepEqual(TOOL_DECLARATIONS.map((t) => t.name), ['search_content', 'get_recipe']);
  assert.deepEqual(TOOL_DECLARATIONS[0].parameters.required, ['query']);
  assert.deepEqual(TOOL_DECLARATIONS[1].parameters.required, ['slug']);
});

test('looksNonEnglish: riconosce le domande da ritradurre', () => {
  assert.equal(looksNonEnglish('what is in pad thai?'), false);
  assert.equal(looksNonEnglish('ต้มยำกุ้งใส่อะไรบ้างคะ'), true);
  assert.equal(looksNonEnglish('泰式炒河粉里有什么？'), true);
  assert.equal(looksNonEnglish('¿Qué es la flor de banano?'), true);
});

test('soglia: sopra il rumore misurato (0,35) e sotto la risposta giusta piu debole (0,41)', () => {
  assert.ok(MIN_SIMILARITY > 0.35 && MIN_SIMILARITY < 0.41);
});
