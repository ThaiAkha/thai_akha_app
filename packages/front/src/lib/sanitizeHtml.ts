import DOMPurify, { type Config } from 'dompurify';

/**
 * sanitizeHtml - unico punto di sanitizzazione dell'HTML che arriva dal DB
 * (recipes.description/notes/author_note, faq_questions.answer, page_sections,
 * info_page_sections legali, ingredienti...) prima di dangerouslySetInnerHTML.
 *
 * Regola (audit 2026-08, P3): nel front MAI `dangerouslySetInnerHTML={{ __html: x }}`
 * nudo; sempre `{{ __html: sanitizeHtml(x) }}`. Chi scrive quelle colonne e' staff o
 * agenzia, ma un HTML salvato una volta gira nella sessione di ogni visitatore.
 *
 * Profilo: HTML standard (DOMPurify html profile: p, a, strong, em, ul/ol/li, br,
 * h*, blockquote, span, table...), niente script/style/iframe/eventi on*.
 * I link con target=_blank ricevono rel="noopener noreferrer".
 */

const purify = typeof window !== 'undefined' ? DOMPurify : null;

let hooked = false;
function ensureHooks() {
  if (hooked || !purify) return;
  hooked = true;
  purify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

const CONFIG: Config = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'form', 'input'],
};

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  if (!purify) return html; // SSR/Node: nessun DOM, il render reale avviene nel browser
  ensureHooks();
  return String(purify.sanitize(html, CONFIG));
}
