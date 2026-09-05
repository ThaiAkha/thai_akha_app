import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import { useLanguage } from '../context/LanguageContext';

const NO_MAP: Record<string, string> = {};

export const allergyMapQueryKey = (lang = 'en') => ['allergy_map', lang] as const;

/**
 * Mappa allergene → testo di rassicurazione (da dietary_profiles di tipo allergy).
 * Una voce di cache per RecipeView (menu), pagina ricetta e Passport.
 */
export function useAllergyMap() {
  const { lang } = useLanguage();
  const query = useQuery({
    queryKey: allergyMapQueryKey(lang),
    queryFn: () => contentService.getAllergyMap(lang),
  });
  return { allergyMap: query.data ?? NO_MAP, loading: query.isPending };
}
