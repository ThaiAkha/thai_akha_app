import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';

const NO_MAP: Record<string, string> = {};

export const allergyMapQueryKey = ['allergy_map'] as const;

/**
 * Mappa allergene → testo di rassicurazione (da dietary_profiles di tipo allergy).
 * Una voce di cache per RecipeView (menu), pagina ricetta e Passport.
 */
export function useAllergyMap() {
  const query = useQuery({
    queryKey: allergyMapQueryKey,
    queryFn: () => contentService.getAllergyMap(),
  });
  return { allergyMap: query.data ?? NO_MAP, loading: query.isPending };
}
