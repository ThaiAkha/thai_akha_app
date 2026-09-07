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
    'which recipes', 'recipes', 'curry', 'curries', 'soup', 'stir-fry', 'stir fry', 'dessert', 'appetizer',
    'curry paste', 'pad thai', 'akha food', 'choose a dish', 'which dishes', 'vegetarian options', 'vegan options',
  ],
  build: (facts: CherryFacts) => [
    `### DISHES (authoritative - the class menu, names in the guest's language. Appetizers, the Akha dishes and desserts are cooked by everyone; each student chooses one curry with its paste, one soup and one stir-fry):`,
    ...facts.dishes.map((d) => `- ${d.category}: ${d.items.map((i) => i.name).join(', ')}`),
    `STYLE: describe warmly, don't dump the whole list unless asked. Exact ingredients: only from a RECIPE DATA block when present; otherwise say you'll check the recipe. Plain text kha.`,
  ].join('\n'),
};
