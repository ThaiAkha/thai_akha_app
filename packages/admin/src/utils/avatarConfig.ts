/**
 * Avatar configuration
 * Specifies available avatar counts for each gender-agegroup combination
 *
 * Total: 3 genders × 4 age groups × 6 avatars = 72 avatars
 */

export const AVATAR_CONFIG = {
  // Male avatars
  male_child: 6,
  male_teen: 6,
  male_young: 6,
  male_adult: 6,

  // Female avatars
  female_child: 6,
  female_teen: 6,
  female_young: 6,
  female_adult: 6,

  // Other/undefined gender avatars
  other_child: 6,
  other_teen: 6,
  other_young: 6,
  other_adult: 6,
} as const;

export type AvatarKey = keyof typeof AVATAR_CONFIG;

/**
 * Get total number of avatars available for a specific gender-agegroup combination
 */
export function getAvatarCount(gender: string, ageGroup: string): number {
  const key = `${gender}_${ageGroup}` as AvatarKey;
  return AVATAR_CONFIG[key] || 6; // default to 6
}
