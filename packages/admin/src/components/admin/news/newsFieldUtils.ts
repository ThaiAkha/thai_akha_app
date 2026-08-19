/**
 * News Inspector - classificazione dei campi della riga akha_news (cover/titolo/contenuto/audio/
 * gallery/boolean/meta/system) e parsing gallery. Estratto da NewsInspector.tsx (#16), invariato.
 */
import { NEWS_READ_ONLY_COLUMNS } from '../../../hooks/useAdminNews';

export type FieldCategory = 'cover' | 'title' | 'content' | 'audio' | 'gallery' | 'boolean' | 'meta' | 'system';


export function categorizeField(key: string, value: unknown): FieldCategory {
    const k = key.toLowerCase();

    if (NEWS_READ_ONLY_COLUMNS.includes(key)) return 'system';

    // Single cover image
    if (['image_url', 'cover_image', 'thumbnail_url', 'hero_image_url', 'catalog_image_url', 'photo_url', 'img_url', 'avatar_url'].includes(k)
        || (k.endsWith('_image') && !k.includes('gallery') && !k.includes('images'))) return 'cover';

    // Audio
    if (k.includes('audio') || k === 'sound_url'
        || (typeof value === 'string' && /\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(value))) return 'audio';

    // Gallery — arrays or gallery-named fields
    if (k === 'gallery' || k === 'gallery_images' || k === 'images' || k === 'photos'
        || k.endsWith('_gallery') || k.endsWith('_images')
        || Array.isArray(value)) return 'gallery';

    // Boolean
    if (typeof value === 'boolean') return 'boolean';

    // Title / identifier
    if (['title', 'name', 'thai_name', 'label', 'slug', 'page_slug', 'category',
        'section_id', 'asset_id', 'file_name', 'display_order'].includes(k)) return 'title';

    // Content / long text
    if (k.includes('content') || k.includes('body') || k.includes('description')
        || k.includes('transcript') || k.includes('text') || k === 'subtitle' || k === 'caption'
        || (typeof value === 'string' && value.length > 80)) return 'content';

    return 'meta';
}


export function parseGallery(value: unknown): string[] {
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
        } catch { /* not JSON */ }
    }
    return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
//
