/**
 * Section icon map — slug → icon name
 *
 * Long-term: these should live in the `culture_sections` table as an `icon_name`
 * column. Until that column exists, this map serves as the frontend fallback.
 * When the DB column is added, update CultureSection type and use
 * `section.icon_name ?? SECTION_ICONS[section.slug] ?? 'auto_stories'`.
 */
export const SECTION_ICONS: Record<string, string> = {
    'hill-tribes-overview': 'landscape',
    'historical-roots': 'history_edu',
    'akha-zang': 'menu_book',
    'traditional-dress': 'diamond',
    'swing-festival': 'celebration',
    'featured-recipes': 'restaurant_menu',
    'thai-akha-fusion': 'merge',
    'foragers-pantry': 'forest',
    'spirit-gate': 'temple_buddhist',
    'music-folklore': 'music_note',
    'coffee-culture': 'coffee',
    'communal-dining': 'groups',
    'religion-beliefs': 'self_improvement',
    'spice-philosophy': 'local_fire_department',
};
