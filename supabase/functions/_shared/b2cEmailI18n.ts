// Path: supabase/functions/_shared/b2cEmailI18n.ts
// #172: testi delle email B2C del booking cliente. Master nel brain (148/1481_01_Email_Booking):
//   142_03_B2C-01a..d  conferma al cliente (Morning/Evening x cash on arrival/paid)
//   142_03_B2C-01-Admin notifica interna allo staff (in EN come la 1420_01 contact)
//   142_03_B2C-06       promemoria 24 ore prima della classe (pickup, cucina o pickup non scelto)
// Oggi il master esiste solo in EN, quindi PACKS ha il solo pack 'en': la lingua del cliente
// (profiles.preferred_language) viene comunque letta e riportata in results.lang; quando arriva
// un pack TH/ES/ZH basta aggiungerlo qui. Mai ritradurre nel codice: si corregge il master
// e si ricopia (regola /email, audit #54).
// Orari e prezzi NON sono cablati: arrivano da class_sessions (start_time, end_time, price_thb).
// Finestre pickup canoniche 015: morning 8:15-9:00 am, evening 4:15-5:00 pm.

import { type Lang, LINK, escapeHtml, fmtDate, fmtTime, wrap } from './agencyEmailI18n.ts'

export interface B2cSession {
  display_name: string
  price_thb: number
  start_time: string
  end_time: string
  has_market_tour: boolean
}

export interface B2cBooking {
  internal_id: string
  booking_ref: string | null
  session_id: string
  booking_date: string
  pax_count: number | null
  visitor_count: number | null
  total_price: number | null
  payment_method: string | null
  payment_status: string | null
  hotel_name: string | null
  pickup_zone: string | null
  pickup_time: string | null
  guest_name: string | null
  guest_email: string | null
  phone_prefix: string | null
  phone_number: string | null
  special_requests: string | null
  customer_note: string | null
  booking_source: string | null
  session: B2cSession | null
}

type SessionKey = 'morning_class' | 'evening_class'
export type PickupState = 'hotel' | 'kitchen' | 'unset'

// Il front inserisce hotel_name 'Update in profile' + pickup_zone 'walk-in' finche' il cliente
// non sceglie il pickup nella PickUpPage (useBookingSubmit.buildBookingPayload).
const PLACEHOLDER_HOTEL = 'Update in profile'

// Fatti canonici 015 (gli stessi della B2C-06 master)
const MAP_URL = 'https://maps.app.goo.gl/kwgXVPjR6vhTVeXV7'
const ADDRESS_EN = '14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District, Chiang Mai 50100, Thailand'
const ADDRESS_TH = 'Thai Akha Kitchen 14/10 ซอย2ก ถนนราชเชียงแสน ตําบลหายยา อําเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50100'
const PHONE = '+66 61 325 4611'
const MENU_URL = 'https://www.thaiakha.com/menu'
const COOKBOOK_URL = 'https://www.thaiakhakitchen.com/cookbook/'
const ADMIN_URL = 'https://admin.thaiakha.com/manager-reservation'

export function sessionKey(b: B2cBooking): SessionKey {
  return b.session_id === 'evening_class' ? 'evening_class' : 'morning_class'
}

export function pickupState(b: B2cBooking): PickupState {
  if (b.hotel_name === PLACEHOLDER_HOTEL) return 'unset'
  if (!b.hotel_name || b.pickup_zone === 'walk-in') return 'kitchen'
  return 'hotel'
}

export function isPaid(b: B2cBooking): boolean {
  return b.payment_status === 'paid'
}

export function fmtBaht(n: number): string {
  return `${Math.round(n).toLocaleString('en-GB')} Baht`
}

interface Pack {
  classLabel: Record<SessionKey, string>
  classShort: Record<SessionKey, string>
  guestFallback: string
  labels: { bookingRef: string; class: string; date: string; time: string; guests: string; visitors: string; price: string; paidOnline: string; pickup: string; meetingAtKitchen: string; notChosen: string }
  pickup: {
    ready: Record<SessionKey, string>
    window: Record<SessionKey, string>
    hotel: (hotel: string, ready: string, window: string) => string
    around: (time: string) => string
    kitchen: (start: string) => string
    unset: (start: string) => string
    sign: string
  }
  confirm: {
    subjectCash: (cls: string, date: string) => string
    subjectPaid: (cls: string, date: string) => string
    greeting: (name: string) => string
    introCash: (cls: string) => string
    introPaid: (cls: string) => string
    priceCash: (perPerson: string) => string
    cardNote: string
    chooseTitle: string
    choose: string
    cookbookPre: string
    cookbookPost: string
    cancellation: string
    changes: string
    signoff: string
    team: string
  }
  reminder: {
    subjectHotel: (ready: string, hotel: string) => string
    subjectKitchen: (cls: string) => string
    greeting: (name: string) => string
    intro: string
    quick: string
    yourPickup: string
    onTheDay: string
    bullets: [string, string, string, string]
    location: string
    openMaps: string
    showTaxi: string
    reachUs: string
    callOrWhatsapp: string
    email: string
    seeYou: string
    signoff: string
    team: string
  }
}

