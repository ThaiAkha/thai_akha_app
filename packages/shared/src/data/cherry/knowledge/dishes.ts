// ─────────────────────────────────────────────────────────────────────────────
// Il menu della classe: i 22 piatti per categoria, con i nomi nella lingua
// dell'ospite (recipes + content_categories + sidecar). Gli ingredienti esatti
// NON stanno qui: arrivano dal blocco RECIPE DATA, su richiesta.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryKnowledgeModule, CherryFacts } from './types';

export const dishesModule: CherryKnowledgeModule = {
  id: 'dishes',
  keywords: [
    'menu', 'dish', 'dishes', 'what do we cook', 'what will we cook', 'what can we cook', 'what do you cook',
    'which recipes', 'recipes', 'curry', 'curries', 'soup', 'stir', 'dessert', 'appetizer', 'paste',
    'pad thai', 'akha food', 'choose', 'vegetarian options', 'vegan options',
  ],
  build: (facts: CherryFacts) => [
    `### DISHES (authoritative - the class menu, names in the guest's language; each student picks their own dishes across the categories):`,
    ...facts.dishes.map((d) => `- ${d.category}: ${d.items.map((i) => i.name).join(', ')}`),
    `STYLE: describe warmly, don't dump the whole list unless asked; for exact ingredients rely ONLY on a RECIPE DATA block. Plain text kha.`,
  ].join('\n'),
};
