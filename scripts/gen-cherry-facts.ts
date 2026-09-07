/**
 * gen-cherry-facts.ts - genera i fatti canonici di Cherry, un file per lingua, in
 * packages/shared/src/data/cherry/knowledge/generated/ a partire dal database.
 *
 * Uso:  pnpm gen-cherry-facts
 *
 * Perche' esiste: fino al 2026-09-07 il "sapere statico" di Cherry (classi, punti di
 * ritrovo, azienda) era scritto a mano in inglese e divergeva dal database: la
 * capienza diceva "fino a 12 per classe" mentre il database e i Terms dicono
 * "12 per cucina, fino a 24 insieme, privati fino a 28". Da qui in poi il database
 * e' la fonte, questi file sono uno SPECCHIO generato: non si editano, si rigenera.
 *
 * Sorgenti: cooking_classes, class_sessions, meeting_points, business_profile,
 * recipes + content_categories, dietary_profiles, e i loro sidecar *_translations.
 * Per ogni lingua diversa dall'inglese ogni campo cade sull'inglese se il sidecar
 * non lo ha: un campo vuoto non deve mai cancellare un fatto.
 *
 * Legge con la SERVICE ROLE KEY come gen-legal (nessuna RLS in mezzo).
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CherryFacts, CherryFactsClass, CherryFactsMeetingPoint } from '../packages/shared/src/data/cherry/knowledge/types';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('[gen-cherry-facts] SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono obbligatorie (usa --env-file=.env).');
  process.exit(1);
}

const LANGS = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ca', 'nl', 'th', 'zh', 'ko', 'ja'] as const;
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../packages/shared/src/data/cherry/knowledge/generated');

type Row = Record<string, unknown>;
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const strOrNull = (v: unknown): string | null => (str(v) ? str(v) : null);
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
/** "09:00:00" -> "09:00". */
const hhmm = (v: unknown): string => str(v).slice(0, 5);
/** Campo tradotto se presente e non vuoto, altrimenti quello inglese. */
const pick = (base: Row, tr: Row | undefined, field: string): unknown => {
  const t = tr?.[field];
  if (typeof t === 'string') return t.trim() ? t : base[field];
  if (Array.isArray(t)) return t.length ? t : base[field];
  return base[field];
};

const COUNTRY: Record<string, string> = { TH: 'Thailand' };

async function fetchAll(supabase: ReturnType<typeof createClient>) {
  const get = async (table: string, select: string, filter?: (q: any) => any) => {
    let q: any = supabase.from(table).select(select);
    if (filter) q = filter(q);
    const { data, error } = await q;
    if (error) throw new Error(`[gen-cherry-facts] lettura ${table}: ${error.message}`);
    return (data ?? []) as Row[];
  };
  return {
    classes: await get('cooking_classes', 'id, title, badge, currency, unit, duration_text, capacity_text, inclusions, schedule_items', (q) => q.eq('is_active', true).order('id')),
    classesT: await get('cooking_classes_translations', 'class_id, lang, title, badge, duration_text, capacity_text, inclusions, schedule_items'),
    sessions: await get('class_sessions', 'id, price_thb, start_time, end_time, duration_hours, has_market_tour, schedule_config, meeting_points', (q) => q.eq('active', true)),
    points: await get('meeting_points', 'id, name, point_type, is_dropoff_point, description, dropoff_description, morning_pickup_time, morning_pickup_end, evening_pickup_time, evening_pickup_end', (q) => q.eq('active', true).order('name')),
    pointsT: await get('meeting_points_translations', 'point_id, lang, name, description, dropoff_description'),
    business: await get('business_profile', 'name, legal_name, founding_date, street_address, address_locality, address_region, postal_code, address_country, telephone, email, opening_hours, price_range, area_served, aggregate_rating, contact_channels'),
    recipes: await get('recipes', 'id, slug, name, category', (q) => q.eq('recipe_type', 'class').order('name')),
    recipesT: await get('recipes_translations', 'recipe_id, lang, name'),
    categories: await get('content_categories', 'id, slug, title, title_highlight, display_order', (q) => q.eq('domain', 'recipe').order('display_order')),
    categoriesT: await get('content_categories_translations', 'category_id, lang, title, title_highlight'),
    diets: await get('dietary_profiles', 'id, name, type, display_order', (q) => q.order('display_order')),
    dietsT: await get('dietary_profiles_translations', 'profile_id, lang, name'),
  };
}

type Db = Awaited<ReturnType<typeof fetchAll>>;

