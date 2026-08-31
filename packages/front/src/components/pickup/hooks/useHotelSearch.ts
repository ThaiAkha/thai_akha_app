import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@thaiakha/shared/query';
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

const NO_RESULTS: HotelResult[] = [];
const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;

export const hotelSearchQueryKey = (text: string) => ['hotel_search', text] as const;

/** Valore ritardato: il testo digitato non e' un fetch, la ricerca parte quando si smette di scrivere. */
function useDebounced(value: string, ms: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/**
 * Parameterized hotel search hook — used for both pickup and drop-off fields.
 * @param enabled  false → disables the query entirely (e.g. isDropoffSame = true)
 *
 * Data layer unico (CLAUDE.md #17): era `useEffect + setTimeout + supabase`. Stesso debounce
 * di 300 ms, stessa soglia di 2 caratteri; la ricerca e' una useQuery per testo cercato, cosi'
 * ridigitare lo stesso nome non ripete la chiamata. Come prima, la lista precedente resta
 * finche' arriva la nuova, e sotto i 2 caratteri si svuota SUBITO, senza aspettare il debounce.
 */
export function useHotelSearch(enabled: boolean = true): UseHotelSearchResult {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounced = useDebounced(query, DEBOUNCE_MS);

  const active = enabled && query.length >= MIN_CHARS;
  const canFetch = active && debounced.length >= MIN_CHARS;

  const search = useQuery({
    queryKey: hotelSearchQueryKey(debounced),
    enabled: canFetch,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotel_locations')
        .select('id, name, zone_id, latitude, longitude')
        .ilike('name', `%${debounced}%`)
        .eq('is_active', true)
        .order('name')
        .limit(8);
      if (error) throw error;
      // Un hotel senza coordinate non e' piazzabile sulla mappa ne' assegnabile
      // a una zona: si scarta qui invece di propagare null nello stato.
      return (data ?? []).filter(
        (h): h is HotelResult => h.latitude !== null && h.longitude !== null,
      );
    },
    placeholderData: keepPreviousData,
  });

  const clear = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  return {
    query,
    setQuery,
    results: active ? (search.data ?? NO_RESULTS) : NO_RESULTS,
    loading: canFetch && search.isFetching,
    showSuggestions,
    setShowSuggestions,
    clear,
  };
}
