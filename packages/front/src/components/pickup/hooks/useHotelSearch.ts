import { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';

export interface HotelResult {
  id: string;
  name: string;
  zone_id: string | null;
  latitude: number;
  longitude: number;
}

export interface UseHotelSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: HotelResult[];
  loading: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  clear: () => void;
}

/**
 * Parameterized hotel search hook — used for both pickup and drop-off fields.
 * @param enabled  false → disables the query entirely (e.g. isDropoffSame = true)
 */
export function useHotelSearch(enabled: boolean = true): UseHotelSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!enabled || !query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('hotel_locations')
          .select('id, name, zone_id, latitude, longitude')
          .ilike('name', `%${query}%`)
          .eq('is_active', true)
          .order('name')
          .limit(8);
        setResults(data ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, enabled]);

  const clear = () => {
    setQuery('');
    setResults([]);
    setShowSuggestions(false);
  };

  return { query, setQuery, results, loading, showSuggestions, setShowSuggestions, clear };
}
