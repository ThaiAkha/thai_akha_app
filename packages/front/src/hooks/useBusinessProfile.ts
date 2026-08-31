/**
 * useBusinessProfile — identità/fatturazione azienda dalla riga unica business_profile.
 * Data layer unico (CLAUDE.md #17): era una cache di modulo + useEffect; ora una useQuery
 * (il service resta cached in localStorage, stale-while-revalidate). Fonte unica: cambi in
 * DB → cambi in pagina. Contact e LegalFooterCard condividono UNA voce.
 */

import { useQuery } from '@thaiakha/shared/query';
import { contentMetadataService } from '@thaiakha/shared/services';
import type { BusinessProfile } from '@thaiakha/shared/types';

export const businessProfileQueryKey = ['business_profile'] as const;

export function useBusinessProfile(): {
  profile: BusinessProfile | null;
  loading: boolean;
} {
  const query = useQuery({
    queryKey: businessProfileQueryKey,
    queryFn: () => contentMetadataService.getBusinessProfile(),
  });
  return { profile: query.data ?? null, loading: query.isPending };
}

export default useBusinessProfile;