const PACKS: Partial<Record<Lang, Pack>> & { en: Pack } = {
  en: {
    classLabel: { morning_class: 'Morning Cooking Class & Market Tour', evening_class: 'Evening Cooking Class' },
    classShort: { morning_class: 'Morning Cooking Class', evening_class: 'Evening Cooking Class' },
    guestFallback: 'guest',
    labels: { bookingRef: 'Booking ref', class: 'Class', date: 'Date', time: 'Time', guests: 'Guests', visitors: 'Visitors', price: 'Price', paidOnline: 'Paid online', pickup: 'Pickup', meetingAtKitchen: 'meeting at our kitchen', notChosen: 'not chosen yet' },
    pickup: {
      ready: { morning_class: '8:15 am', evening_class: '4:15 pm' },
      window: { morning_class: 'between 8:15 am and 9:00 am', evening_class: 'between 4:15 pm and 5:00 pm' },
      hotel: (hotel, ready, window) => `Pickup from ${hotel}. Please be ready in the hotel lobby at ${ready}: our driver will arrive ${window}.`,
      around: (time) => `around ${time}`,
      kitchen: (start) => `Please come directly to our kitchen at ${start}. We are a 5 minute walk from Chiang Mai South Gate.`,
      unset: (start) => `You have not chosen a pickup point yet. Add your hotel in your account (free pickup inside the city) or come directly to our kitchen at ${start}.`,
      sign: 'Our driver will be holding a Thai Akha Kitchen sign.',
    },
    confirm: {
      subjectCash: (cls, date) => `Confirmed (cash on arrival): ${cls}, ${date}`,
      subjectPaid: (cls, date) => `Confirmed and paid: ${cls}, ${date}`,
      greeting: (name) => `Dear ${name},`,
      introCash: (cls) => `We are happy to confirm your place in our ${cls}. It is now in our calendar, and our kitchen is ready.`,
      introPaid: (cls) => `We are happy to confirm your place in our ${cls}. Your payment has arrived, thank you: it is now in our calendar, and our kitchen is ready.`,
      priceCash: (perPerson) => `${perPerson} per person, to be paid in cash on arrival`,
      cardNote: 'On-site payment is cash preferred. Credit or debit card payments on-site carry a 3% transaction fee.',
      chooseTitle: 'Choose your menu',
      choose: 'Before class, pick the dishes you want to cook here:',
      cookbookPre: 'Our cookbook, with every recipe we teach and the stories behind them, is waiting for you at',
      cookbookPost: '(password: ThaiAkhaBook).',
      cancellation: 'Free cancellation up to 48 hours before the class.',
      changes: 'If anything changes, just reply to this email and we will take care of it.',
      signoff: 'Warm regards,',
      team: 'The Thai Akha Kitchen Team',
    },
    reminder: {
      subjectHotel: (ready, hotel) => `Your pickup is tomorrow: ${ready} from ${hotel}`,
      subjectKitchen: (cls) => `Tomorrow: ${cls} at Thai Akha Kitchen`,
      greeting: (name) => `Dear ${name},`,
      intro: 'Your Thai Akha Cooking Class is tomorrow. We are looking forward to cooking with you!',
      quick: 'Here is a quick reminder of everything you need to know.',
      yourPickup: 'Your pickup',
      onTheDay: 'On the day',
      bullets: [
        'Wear comfortable clothes: cooking can get a little messy.',
        'We provide aprons, all equipment and ingredients.',
        'Bring a light jacket: our kitchen is open-air.',
        'Do not eat too much before class: there will be a lot of food.',
      ],
      location: 'School location (just in case)',
      openMaps: 'Open in Maps',
      showTaxi: 'Show this to your taxi driver:',
      reachUs: 'Need to reach us?',
      callOrWhatsapp: 'Call or WhatsApp',
      email: 'Email',
      seeYou: 'We cannot wait to see you tomorrow.',
      signoff: 'Warm regards,',
      team: 'The Thai Akha Kitchen Team',
    },
  },
}

