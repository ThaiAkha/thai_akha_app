// ─────────────────────────────────────────────────────────────────────────────
// Dati STATICI dell'attività — TIER-1, PROIEZIONE VERIFICATA di business_profile (DB).
// Contatti, indirizzo, orari, social, rating. Cambiano raramente → hardcoded.
// GOVERNANCE: quando business_profile cambia (indirizzo/telefono/orari/prezzi/rating),
// ri-verificare qui. Fonte-verità = DB, questo è il riepilogo AI-optimized.
// ✅ Indirizzo CANONICO (2026-08-03, deciso dall'owner):
//   14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District, Chiang Mai 50100, Thailand
//   Storia utile a non ripetere l'errore: "Ko. Alley" NON era la resa di Google Maps da
//   correggere, era la via giusta a cui mancava solo la coda amministrativa. Due tentativi
//   di "normalizzazione" l'hanno riscritta in "Soi 2 Ko" e in "Soi Rat Chiang Saen 2 Ko.,
//   Rat Chiang Saen Rd": entrambi sbagliati. Prima di toccare questa riga si chiede
//   all'owner, non si deduce da un'altra tabella.
//   I LINK a Maps non passano dall'indirizzo come stringa: usano
//   business_profile.has_map / google_place_id, che non divergono se il testo cambia.
// ─────────────────────────────────────────────────────────────────────────────

import type { CherryKnowledgeModule } from './types';

export const BUSINESS = {
  name: 'Thai Akha Kitchen',
  founded: 2015,
  address: '14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District, Chiang Mai 50100, Thailand',
  phone: '+66 61 325 4611',
  whatsapp: '+66 61 325 4611',
  email: 'office@thaiakhakitchen.com',
  openingHours: 'every day, 08:00-22:00',
  priceRange: '1,300-1,400 THB per class',
  areaServed: 'Chiang Mai city',
  rating: '5.0 from over 8,500 reviews',
  socials: {
    instagram: '@thaiakhakitchen',
    youtube: 'Thai Akha Kitchen',
    x: '@ThaiAkhaKitchen',
    other: 'TripAdvisor, Google Maps, Pinterest',
  },
};

export const businessModule: CherryKnowledgeModule = {
  id: 'business',
  keywords: [
    'address', 'where are you', 'where is', 'location', 'how to find', 'how do i get there',
    'phone', 'telephone', 'call you', 'whatsapp', 'contact', 'email', 'reach you',
    'opening hours', 'open', 'hours', 'what time do you open', 'instagram', 'facebook',
    'social', 'review', 'reviews', 'rating', 'tripadvisor', 'indirizzo', 'telefono',
    'contatt', 'orari', 'dove siete', 'recension',
  ],
  build: () => {
    const b = BUSINESS;
    return [
      `### BUSINESS INFO (authoritative - give contact/address/hours from here, never invent):`,
      `${b.name}, a family-run cooking school in Chiang Mai since ${b.founded}.`,
      `Address: ${b.address}. Open ${b.openingHours}. Area served: ${b.areaServed}.`,
      `Contact: phone/WhatsApp ${b.phone}, email ${b.email}.`,
      `Price: ${b.priceRange}. Rated ${b.rating}.`,
      `Socials: Instagram ${b.socials.instagram}, YouTube "${b.socials.youtube}", X ${b.socials.x}, plus ${b.socials.other}.`,
      `STYLE: warm; share exactly what is asked (address / phone / hours / social). Plain text kha.`,
    ].join('\n');
  },
};
