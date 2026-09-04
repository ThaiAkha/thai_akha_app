import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import { useLanguage } from '../context/LanguageContext';

export interface DietarySubstitution {
  original: string;
  substitute: string;
  alt_substitute?: string | null;
}

export interface DietaryProfile {
  id: string;
  name: string;
  icon: string;
  description: string;
  description_long?: string | null;
  experience?: string;
  substitutions: DietarySubstitution[];
  type?: string;
  image_url?: string;
  display_order?: number;
  [key: string]: unknown;
}

const NO_PROFILES: DietaryProfile[] = [];

export const dietaryProfilesQueryKey = (lang = 'en') => ['dietary_profiles', lang] as const;

/** Profili dietetici dal service, mappati sul tipo UI e ordinati per display_order. */
async function fetchDietaryProfiles(lang: string): Promise<DietaryProfile[]> {
  const p = await contentService.getDietaryProfiles(lang);
  const mapped: DietaryProfile[] = p.map(profile => ({
    id: profile.id as string,
    name: profile.name as string,
    icon: (profile.icon as string | null | undefined) || 'restaurant',
    description: (profile.description as string | null | undefined) || '',
    description_long: (profile.description_long as string | null | undefined) ?? null,
    experience: profile.experience as string | undefined,
    type: profile.type as string | undefined,
    image_url: profile.image_url as string | undefined,
    display_order: profile.display_order as number | undefined,
    substitutions: (profile.substitutions as DietarySubstitution[] | null | undefined) || [],
  }));
  mapped.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  return mapped;
}

/**
 * Diete e allergie (dietary_profiles) per Recipes, UserMenu e Passport.
 * Data layer unico (CLAUDE.md #17): era `useEffect + useState`; ora una voce di cache
 * condivisa fra le pagine, e `profiles` e' un riferimento stabile fra i render.
 */
export function useDietaryKnowledge() {
  const { lang } = useLanguage();
  const query = useQuery({ queryKey: dietaryProfilesQueryKey(lang), queryFn: () => fetchDietaryProfiles(lang) });
  const profiles = query.data ?? NO_PROFILES;

  const getProfileData = (slug: string) => profiles.find(p => p.id === slug);
  const getDietProfiles = () => profiles.filter(p => p.type !== 'allergy');
  const getAllergyProfiles = () => profiles.filter(p => p.type === 'allergy');

  return {
    profiles,
    loading: query.isPending,
    getProfileData,
    getDietProfiles,
    getAllergyProfiles,
  };
}