function buildFacts(db: Db, lang: string, generatedAt: string): CherryFacts {
  const tr = (rows: Row[], key: string, id: unknown) => rows.find((r) => r.lang === lang && r[key] === id);

  const b = db.business[0];
  const channels = (Array.isArray(b.contact_channels) ? b.contact_channels : []) as Array<Record<string, unknown>>;
  const whatsapp = channels.find((c) => c.type === 'whatsapp' && c.is_active !== false);
  const rating = (b.aggregate_rating ?? null) as { ratingValue?: string; reviewCount?: string } | null;
  const business = {
    name: str(b.name),
    legalName: strOrNull(b.legal_name),
    foundingYear: str(b.founding_date) ? Number(str(b.founding_date).slice(0, 4)) : null,
    address: [str(b.street_address), `${str(b.address_locality)} ${str(b.postal_code)}`.trim(), COUNTRY[str(b.address_country)] ?? str(b.address_country)].filter(Boolean).join(', '),
    telephone: strOrNull(b.telephone),
    whatsapp: whatsapp ? strOrNull(whatsapp.value) : null,
    email: strOrNull(b.email),
    openingHours: arr(b.opening_hours),
    priceRange: strOrNull(b.price_range),
    areaServed: arr(b.area_served),
    rating: rating?.ratingValue ? { value: String(rating.ratingValue), count: String(rating.reviewCount ?? '') } : null,
    socials: channels
      .filter((c) => c.is_active !== false && str(c.url) && !['whatsapp', 'line', 'messenger'].includes(str(c.type)))
      .map((c) => ({ type: str(c.type), url: str(c.url) })),
  };

  const classes: CherryFactsClass[] = [...db.classes]
    .sort((a, b) => hhmm(db.sessions.find((s) => s.id === a.id)?.start_time).localeCompare(hhmm(db.sessions.find((s) => s.id === b.id)?.start_time)))
    .map((c) => {
    const t = lang === 'en' ? undefined : tr(db.classesT, 'class_id', c.id);
    const s = db.sessions.find((x) => x.id === c.id);
    if (!s) throw new Error(`[gen-cherry-facts] class_sessions senza riga per ${String(c.id)}`);
    const cfg = (s.schedule_config ?? {}) as { market_tour?: { enabled?: boolean; start?: string; end?: string }; pickup_windows?: Record<string, string> };
    const schedule = (pick(c, t, 'schedule_items') as Array<Record<string, unknown>> | null) ?? [];
    const walkIn = (Array.isArray(s.meeting_points) ? s.meeting_points : []) as Array<Record<string, unknown>>;
    return {
      id: str(c.id),
      title: str(pick(c, t, 'title')),
      badge: strOrNull(pick(c, t, 'badge')),
      priceThb: Number(s.price_thb),
      currency: str(c.currency) || 'THB',
      unit: str(c.unit) || 'per person',
      startTime: hhmm(s.start_time),
      endTime: hhmm(s.end_time),
      durationText: strOrNull(pick(c, t, 'duration_text')),
      hasMarketTour: Boolean(s.has_market_tour),
      marketTour: cfg.market_tour?.enabled && cfg.market_tour.start && cfg.market_tour.end ? { start: cfg.market_tour.start, end: cfg.market_tour.end } : null,
      pickupWindows: cfg.pickup_windows ?? {},
      capacityText: strOrNull(pick(c, t, 'capacity_text')),
      inclusions: arr(pick(c, t, 'inclusions')),
      schedule: schedule.map((i) => ({ label: str(i.label), time: str(i.time), description: str(i.description) })),
      walkIn: walkIn.map((w) => ({ name: str(w.name), time: str(w.time), note: str(w.note) })),
    };
  });

  const meetingPoints: CherryFactsMeetingPoint[] = db.points.map((p) => {
    const t = lang === 'en' ? undefined : tr(db.pointsT, 'point_id', p.id);
    return {
      id: str(p.id),
      name: str(pick(p, t, 'name')),
      type: str(p.point_type),
      description: str(pick(p, t, 'description')),
      dropoffDescription: strOrNull(pick(p, t, 'dropoff_description')),
      isDropoff: Boolean(p.is_dropoff_point),
      morning: str(p.morning_pickup_time) ? { from: hhmm(p.morning_pickup_time), to: str(p.morning_pickup_end) ? hhmm(p.morning_pickup_end) : null } : null,
      evening: str(p.evening_pickup_time) ? { from: hhmm(p.evening_pickup_time), to: str(p.evening_pickup_end) ? hhmm(p.evening_pickup_end) : null } : null,
    };
  });

  const dishes = db.categories
    .map((cat) => {
      const t = lang === 'en' ? undefined : tr(db.categoriesT, 'category_id', cat.id);
      const label = `${str(pick(cat, t, 'title'))} ${str(pick(cat, t, 'title_highlight'))}`.trim();
      const items = db.recipes
        .filter((r) => r.category === cat.id)
        .map((r) => ({ slug: str(r.slug), name: str(pick(r, lang === 'en' ? undefined : tr(db.recipesT, 'recipe_id', r.id), 'name')) }));
      return { category: label, categorySlug: str(cat.slug), items };
    })
    .filter((c) => c.items.length > 0);

  const dietName = (d: Row) => str(pick(d, lang === 'en' ? undefined : tr(db.dietsT, 'profile_id', d.id), 'name'));
  const diets = {
    lifestyle: db.diets.filter((d) => d.type === 'lifestyle').map(dietName),
    religious: db.diets.filter((d) => d.type === 'religious').map(dietName),
    allergies: db.diets.filter((d) => d.type === 'allergy').map(dietName),
  };

  return { lang, generatedAt, business, classes, meetingPoints, dishes, diets };
}

