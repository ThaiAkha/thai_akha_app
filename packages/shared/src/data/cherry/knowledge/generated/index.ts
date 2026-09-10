// GENERATO DA gen-cherry-facts - NON EDITARE A MANO
// generato: 2026-09-10
// Un caricatore per lingua: import dinamico, cosi' il bundle porta solo la lingua che serve.

import type { CherryFacts } from '../types';

export const CHERRY_FACTS_LOADERS: Record<string, () => Promise<CherryFacts>> = {
  en: () => import('./facts.en').then((m) => m.CHERRY_FACTS_EN),
  es: () => import('./facts.es').then((m) => m.CHERRY_FACTS_ES),
  fr: () => import('./facts.fr').then((m) => m.CHERRY_FACTS_FR),
  de: () => import('./facts.de').then((m) => m.CHERRY_FACTS_DE),
  pt: () => import('./facts.pt').then((m) => m.CHERRY_FACTS_PT),
  it: () => import('./facts.it').then((m) => m.CHERRY_FACTS_IT),
  ca: () => import('./facts.ca').then((m) => m.CHERRY_FACTS_CA),
  nl: () => import('./facts.nl').then((m) => m.CHERRY_FACTS_NL),
  th: () => import('./facts.th').then((m) => m.CHERRY_FACTS_TH),
  zh: () => import('./facts.zh').then((m) => m.CHERRY_FACTS_ZH),
  ko: () => import('./facts.ko').then((m) => m.CHERRY_FACTS_KO),
  ja: () => import('./facts.ja').then((m) => m.CHERRY_FACTS_JA),
};
