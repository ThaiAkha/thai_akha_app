/**
 * usePageSection
 *
 * Fetch di UNA riga page_sections per section_id, via newsService.getPageSections
 * (stessa SELECT esplicita e stessa cache localStorage del batch home).
 * Module-level cache: zero re-fetch su re-mount della stessa sezione.
 *
 * Usage:
 *   const { section, loading } = usePageSection('universal_cherry');
 */

import { useEffect, useState } from 'react';
import { newsService } from '@thaiakha/shared/services';
import type { PageSectionData } from './useHomePageSections';

const _cache = new Map<string, PageSectionData | null>();
const _promises = new Map<string, Promise<PageSectionData | null>>();

async function fetchSection(sectionId: string): Promise<PageSectionData | null> {
  if (_cache.has(sectionId)) return _cache.get(sectionId) ?? null;
  const pending = _promises.get(sectionId);
  if (pending) return pending;

  const promise = (async () => {
    const rows = await newsService.getPageSections<PageSectionData>([sectionId]);
    const row = rows.find(r => r.section_id === sectionId) ?? null;
    _cache.set(sectionId, row);
    return row;
  })();

  _promises.set(sectionId, promise);
  promise.finally(() => { _promises.delete(sectionId); });
  return promise;
}

export function usePageSection(sectionId: string): {
  section: PageSectionData | null;
  loading: boolean;
} {
  const [section, setSection] = useState<PageSectionData | null>(() => _cache.get(sectionId) ?? null);
  const [loading, setLoading] = useState(!_cache.has(sectionId));

  useEffect(() => {
    if (_cache.has(sectionId)) {
      setSection(_cache.get(sectionId) ?? null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchSection(sectionId).then(row => {
      if (!cancelled) { setSection(row); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [sectionId]);

  return { section, loading };
}

export default usePageSection;