const header = (lang: string, generatedAt: string) => [
  '// GENERATO DA gen-cherry-facts - NON EDITARE A MANO',
  `// lang: ${lang} | generato: ${generatedAt}`,
  '// Sorgenti: cooking_classes, class_sessions, meeting_points, business_profile,',
  '// recipes + content_categories, dietary_profiles e i sidecar *_translations',
  '// (campo per campo, con ricaduta sull inglese). Per cambiare un fatto: aggiorna',
  '// il database, poi `pnpm gen-cherry-facts`.',
  '',
].join('\n');

async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!, { auth: { persistSession: false } });
  const generatedAt = new Date().toISOString().slice(0, 10);
  const db = await fetchAll(supabase);

  // INVARIANTI: meglio non scrivere nulla che scrivere fatti a meta'.
  const problems: string[] = [];
  if (db.classes.length < 2) problems.push(`cooking_classes attive: ${db.classes.length} (attese 2)`);
  if (db.business.length !== 1) problems.push(`business_profile: ${db.business.length} righe (attesa 1)`);
  if (db.points.length < 10) problems.push(`meeting_points attivi: ${db.points.length} (attesi almeno 10)`);
  if (db.recipes.length < 20) problems.push(`recipes di classe: ${db.recipes.length} (attese almeno 20)`);
  if (db.diets.length < 15) problems.push(`dietary_profiles: ${db.diets.length} (attesi almeno 15)`);
  if (problems.length) {
    console.error(`[gen-cherry-facts] ABORT, nessun file scritto:\n - ${problems.join('\n - ')}`);
    process.exit(1);
  }

  // DUE FASI: tutto in memoria, poi si scrive.
  const pending: Array<{ path: string; content: string; log: string }> = [];
  for (const lang of LANGS) {
    const facts = buildFacts(db, lang, generatedAt);
    const exportName = `CHERRY_FACTS_${lang.toUpperCase()}`;
    const content = [
      header(lang, generatedAt),
      "import type { CherryFacts } from '../types';",
      '',
      `export const ${exportName}: CherryFacts = ${JSON.stringify(facts, null, 2)};`,
      '',
    ].join('\n');
    const translated = lang === 'en' ? '' : ` (sidecar: classi ${db.classesT.filter((r) => r.lang === lang).length}, punti ${db.pointsT.filter((r) => r.lang === lang).length}, ricette ${db.recipesT.filter((r) => r.lang === lang).length}, diete ${db.dietsT.filter((r) => r.lang === lang).length})`;
    pending.push({ path: resolve(OUT_DIR, `facts.${lang}.ts`), content, log: `facts.${lang}.ts  ${content.length} B${translated}` });
  }
  pending.push({
    path: resolve(OUT_DIR, 'index.ts'),
    content: [
      '// GENERATO DA gen-cherry-facts - NON EDITARE A MANO',
      `// generato: ${generatedAt}`,
      '// Un caricatore per lingua: import dinamico, cosi\' il bundle porta solo la lingua che serve.',
      '',
      "import type { CherryFacts } from '../types';",
      '',
      'export const CHERRY_FACTS_LOADERS: Record<string, () => Promise<CherryFacts>> = {',
      ...LANGS.map((l) => `  ${l}: () => import('./facts.${l}').then((m) => m.CHERRY_FACTS_${l.toUpperCase()}),`),
      '};',
      '',
    ].join('\n'),
    log: 'index.ts',
  });

  mkdirSync(OUT_DIR, { recursive: true });
  for (const p of pending) {
    writeFileSync(p.path, p.content);
    console.log(`[gen-cherry-facts] ${p.log}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
