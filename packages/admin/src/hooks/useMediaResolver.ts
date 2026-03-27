import { useEffect, useState, useRef } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';

// Simple in-memory cache to avoid duplicate queries
const mediaCache = new Map<string, string | null>();

/**
 * Resolves media IDs to their actual image_url from media_assets table
 * Supports single ID (string) or multiple IDs (array)
 */
export const useMediaResolver = (value: any) => {
    const [urls, setUrls] = useState<string | string[] | null>(null);
    const [loading, setLoading] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (!value) {
            setUrls(null);
            return;
        }

        setLoading(true);

        const resolveMedia = async () => {
            try {
                // Handle single ID (string)
                if (typeof value === 'string') {
                    // Check cache first
                    if (mediaCache.has(value)) {
                        const cached = mediaCache.get(value) ?? null;
                        if (isMounted.current) {
                            setUrls(cached);
                            setLoading(false);
                        }
                        return;
                    }

                    // Query media_assets by asset_id
                    const result = await supabase
                        .from('media_assets')
                        .select('asset_id, image_url')
                        .eq('asset_id', value)
                        .limit(1);

                    if (result.error) throw result.error;

                    const url = result.data?.[0]?.image_url || null;
                    mediaCache.set(value, url);

                    if (isMounted.current) {
                        setUrls(url);
                    }
                }
                // Handle array of IDs
                else if (Array.isArray(value)) {
                    const resolvedUrls: (string | null)[] = [];
                    const idsToFetch: string[] = [];
                    const idToIndexMap: Record<string, number> = {};

                    // Check cache and identify what needs to be fetched
                    value.forEach((id, idx) => {
                        if (typeof id === 'string') {
                            if (mediaCache.has(id)) {
                                resolvedUrls[idx] = mediaCache.get(id) || null;
                            } else {
                                idToIndexMap[id] = idx;
                                idsToFetch.push(id);
                            }
                        }
                    });

                    // Fetch missing IDs — use asset_id as the key
                    if (idsToFetch.length > 0) {
                        const result = await supabase
                            .from('media_assets')
                            .select('asset_id, image_url')
                            .in('asset_id', idsToFetch);

                        if (result.error) throw result.error;

                        (result.data || []).forEach(record => {
                            const url = record.image_url || null;
                            const key = record.asset_id; // Use asset_id as key
                            mediaCache.set(key, url);
                            const idx = idToIndexMap[key];
                            if (idx !== undefined) {
                                resolvedUrls[idx] = url;
                            }
                        });
                    }

                    if (isMounted.current) {
                        setUrls(resolvedUrls.filter(u => u !== null));
                    }
                }
            } catch (err) {
                console.error('[MediaResolver] Error:', err);
                if (isMounted.current) {
                    setUrls(null);
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        resolveMedia();
    }, [value]);

    return { urls, loading };
};
