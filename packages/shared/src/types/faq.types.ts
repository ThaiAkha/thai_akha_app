/**
 * 🍵 FAQ - contratto UI
 *
 * Forma delle FAQ rese dall'app. I DATI vengono dal database (`faq_categories` +
 * `faq_questions`, lette da getFaqData/getPageFaqs/getEntityFaqs): qui ci sono solo i
 * tipi, che restano il contratto fra il servizio che legge il DB e i componenti che
 * rendono (FAQRichAnswer, FAQPage, FaqBottomPage).
 *
 * Storia: questi tipi vivevano in `data/faqQuestion.ts` insieme a 31 FAQ hardcoded.
 * Il file dati e' stato eliminato il 2026-07-31 (le FAQ erano una riformulazione di
 * contenuti che Cherry gia' riceve dalle sorgenti originali del DB, e derivavano:
 * contenevano un indirizzo non piu' valido). I tipi restano perche' descrivono la UI,
 * non i dati.
 */

/** Link di riferimento inline dentro una risposta. */
export interface FAQLink {
    label: string;
    type: 'internal' | 'external';
    /** internal: chiave pagina per onNavigate */
    page?: string;
    /** internal: sectionId (es. slug articolo news) */
    section?: string;
    /** external: URL completa */
    url?: string;
}

/**
 * CTA in fondo alla risposta.
 * Unificazione 2026-07: la colonna DB `faq_questions.links` e' incorporata in
 * `cta.links` (colonna `links` droppata). Il payload puo' essere: solo bottone
 * (label+page), solo links, o entrambi. Senza `label` non si rende alcun bottone.
 */
export interface FAQCta {
    label?: string;
    page?: string;
    section?: string;
    variant?: 'brand' | 'action' | 'outline' | 'social' | 'btn-s';
    /** Material Symbol name (snake_case) */
    icon?: string;
    /** Link di riferimento inline (ex colonna links) */
    links?: FAQLink[];
}

/** Singola domanda con risposta. */
export interface FAQItem {
    question: string;
    answer: string;
    links?: FAQLink[];
    cta?: FAQCta;
}

/** Categoria di FAQ (accordion dell'hub). */
export interface FAQCategory {
    id: string;
    categoryTitle: string;
    items: FAQItem[];
}
