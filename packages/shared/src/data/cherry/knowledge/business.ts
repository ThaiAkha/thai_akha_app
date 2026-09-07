// ─────────────────────────────────────────────────────────────────────────────
// Azienda: contatti, indirizzo, orari, social, valutazione. Dati da CherryFacts
// (business_profile). L'indirizzo canonico vive nel database (deciso dall'owner
// il 2026-08-03): qui non si riscrive, si rende.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryKnowledgeModule, CherryFacts } from './types';

/** schema.org "Mo-Su 08:00-22:00" -> "every day 08:00-22:00". */
const hours = (h: string) => h.replace(/^Mo-Su\s+/, 'every day ');

/** "https://www.instagram.com/thaiakhakitchen/" -> "@thaiakhakitchen"; altrimenti il solo nome del canale. */
function handle(type: string, url: string): string {
  if (!['instagram', 'x', 'pinterest', 'youtube'].includes(type)) return type;
  const seg = url.replace(/\/+$/, '').split('/').pop() ?? '';
  return seg && !/^(channel|user|c)$/.test(seg) && !/^UC[\w-]{10,}$/.test(seg) ? `${type} @${seg}` : type;
}

export const businessModule: CherryKnowledgeModule = {
  id: 'business',
  keywords: [
    'address', 'where are you', 'where is', 'location', 'how to find', 'how do i get there',
    'phone', 'telephone', 'call you', 'whatsapp', 'contact', 'email', 'reach you',
    'opening hours', 'open', 'hours', 'what time do you open', 'instagram', 'facebook',
    'social', 'review', 'reviews', 'rating', 'tripadvisor', 'indirizzo', 'telefono',
    'contatt', 'orari', 'dove siete', 'recension',
  ],
  build: (facts: CherryFacts) => {
    const b = facts.business;
    const contact = [
      b.telephone ? `phone ${b.telephone}` : null,
      b.whatsapp && b.whatsapp !== b.telephone ? `WhatsApp ${b.whatsapp}` : b.whatsapp ? 'WhatsApp on the same number' : null,
      b.email ? `email ${b.email}` : null,
    ].filter(Boolean).join(', ');
    const rating = b.rating ? `Rated ${b.rating.value}${b.rating.count ? ` from over ${Number(b.rating.count).toLocaleString('en-US')} reviews` : ''}.` : '';
    return [
      `### BUSINESS INFO (authoritative - give contact/address/hours from here, never invent):`,
      `${b.name}, a family-run cooking school in Chiang Mai${b.foundingYear ? ` since ${b.foundingYear}` : ''}.`,
      `Address: ${b.address}.${b.openingHours.length ? ` Open ${b.openingHours.map(hours).join(', ')}.` : ''}${b.areaServed.length ? ` Area served: ${b.areaServed.join(', ')}.` : ''}`,
      contact ? `Contact: ${contact}.` : '',
      [b.priceRange ? `Price: ${b.priceRange} per class.` : '', rating].filter(Boolean).join(' '),
      b.socials.length ? `Socials: ${b.socials.map((s) => handle(s.type, s.url)).join(', ')}.` : '',
      `STYLE: warm; share exactly what is asked (address / phone / hours / social). Plain text kha.`,
    ].filter(Boolean).join('\n');
  },
};
