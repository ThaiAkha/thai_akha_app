import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import type { SpicinessLevel } from '@thaiakha/shared/types';
import { useLanguage } from '../context/LanguageContext';

const NO_LEVELS: SpicinessLevel[] = [];

export const spicinessLevelsQueryKey = (lang = 'en') => ['spiciness_levels', lang] as const;

/** Livelli di piccantezza (con foto) da spiciness_levels, via il service (fonte unica, #70). */
export function useSpicinessLevels() {
  const { lang } = useLanguage();
  const query = useQuery({
    queryKey: spicinessLevelsQueryKey(lang),
    queryFn: () => contentService.getSpicinessLevels(lang),
  });
  return { spicinessLevels: query.data ?? NO_LEVELS, loading: query.isPending };
}
