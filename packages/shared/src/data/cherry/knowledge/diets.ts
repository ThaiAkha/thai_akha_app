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
    'allerg', 'gluten', 'celiac', 'coeliac', 'diet', 'dietary', 'intoleran', 'peanut', 'tree nut',
    'shellfish', 'seafood', 'lactose', 'dairy',
  ],
  build: (facts: CherryFacts) => [
    `### DIETS & ALLERGIES WE SUPPORT (authoritative names):`,
    `Lifestyle: ${facts.diets.lifestyle.join(', ')}. Religious: ${facts.diets.religious.join(', ')}. Allergies: ${facts.diets.allergies.join(', ')}.`,
    `Every guest cooks at their own station with zero cross-contamination. For exact substitutions rely on a DIET & ALLERGY block. Plain text kha.`,
  ].join('\n'),
};
