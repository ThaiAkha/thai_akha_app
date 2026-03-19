/**
 * Precompiled list of countries with ISO codes and dial codes
 * Used for Nationality field suggestions and Phone Country selection
 */

export interface CountryData {
  code: string; // ISO 3166-1 alpha-2 (e.g., 'IT', 'TH', 'US')
  name: string; // Full country name
  dialCode: string; // International dial code (e.g., '+39', '+66', '+1')
  flag?: string; // Flag emoji or SVG identifier
}

export const COUNTRIES: CountryData[] = [
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
  { code: 'AR', name: 'Argentina', dialCode: '+54' },
  { code: 'AT', name: 'Austria', dialCode: '+43' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880' },
  { code: 'BE', name: 'Belgium', dialCode: '+32' },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359' },
  { code: 'BN', name: 'Brunei', dialCode: '+673' },
  { code: 'BR', name: 'Brazil', dialCode: '+55' },
  { code: 'BT', name: 'Bhutan', dialCode: '+975' },
  { code: 'BY', name: 'Belarus', dialCode: '+375' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41' },
  { code: 'CL', name: 'Chile', dialCode: '+56' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'CO', name: 'Colombia', dialCode: '+57' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'DK', name: 'Denmark', dialCode: '+45' },
  { code: 'EG', name: 'Egypt', dialCode: '+20' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
  { code: 'FI', name: 'Finland', dialCode: '+358' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'GR', name: 'Greece', dialCode: '+30' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852' },
  { code: 'HR', name: 'Croatia', dialCode: '+385' },
  { code: 'HU', name: 'Hungary', dialCode: '+36' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62' },
  { code: 'IE', name: 'Ireland', dialCode: '+353' },
  { code: 'IL', name: 'Israel', dialCode: '+972' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'IQ', name: 'Iraq', dialCode: '+964' },
  { code: 'IR', name: 'Iran', dialCode: '+98' },
  { code: 'IS', name: 'Iceland', dialCode: '+354' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'JO', name: 'Jordan', dialCode: '+962' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'KH', name: 'Cambodia', dialCode: '+855' },
  { code: 'KR', name: 'South Korea', dialCode: '+82' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965' },
  { code: 'KZ', name: 'Kazakhstan', dialCode: '+7' },
  { code: 'LA', name: 'Laos', dialCode: '+856' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352' },
  { code: 'MA', name: 'Morocco', dialCode: '+212' },
  { code: 'MM', name: 'Myanmar', dialCode: '+95' },
  { code: 'MN', name: 'Mongolia', dialCode: '+976' },
  { code: 'MO', name: 'Macao', dialCode: '+853' },
  { code: 'MT', name: 'Malta', dialCode: '+356' },
  { code: 'MV', name: 'Maldives', dialCode: '+960' },
  { code: 'MX', name: 'Mexico', dialCode: '+52' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31' },
  { code: 'NO', name: 'Norway', dialCode: '+47' },
  { code: 'NP', name: 'Nepal', dialCode: '+977' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64' },
  { code: 'OM', name: 'Oman', dialCode: '+968' },
  { code: 'PE', name: 'Peru', dialCode: '+51' },
  { code: 'PH', name: 'Philippines', dialCode: '+63' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92' },
  { code: 'PL', name: 'Poland', dialCode: '+48' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'QA', name: 'Qatar', dialCode: '+974' },
  { code: 'RO', name: 'Romania', dialCode: '+40' },
  { code: 'RS', name: 'Serbia', dialCode: '+381' },
  { code: 'RU', name: 'Russia', dialCode: '+7' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'SK', name: 'Slovakia', dialCode: '+421' },
  { code: 'TH', name: 'Thailand', dialCode: '+66' },
  { code: 'TR', name: 'Turkey', dialCode: '+90' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380' },
  { code: 'UG', name: 'Uganda', dialCode: '+256' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598' },
  { code: 'UZ', name: 'Uzbekistan', dialCode: '+998' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
];

/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji.
 * e.g. 'TH' → '🇹🇭', 'US' → '🇺🇸'
 */
export function getCountryFlag(code: string): string {
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('');
}

/**
 * Curated list of phone prefixes for booking forms.
 * Ordered by relevance (Thailand first, then major tourism markets).
 * Format is compatible with <select> options.
 */
const BOOKING_PHONE_COUNTRY_CODES = [
  'TH', 'US', 'GB', 'AU', 'SG', 'DE', 'FR', 'IT', 'NL', 'ES',
  'CH', 'SE', 'NO', 'DK', 'FI', 'JP', 'KR', 'CN', 'HK', 'TW',
  'IN', 'AE', 'RU', 'CA', 'NZ', 'AT', 'BE', 'PT', 'PL', 'VN',
  'MY', 'ID', 'PH', 'MM', 'KH', 'LA',
];

export interface PhonePrefix {
  dialCode: string; // e.g. '+66'
  label: string;    // e.g. '🇹🇭 TH (+66)'
  countryCode: string; // e.g. 'TH'
  name: string;     // e.g. 'Thailand'
}

export const BOOKING_PHONE_PREFIXES: PhonePrefix[] = BOOKING_PHONE_COUNTRY_CODES
  .map(code => COUNTRIES.find(c => c.code === code))
  .filter((c): c is CountryData => Boolean(c))
  .map(c => ({
    dialCode: c.dialCode,
    label: `${getCountryFlag(c.code)} ${c.name} (${c.dialCode})`,
    countryCode: c.code,
    name: c.name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Get country by code
 */
export function getCountryByCode(code: string): CountryData | undefined {
  return COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase());
}

/**
 * Search countries by name or code
 */
export function searchCountries(query: string): CountryData[] {
  if (!query || query.length < 1) return [];

  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(
    country =>
      country.name.toLowerCase().includes(lowerQuery) ||
      country.code.toLowerCase().includes(lowerQuery)
  );
}