/** Pack della lingua richiesta, oggi sempre EN: results.lang dice cosa e' partito davvero. */
export function pickB2cLang(lang: Lang): Lang {
  return PACKS[lang] ? lang : 'en'
}

function pack(lang: Lang): Pack {
  return PACKS[lang] ?? PACKS.en
}

function startTime(b: B2cBooking, lang: Lang): string {
  return b.session ? fmtTime(b.session.start_time, lang) : pack(lang).pickup.ready[sessionKey(b)]
}

function timeRange(b: B2cBooking, lang: Lang): string {
  if (!b.session) return '-'
  return `${fmtTime(b.session.start_time, lang)} - ${fmtTime(b.session.end_time, lang)}`
}

export function pickupLine(b: B2cBooking, lang: Lang): string {
  const p = pack(lang).pickup
  const s = sessionKey(b)
  switch (pickupState(b)) {
    case 'hotel': {
      const ready = b.pickup_time ? fmtTime(b.pickup_time, lang) : p.ready[s]
      const window = b.pickup_time ? p.around(fmtTime(b.pickup_time, lang)) : p.window[s]
      return `${p.hotel(escapeHtml(b.hotel_name ?? ''), ready, window)} ${p.sign}`
    }
    case 'kitchen': return p.kitchen(startTime(b, lang))
    default: return p.unset(startTime(b, lang))
  }
}

function row(k: string, v: string): string {
  return `<tr><td style="padding:4px 0;width:150px;color:#5E6464;">${k}</td><td style="padding:4px 0;"><strong>${v}</strong></td></tr>`
}

function table(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.map(([k, v]) => row(k, v)).join('\n')}</table>`
}

function pickupCell(b: B2cBooking, lang: Lang): string {
  const t = pack(lang).labels
  switch (pickupState(b)) {
    case 'hotel': return escapeHtml(b.hotel_name ?? '')
    case 'kitchen': return t.meetingAtKitchen
    default: return t.notChosen
  }
}

export interface EmailContent { subject: string; html: string }

// 142_03_B2C-01a..d: conferma al cliente
export function buildB2cConfirmation(b: B2cBooking, customerName: string, lang: Lang): EmailContent {
  const t = pack(lang)
  const c = t.confirm
  const s = sessionKey(b)
  const paid = isPaid(b)
  const date = fmtDate(b.booking_date, lang)
  const perPerson = b.session ? fmtBaht(b.session.price_thb) : ''
  const pax = b.pax_count ?? 1
  const rows: Array<[string, string]> = [
    [t.labels.bookingRef, b.booking_ref ?? b.internal_id],
    [t.labels.class, t.classLabel[s]],
    [t.labels.date, date],
    [t.labels.time, timeRange(b, lang)],
    [t.labels.guests, String(pax)],
  ]
  if (b.visitor_count) rows.push([t.labels.visitors, String(b.visitor_count)])
  rows.push([t.labels.price, paid ? t.labels.paidOnline : c.priceCash(perPerson)])
  rows.push([t.labels.pickup, pickupCell(b, lang)])
  const subject = (paid ? c.subjectPaid : c.subjectCash)(t.classShort[s], date)
  const html = wrap(`
<p>${c.greeting(escapeHtml(customerName))}</p>
<p>${paid ? c.introPaid(t.classLabel[s]) : c.introCash(t.classLabel[s])}</p>
${table(rows)}
${paid ? '' : `<p style="margin-top:12px;color:#5E6464;font-size:13px;">${c.cardNote}</p>`}
<div style="margin-top:16px;padding:16px;background:#f7f5f2;border-radius:6px;">
  <p style="margin:0 0 8px;">${pickupLine(b, lang)}</p>
  <p style="margin:0 0 8px;"><strong>${c.chooseTitle}</strong><br />${c.choose}<br />
  ${LINK(MENU_URL, 'thaiakha.com/menu')}</p>
  <p style="margin:0;">${c.cookbookPre} ${LINK(COOKBOOK_URL, 'thaiakhakitchen.com/cookbook')} ${c.cookbookPost}</p>
