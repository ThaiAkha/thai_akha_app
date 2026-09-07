// ─────────────────────────────────────────────────────────────────────────────
// Diete e allergie gestite: i soli NOMI, nella lingua dell'ospite
// (dietary_profiles + sidecar). Le sostituzioni esatte arrivano dal blocco
// DIET & ALLERGY, che legge le stesse tabelle su richiesta. Alla voce, che non
// ha i contesti dal database, questo e' l'unico elenco.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryKnowledgeModule, CherryFacts } from './types';

export const dietsModule: CherryKnowledgeModule = {
  id: 'diets',
  keywords: [
    'vegan', 'vegetarian', 'pescatarian', 'halal', 'kosher', 'jain', 'hindu', 'rastafari',
    'allerg', 'gluten', 'celiac', 'coeliac', 'dietary', 'diet ', 'diets', 'intoleran', 'peanut', 'tree nut',
    'shellfish', 'seafood', 'lactose', 'dairy',
  ],
  build: (facts: CherryFacts) => [
    `### DIETS & ALLERGIES WE SUPPORT (authoritative names):`,
    `Lifestyle: ${facts.diets.lifestyle.join(', ')}. Religious: ${facts.diets.religious.join(', ')}. Allergies: ${facts.diets.allergies.join(', ')}.`,
    `Every guest cooks at their own station with zero cross-contamination. Exact substitutions: only from a DIET & ALLERGY block when present; otherwise invite the guest to tell you their diet or allergy. Plain text kha.`,
  ].join('\n'),
};
