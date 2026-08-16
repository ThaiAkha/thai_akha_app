import { BusinessProfile } from '../types/content.types';

/**
 * Builds the canonical LocalBusiness JSON-LD node from the business_profile table.
 * Single source of truth — replaces hardcoded LocalBusiness schemas in pages.
 * Shares its @id with the Organization node (authors table) for entity consistency.
 */
export function buildLocalBusinessSchema(
  bp: BusinessProfile,
  opts?: { url?: string },
): Record<string, unknown> {
  const url = opts?.url ?? 'https://www.thaiakha.com';

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': bp.business_type || 'LocalBusiness',
    '@id': 'https://www.thaiakha.com/#/schema/organization/thai-akha-kitchen',
    name: bp.name,
    url,
  };

  if (bp.legal_name) schema.legalName = bp.legal_name;
  if (bp.tax_id) schema.taxID = bp.tax_id;
  if (bp.telephone) schema.telephone = bp.telephone;
  if (bp.email) schema.email = bp.email;
  if (bp.price_range) schema.priceRange = bp.price_range;

  if (bp.street_address || bp.address_locality || bp.address_country) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(bp.street_address ? { streetAddress: bp.street_address } : {}),
      ...(bp.address_locality ? { addressLocality: bp.address_locality } : {}),
      ...(bp.address_region ? { addressRegion: bp.address_region } : {}),
      ...(bp.postal_code ? { postalCode: bp.postal_code } : {}),
      ...(bp.address_country ? { addressCountry: bp.address_country } : {}),
    };
  }

  if (bp.latitude != null && bp.longitude != null) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: bp.latitude,
      longitude: bp.longitude,
    };
  }

  if (bp.has_map) schema.hasMap = bp.has_map;
  if (bp.opening_hours?.length) schema.openingHours = bp.opening_hours;
  if (bp.service_type?.length) schema.serviceType = bp.service_type;
  if (bp.same_as?.length) schema.sameAs = bp.same_as;
  if (bp.founding_date) schema.foundingDate = bp.founding_date;

  if (bp.aggregate_rating?.ratingValue) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: bp.aggregate_rating.ratingValue,
      reviewCount: bp.aggregate_rating.reviewCount,
    };
  }

  return schema;
}