</div>
<p>${c.cancellation}<br />${c.changes}</p>
<p>${c.signoff}<br />${c.team}<br />office@thaiakhakitchen.com</p>`)
  return { subject, html }
}

// 142_03_B2C-06: promemoria 24 ore prima (a tutti: pickup, cucina o pickup non scelto)
export function buildB2cReminder(b: B2cBooking, customerName: string, lang: Lang): EmailContent {
  const t = pack(lang)
  const r = t.reminder
  const s = sessionKey(b)
  const date = fmtDate(b.booking_date, lang)
  const state = pickupState(b)
  const ready = b.pickup_time ? fmtTime(b.pickup_time, lang) : t.pickup.ready[s]
  const subject = state === 'hotel'
    ? r.subjectHotel(ready, b.hotel_name ?? '')
    : r.subjectKitchen(t.classShort[s])
  const html = wrap(`
<p>${r.greeting(escapeHtml(customerName))}</p>
<p>${r.intro}</p>
<p>${r.quick}</p>
${table([
    [t.labels.class, t.classLabel[s]],
    [t.labels.date, date],
    [t.labels.time, timeRange(b, lang)],
    [t.labels.bookingRef, b.booking_ref ?? b.internal_id],
  ])}
<div style="margin-top:16px;padding:16px;background:#f7f5f2;border-radius:6px;">
  <p style="margin:0 0 8px;"><strong>${r.yourPickup}</strong></p>
  <p style="margin:0;">${pickupLine(b, lang)}</p>
</div>
<p style="margin-top:16px;"><strong>${r.onTheDay}</strong></p>
<ul style="margin:0 0 12px;padding-left:20px;">
  <li>${r.bullets[0]}</li>
  <li>${r.bullets[1]}</li>
  <li>${r.bullets[2]}</li>
  <li>${r.bullets[3]}</li>
</ul>
<p><strong>${r.location}</strong><br />${ADDRESS_EN}<br />${LINK(MAP_URL, r.openMaps)}</p>
<p>${r.showTaxi}<br />${ADDRESS_TH}</p>
<p><strong>${r.reachUs}</strong><br />${r.callOrWhatsapp}: ${PHONE}<br />${r.email}: office@thaiakhakitchen.com</p>
<p>${r.seeYou}</p>
<p>${r.signoff}<br />${r.team}<br />office@thaiakhakitchen.com</p>`)
  return { subject, html }
}

// 142_03_B2C-01-Admin: notifica interna allo staff (EN, come la 1420_01 contact)
export function buildAdminNewBooking(b: B2cBooking, customerName: string, customerEmail: string): EmailContent {
  const t = PACKS.en
  const s = sessionKey(b)
  const date = fmtDate(b.booking_date, 'en')
  const pax = b.pax_count ?? 1
  const channel = b.booking_source === 'admin_console' ? 'Staff console' : 'Direct web (thaiakha.com)'
  const payment = `${b.payment_method ?? '-'} / ${b.payment_status ?? '-'}${b.total_price ? ` / ${fmtBaht(b.total_price)}` : ''}`
  const pickup = pickupState(b) === 'hotel'
    ? `${escapeHtml(b.hotel_name ?? '')}${b.pickup_time ? `, ${fmtTime(b.pickup_time, 'en')}` : ''}${b.pickup_zone ? ` (${b.pickup_zone})` : ''}`
    : pickupState(b) === 'kitchen' ? 'meeting at the kitchen' : 'not chosen yet'
  const notes = [b.special_requests, b.customer_note].filter((x): x is string => !!x && x.trim() !== '').map(escapeHtml).join('<br />') || 'none'
  const phone = [b.phone_prefix, b.phone_number].filter(Boolean).join(' ') || '-'
  const subject = `New booking ${b.booking_ref ?? b.internal_id}: ${t.classShort[s]}, ${date}, ${pax} guests`
  const html = wrap(`
<p><strong>New booking received</strong></p>
${table([
    ['Booking ref', b.booking_ref ?? b.internal_id],
    ['Class', t.classLabel[s]],
    ['Date', date],
    ['Time', timeRange(b, 'en')],
    ['Guests', `${pax}${b.visitor_count ? ` (+ ${b.visitor_count} visitor)` : ''}`],
    ['Customer', escapeHtml(customerName)],
    ['Email', escapeHtml(customerEmail)],
    ['Phone', escapeHtml(phone)],
    ['Channel', channel],
    ['Payment', payment],
    ['Pickup', pickup],
    ['Requests', notes],
  ])}
<p style="margin-top:16px;">${LINK(ADMIN_URL, 'Open the admin console')}</p>
<p style="color:#5E6464;font-size:12px;">Generated by the Thai Akha booking system. Do not reply to this email.</p>`)
  return { subject, html }
}
