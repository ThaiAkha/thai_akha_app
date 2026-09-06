/**
 * buildPageSeo a lingue ACCESE: il perimetro si legge dall'ambiente PRIMA di
 * importare il modulo (ogni file di test gira in un processo suo).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.I18N_LANGS = 'es';
const { buildPageSeo, SITE_URL } = await import('../../services/seo.service');
const { PREFIX_ROUTES_ACTIVE } = await import('../i18n');

const row = {
  id: 'x', page_slug: 'about-thai-akha-kitchen', access_level: 'public',
  header_title_main: 'About', header_title_highlight: 'Us', page_description: 'desc',
  header_badge: null, header_icon: null, cover_media: null,
  seo_title: null, seo_description: null, seo_keywords: null, seo_robots: null,
  og_title: null, og_description: null, og_type: null, twitter_card: null,
  canonical_url: null, json_ld: null, hreflang: { en: 'dal-db' },
  seo_health_score: null, business_profile_id: null,
  summary_ai: null, key_entities: null, page_essentials: null, related_queries_geo: null,
  cherry_prompt: null, cherry_response: null, cherry_button_ids: null,
  legal_version: null, date_published: null, date_modified: null, faq_refs: null, sibling_slugs: null,
};

test('il perimetro di prova e\' acceso', () => { assert.equal(PREFIX_ROUTES_ACTIVE, true); });

test('con lo slug tradotto nel registro: canonical e localized_slug in spagnolo', () => {
  const m = buildPageSeo(row, 'es', { businessProfile: null, alternates: { es: 'sobre-thai-akha-kitchen' } })!;
  assert.equal(m.canonical_url, `${SITE_URL}/es/sobre-thai-akha-kitchen`);
  assert.equal(m.localized_slug, 'sobre-thai-akha-kitchen');
  assert.equal(m.page_slug, 'about-thai-akha-kitchen', 'l\'identita\' resta inglese');
});

test('hreflang GENERATI dal registro, non piu\' quelli del DB', () => {
  const m = buildPageSeo(row, 'es', { businessProfile: null, alternates: { es: 'sobre-thai-akha-kitchen' } })!;
  assert.ok(m.hreflang && typeof m.hreflang === 'object');
  assert.notDeepEqual(m.hreflang, { en: 'dal-db' });
  assert.ok(Object.keys(m.hreflang!).includes('en'));
});

test('registro senza la lingua: si ricade sullo slug inglese, sotto il prefisso', () => {
  const m = buildPageSeo(row, 'es', { businessProfile: null, alternates: {} })!;
  assert.equal(m.canonical_url, `${SITE_URL}/es/about-thai-akha-kitchen`);
});

test('inglese a lingue accese: nessun prefisso; home in spagnolo: solo il prefisso', () => {
  assert.equal(buildPageSeo(row, 'en', { businessProfile: null, alternates: {} })!.canonical_url, `${SITE_URL}/about-thai-akha-kitchen`);
  assert.equal(buildPageSeo({ ...row, page_slug: 'home' }, 'es', { businessProfile: null, alternates: {} })!.canonical_url, `${SITE_URL}/es/`);
});
