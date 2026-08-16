// ─────────────────────────────────────────────────────────────────────────────
// cherryDashboardHelp — how-to "Ask Cherry" per le pagine della user dashboard.
//
// Dati STATICI (fulminei, zero-DB, bundle con gli altri dati Cherry). Ogni voce è
// un preset domanda→risposta ricca (markdown-lite + blocchi foto/gallery/audio),
// iniettato a costo zero via injectInteraction (stesso motore di hint/entry-point).
//
// N voci per pagina (uno-a-molti), ordinate. Render per-voce: 'button' (pill) o
// 'text' (link semplice). Mappa per `page_slug` di site_metadata (user-*).
//
// ⚠️ Contenuti = DRAFT da rifinire con /humanizer + passi reali UI. Le foto, se
// usate nei blocks, vanno SEMPRE da media_assets (assetId), mai URL/slug.
// ─────────────────────────────────────────────────────────────────────────────

import type { NodeBlock } from './chatFlowTypes';
import { CHERRY_DASHBOARD_HELP_TH } from './cherryDashboardHelp.th';

export interface CherryHelpItem {
  /** id stabile (per memoria/analytics click). */
  id: string;
  /** Testo del pulsante/link E bolla-utente iniettata al click. */
  prompt: string;
  /** Etichetta più corta per il pill/link, se `prompt` è lungo. Altrimenti usa `prompt`. */
  shortLabel?: string;
  /** Risposta preset, markdown-lite (NO HTML). Liste/passi/grassetto ok. Apertura "Kha! 🙏". */
  response: string;
  /** Blocchi ricchi opzionali (foto/gallery/audio) — renderizzati IN CODA dopo la trascrizione. */
  blocks?: NodeBlock[];
  /** Stile di render della voce. Default 'button'. */
  render?: 'button' | 'text';
}

