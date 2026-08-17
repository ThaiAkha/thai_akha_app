/**
 * Tipi i18next derivati dai JSON INGLESI: l'inglese è lo schema.
 *
 * Con `resolveJsonModule` ogni import JSON ha il suo tipo strutturale, e
 * i18next (v23+) legge `CustomTypeOptions.resources` per tipizzare `t()`:
 *   t('quiz:hint.title')     ✅
 *   t('quiz:hint.tittle')    ❌ errore tsc — non un warning in produzione
 *
 * Aggiungere un namespace = una riga qui + il file JSON. Il check
 * `pnpm check-ui-strings` segnala se i due elenchi divergono.
 */
import 'i18next';
import type common from './locales/en/common.json';
import type errors from './locales/en/errors.json';
import type components from './locales/en/components.json';
import type nav from './locales/en/nav.json';
import type auth from './locales/en/auth.json';
import type booking from './locales/en/booking.json';
import type history from './locales/en/history.json';
import type faq from './locales/en/faq.json';
import type classes from './locales/en/classes.json';
import type news from './locales/en/news.json';
import type recipes from './locales/en/recipes.json';
import type recipeSingle from './locales/en/recipeSingle.json';
import type quiz from './locales/en/quiz.json';
import type user from './locales/en/user.json';
import type location from './locales/en/location.json';
import type menu from './locales/en/menu.json';
import type contact from './locales/en/contact.json';
import type about from './locales/en/about.json';
import type home from './locales/en/home.json';
import type seo from './locales/en/seo.json';
import type alt from './locales/en/alt.json';
import type cherry from './locales/en/cherry.json';
import type blog from './locales/en/blog.json';

export interface FrontResources {
  common: typeof common;
  errors: typeof errors;
  components: typeof components;
  nav: typeof nav;
  auth: typeof auth;
  booking: typeof booking;
  history: typeof history;
  faq: typeof faq;
  classes: typeof classes;
  news: typeof news;
  recipes: typeof recipes;
  recipeSingle: typeof recipeSingle;
  quiz: typeof quiz;
  user: typeof user;
  location: typeof location;
  menu: typeof menu;
  contact: typeof contact;
  about: typeof about;
  home: typeof home;
  seo: typeof seo;
  alt: typeof alt;
  cherry: typeof cherry;
  blog: typeof blog;
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: FrontResources;
    // Gli array (monthsShort, cards) si leggono con { returnObjects: true }.
    returnNull: false;
  }
}
