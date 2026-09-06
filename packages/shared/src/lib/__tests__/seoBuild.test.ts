/**
 * buildPageSeo a lingue SPENTE (nessuna I18N_LANGS nell'ambiente): il sito di oggi.
 * Test possibile solo da oggi: prima questa logica viveva dentro la lettura dal DB.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPageSeo, SITE_URL } from '../../services/seo.service';
import type { BusinessProfile } from '../../types/content.types';

const row = (over: Record<string, unknown> = {}) => ({
  id: 'x', page_slug: 'about-thai-akha-kitchen', access_level: 'public',
  header_title_main: 'About', header_title_highlight: 'Us', page_description: 'desc',
  header_badge: null, header_icon: null, cover_media: { image_url: '/img/a.jpg' },
  seo_title: null, seo_description: null, seo_keywords: null, seo_robots: null,
  og_title: null, og_description: null, og_type: null, twitter_card: null,
  canonical_url: null, json_ld: null, hreflang: { en: `${SITE_URL}/about-thai-akha-kitchen` },
  seo_health_score: null, business_profile_id: null,
  summary_ai: null, key_entities: null, page_essentials: null, related_queries_geo: null,
  cherry_prompt: null, cherry_response: null, cherry_button_ids: null,
  legal_version: null, date_published: null, date_modified: null, faq_refs: null, sibling_slugs: null,
  ...over,
});
const deps = { businessProfile: null, alternates: {} };

test('riga non valida -> null (il chiamante ricade sui default)', () => {
  assert.equal(buildPageSeo(null, 'en', deps), null);
  assert.equal(buildPageSeo({ id: 'x' }, 'en', deps), null);
});

test('titolo e descrizione di ripiego, come prima', () => {
  const m = buildPageSeo(row(), 'en', deps)!;
  assert.equal(m.seo_title, 'About Us | Thai Akha Kitchen');
  assert.equal(m.seo_description, 'desc');
  assert.deepEqual(m.seo_keywords, []);
});

test('robots: pubblica senza indicazione -> index; non pubblica -> noindex sempre', () => {
  assert.equal(buildPageSeo(row(), 'en', deps)!.seo_robots, 'index, follow');
  assert.equal(buildPageSeo(row({ seo_robots: 'noindex, follow' }), 'en', deps)!.seo_robots, 'noindex, follow');
  assert.equal(buildPageSeo(row({ access_level: 'user', seo_robots: 'index, follow' }), 'en', deps)!.seo_robots, 'noindex, nofollow');
});

test('a lingue spente il canonical e\' SEMPRE inglese e gli hreflang restano quelli del DB', () => {
  const m = buildPageSeo(row(), 'es', deps)!;
  assert.equal(m.canonical_url, `${SITE_URL}/about-thai-akha-kitchen`);
  assert.equal(m.localized_slug, 'about-thai-akha-kitchen');
  assert.deepEqual(m.hreflang, { en: `${SITE_URL}/about-thai-akha-kitchen` });
  assert.equal(buildPageSeo(row({ page_slug: 'home' }), 'en', deps)!.canonical_url, `${SITE_URL}/`);
});

test('immagine: relativa -> assoluta, assente -> ripiego', () => {
  assert.equal(buildPageSeo(row(), 'en', deps)!.og_image, `${SITE_URL}/img/a.jpg`);
  assert.match(buildPageSeo(row({ cover_media: null }), 'en', deps)!.og_image, /og-default\.jpg$/);
});

test('nodo LocalBusiness rigenerato dal profilo SOLO se la pagina lo aggancia', () => {
  const jsonLd = { '@context': 'https://schema.org', '@graph': [{ '@type': 'LocalBusiness', name: 'vecchio' }, { '@type': 'FAQPage' }] };
  const bp = { name: 'Thai Akha Kitchen', legal_name: 'Thai Akha Kitchen Limited Partnership', tax_id: '0503558007188' } as unknown as BusinessProfile;
  const linked = buildPageSeo(row({ json_ld: jsonLd, business_profile_id: 'bp1' }), 'en', { businessProfile: bp, alternates: {} })!;
  const graph = linked.json_ld!['@graph'] as Record<string, unknown>[];
  assert.equal(graph[0].legalName, 'Thai Akha Kitchen Limited Partnership', 'il nodo viene dal profilo');
  assert.equal(graph[0].taxID, '0503558007188');
  assert.equal(graph[1]['@type'], 'FAQPage', 'gli altri nodi restano');
  const notLinked = buildPageSeo(row({ json_ld: jsonLd }), 'en', { businessProfile: bp, alternates: {} })!;
  assert.equal((notLinked.json_ld!['@graph'] as Record<string, unknown>[])[0].name, 'vecchio', 'senza aggancio il json_ld resta com\'e\'');
  const noProfile = buildPageSeo(row({ json_ld: jsonLd, business_profile_id: 'bp1' }), 'en', deps)!;
  assert.equal((noProfile.json_ld!['@graph'] as Record<string, unknown>[])[0].name, 'vecchio', 'profilo non arrivato: si tiene il nodo salvato');
});
