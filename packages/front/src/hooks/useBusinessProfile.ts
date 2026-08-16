/**
 * useBusinessProfile — identità/fatturazione azienda dalla riga unica business_profile.
 * Wrappa contentMetadataService.getBusinessProfile() (già cached in localStorage,
 * stale-while-revalidate) con stato React. Fonte unica: cambi in DB → cambi in pagina.
 */

import { useEffect, useState } from 'react';
import { contentMetadataService } from '@thaiakha/shared/services';
import type { BusinessProfile } from '@thaiakha/shared/types';

let _cache: BusinessProfile | null = null;

export function useBusinessProfile(): {
  profile: BusinessProfile | null;
  loading: boolean;
} {
  const [profile, setProfile] = useState<BusinessProfile | null>(_cache);
  const [loading, setLoading] = useState(_cache === null);

  useEffect(() => {
    if (_cache) return;
    let cancelled = false;
    contentMetadataService.getBusinessProfile().then(bp => {
      if (cancelled) return;
      _cache = bp;
      setProfile(bp);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { profile, loading };
}

export default useBusinessProfile;
