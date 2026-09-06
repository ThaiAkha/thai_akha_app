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

export function useBusinessProfile(options: { enabled?: boolean } = {}): {
  profile: BusinessProfile | null;
  loading: boolean;
} {
  const enabled = options.enabled ?? true;
  const query = useQuery({
    queryKey: businessProfileQueryKey,
    queryFn: () => contentMetadataService.getBusinessProfile(),
    enabled,
  });
  // `enabled &&`: una query spenta e senza dati resta per sempre in attesa.
  return { profile: query.data ?? null, loading: enabled && query.isPending };
}

export default useBusinessProfile;