/** page_slug (site_metadata) → voci how-to ordinate. */
export const CHERRY_DASHBOARD_HELP: Record<string, CherryHelpItem[]> = {
  // ── Dashboard home ────────────────────────────────────────────────────────
  'user-dashboard': [
    {
      id: 'dash-overview',
      prompt: 'What can I do from my dashboard? 🙏',
      shortLabel: 'Dashboard tour',
      render: 'text',
      response:
        "Kha! 🙏 This is your home base. From here you can:\n\n" +
        "- **Passport** — see and edit your traveller details\n" +
        "- **Menu** — pick the dishes you'll cook in class\n" +
        "- **Quiz** — play the Akha Wisdom Path and earn points\n\n" +
        "Tap any section to dive in — I'm here if you get stuck.",
    },
  ],

  // ── Passport (dettagli traveller) ─────────────────────────────────────────
  'user-passport': [
    {
      id: 'passport-edit',
      prompt: 'How do I change my passport details? 🙏',
      shortLabel: 'Edit my details',
      render: 'button',
      response:
        "Kha! 🙏 Easy to update:\n\n" +
        "1. Open the **Passport** section\n" +
        "2. Tap **Edit** on the field you want to change (name, country, dietary notes…)\n" +
        "3. Type the new value\n" +
        "4. Tap **Save** — done!\n\n" +
        "Your dietary notes here help me and your chef adapt every dish to you.",
      // Esempio blocco foto (assetId da media_assets) — scommenta quando hai l'asset:
      // blocks: [{ kind: 'gallery', layout: 'grid', title: 'Where to tap', assetIds: ['howto-passport-edit-01'] }],
    },
    {
      id: 'passport-dietary',
      prompt: 'How do I set my diet or allergies? 🙏',
      shortLabel: 'Diet & allergies',
      render: 'button',
      response:
        "Kha! 🙏 In **Passport → Dietary**, switch on any diet (vegan, vegetarian…) " +
        "or allergy (peanut, shellfish…). Once saved, every recipe, menu and even my " +
        "suggestions adapt automatically — no allergen will slip through.",
    },
  ],

  // ── Menu (scelta piatti) ──────────────────────────────────────────────────
  'user-menu': [
    {
      id: 'menu-pick',
      prompt: 'How do I choose my dishes? 🙏',
      shortLabel: 'Pick my dishes',
      render: 'button',
      response:
        "Kha! 🙏 In the **Menu**, browse each course and tap a dish to add it to your " +
        "class. You can swap any choice up until class day. Dishes that clash with your " +
        "Passport diet/allergies are filtered out for you automatically.",
    },
  ],

  // ── Quiz / premi ──────────────────────────────────────────────────────────
  'user-quiz': [
    {
      id: 'quiz-rewards',
      prompt: 'How do I earn rewards? 🙏',
      shortLabel: 'Earn rewards',
      render: 'button',
      response:
        "Kha! 🙏 Every correct quiz answer earns points, and points unlock real rewards:\n\n" +
        "- **100 pts** → Ice-Cold Refreshment\n" +
        "- **300 pts** → Sounds of the Mountains\n" +
        "- **600 pts** → The Explorer's Tote Bag\n" +
        "- **1,000 pts** → The Akha Heritage E-Book\n" +
        "- **1,500 pts** → The Mountain Spice Kit\n" +
        "- **3,000 pts** → Chef's Privilege (20% off a class)\n" +
        "- **5,000 pts** → The Master Chef Apron\n\n" +
        "Just keep playing the **Akha Wisdom Path** — your points add up across every level.",
    },
    {
      id: 'quiz-hint',
      prompt: 'What is the hint button? 🙏',
      shortLabel: 'Using hints',
      render: 'text',
      response:
        "Kha! 🙏 Stuck on a question? Tap **Request Hint** (costs 50 points) and I'll give " +
        "you a gentle clue — sometimes with a photo or a little audio — without giving the " +
        "answer away.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Multilingua — STESSO pattern di chatFlowI18n: EN è la base, le altre lingue sono
// override testuali (solo i campi tradotti) applicati sopra l'inglese con fallback.
// I `blocks` (foto/audio) NON si traducono: gli assetId sono condivisi; solo gli
// eventuali titoli si possono tradurre via `blockTitles` (opzionale).
// ─────────────────────────────────────────────────────────────────────────────

/** Lingue supportate. Allineate all'app (EN/TH). */
export type HelpLocale = 'en' | 'th';

/** Override testuale di una singola voce (solo i campi tradotti). */
export interface CherryHelpTextOverride {
  prompt?: string;
  shortLabel?: string;
  response?: string;
  /** Titoli blocchi tradotti, mappati per indice del blocco. Opzionale. */
  blockTitles?: Record<number, string>;
}

/** id-voce → override testuale, per una lingua. */
export type CherryHelpOverride = Record<string, CherryHelpTextOverride>;

// Registro override per lingua. EN = base (nessun override).
const HELP_OVERRIDES: Record<HelpLocale, CherryHelpOverride> = {
  en: {},
  th: CHERRY_DASHBOARD_HELP_TH,
};

// Cache per lingua: la mappa localizzata si costruisce una sola volta.
const localizedHelpCache: Partial<Record<HelpLocale, Record<string, CherryHelpItem[]>>> = {};

function buildLocalizedHelp(locale: HelpLocale): Record<string, CherryHelpItem[]> {
  const override = HELP_OVERRIDES[locale] ?? {};
  if (Object.keys(override).length === 0) return CHERRY_DASHBOARD_HELP; // EN fallback, zero costo
  const out: Record<string, CherryHelpItem[]> = {};
  for (const [slug, items] of Object.entries(CHERRY_DASHBOARD_HELP)) {
    out[slug] = items.map(item => {
      const ov = override[item.id];
      if (!ov) return item; // voce non tradotta → fallback EN
      return {
        ...item,
        prompt: ov.prompt ?? item.prompt,
        shortLabel: ov.shortLabel ?? item.shortLabel,
        response: ov.response ?? item.response,
        blocks: ov.blockTitles && item.blocks
          ? item.blocks.map((b, i) => (ov.blockTitles![i] ? { ...b, title: ov.blockTitles![i] } : b))
          : item.blocks,
      };
    });
  }
  return out;
}

/** Voci how-to per una pagina nella lingua richiesta (default en, fallback EN per voci non tradotte). */
export function getDashboardHelp(pageSlug: string, locale: HelpLocale = 'en'): CherryHelpItem[] {
  if (locale === 'en') return CHERRY_DASHBOARD_HELP[pageSlug] ?? [];
  if (!localizedHelpCache[locale]) localizedHelpCache[locale] = buildLocalizedHelp(locale);
  return localizedHelpCache[locale]![pageSlug] ?? [];
}
