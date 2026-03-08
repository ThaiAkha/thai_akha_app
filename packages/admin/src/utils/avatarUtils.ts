/**
 * Avatar selection utility
 * Maps user age and gender to appropriate avatar from Supabase Storage
 * Supports 3 genders × 4 age groups × 6 avatars = 72 total avatars
 */

import { getAvatarCount } from './avatarConfig';

type AgeGroup = 'child' | 'teen' | 'young' | 'adult';
type Gender = 'male' | 'female' | 'other';

/**
 * Determines age group based on age in years
 * - child: 0-12
 * - teen: 13-17
 * - young: 18-35
 * - adult: 35+
 */
function getAgeGroup(age: number | string): AgeGroup {
  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;

  if (ageNum < 0 || isNaN(ageNum)) return 'adult'; // default
  if (ageNum <= 12) return 'child';
  if (ageNum <= 17) return 'teen';
  if (ageNum <= 35) return 'young';
  return 'adult';
}

/**
 * Normalizes gender to match avatar naming convention
 */
function normalizeGender(gender: string | null | undefined): Gender {
  if (!gender) return 'other';
  const g = gender.toLowerCase();
  if (g === 'male') return 'male';
  if (g === 'female') return 'female';
  return 'other';
}

/**
 * Selects a random avatar number based on available avatars for the given gender and age group
 */
function getRandomAvatarNumber(gender: Gender, ageGroup: AgeGroup): number {
  const maxNumber = getAvatarCount(gender, ageGroup);
  return Math.floor(Math.random() * maxNumber) + 1;
}

/**
 * Generates Supabase Storage URL for avatar
 * Format: https://[PROJECT_ID].supabase.co/storage/v1/object/public/avatars_user/[gender]_[agegroup]_[1-6].jpg
 */
export function getAvatarUrl(age: number | string | null | undefined, gender: string | null | undefined): string {
  const ageGroup = getAgeGroup(age as number);
  const normalizedGender = normalizeGender(gender);
  const avatarNumber = getRandomAvatarNumber(normalizedGender, ageGroup);

  const filename = `${normalizedGender}_${ageGroup}_${avatarNumber}.jpg`;

  // Construct the Supabase Storage URL
  const projectUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
  const avatarUrl = `${projectUrl}/storage/v1/object/public/avatars_user/${filename}`;

  return avatarUrl;
}

/**
 * Get avatar filename without full URL (useful for display/debugging)
 */
export function getAvatarFilename(age: number | string | null | undefined, gender: string | null | undefined): string {
  const ageGroup = getAgeGroup(age as number);
  const normalizedGender = normalizeGender(gender);
  const avatarNumber = getRandomAvatarNumber(normalizedGender, ageGroup);

  return `${normalizedGender}_${ageGroup}_${avatarNumber}.jpg`;
}
