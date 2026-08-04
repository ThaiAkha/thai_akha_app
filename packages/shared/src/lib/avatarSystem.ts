import { getPresetAvatars } from '../services/avatar.service';

/**
 * 🎨 SMART AVATAR 6.0 SYSTEM
 * Fonte unica: media_assets (asset_id = avatar-{gender}-{bracket}-{variant}).
 * Nessun URL o bucket hardcoded nel codice.
 *
 * ── Fasce d'età (3 scaglioni) ─────────────────────────────────────────────────
 *   teen   → 7–18 anni
 *   adult  → 19–40 anni
 *   senior → 41+ anni
 *
 * ── Generi (3 categorie) ──────────────────────────────────────────────────────
 *   male | female | other
 *
 * ── Varianti per fascia ───────────────────────────────────────────────────────
 *   4 varianti per combinazione (1–4)
 *   Totale immagini: 3 × 3 × 4 = 36
 */

export type AgeBracket = 'teen' | 'adult' | 'senior';
export type AvatarGender = 'male' | 'female' | 'other';

/** URL di fallback neutro usato quando il pool non è ancora caricato o è vuoto. */
const AVATAR_FALLBACK = 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/avatars-preset/other_adult_1.webp';

/**
 * Determina la fascia d'età basata sugli anni.
 *   Teen   → 7–18
 *   Adult  → 19–40
 *   Senior → 41+
 */
export const getAgeBracket = (age: number): AgeBracket => {
  if (age <= 18) return 'teen';
  if (age <= 40) return 'adult';
  return 'senior';
};

/**
 * Restituisce un URL pubblico per un avatar Akha Spirit randomico.
 * Legge il pool da media_assets (via getPresetAvatars), filtra per gender + bracket,
 * e sceglie una variante casuale tra i match.
 *
 * @returns URL stringa; cade su AVATAR_FALLBACK se il pool è vuoto.
 */
export const getSmartAvatarUrl = async (gender: AvatarGender, age: number): Promise<string> => {
  const bracket = getAgeBracket(age);
  const pool = await getPresetAvatars();

  const matches = pool.filter(a => a.gender === gender && a.bracket === bracket);
  if (matches.length === 0) return AVATAR_FALLBACK;

  const pick = matches[Math.floor(Math.random() * matches.length)];
  return pick.url;
};

/**
 * Versione "safe" che accetta parametri nullable (usa defaults intelligenti).
 * Usata in form e hook dove età/genere possono essere null.
 *
 * @returns Promise<string> — sempre una stringa (mai null).
 */
export const getSmartAvatarUrlSafe = async (
  gender: string | null | undefined,
  age: number | string | null | undefined,
): Promise<string> => {
  // Normalizza genere — solo i 3 valori validi, altrimenti 'other'
  const validGenders: AvatarGender[] = ['male', 'female', 'other'];
  const normalizedGender = gender?.toLowerCase() as AvatarGender;
  const safeGender: AvatarGender = validGenders.includes(normalizedGender)
    ? normalizedGender
    : 'other';

  // Normalizza età — default 25 (fascia adult)
  const safeAge = typeof age === 'string'
    ? (Number(age) || 25)
    : (age ?? 25);

  return getSmartAvatarUrl(safeGender, safeAge);
};

/**
 * Verifica se un URL è un preset Smart Avatar (bucket avatars-preset).
 * Serve a non sovrascrivere gli avatar caricati manualmente dall'utente
 * (che vivono nel bucket separato avatars-user-upload).
 */
export const isSmartAvatar = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('avatars-preset');
};

/**
 * Helper per ottenere tutte le combinazioni valide — utile per validare
 * che tutti i file siano presenti nel bucket o per pre-caching.
 * @deprecated Le combinazioni ora vivono in media_assets; usa getPresetAvatars() se hai bisogno dei dati.
 */
export const getAllAvatarFileNames = (): string[] => {
  const genders: AvatarGender[] = ['male', 'female', 'other'];
  const brackets: AgeBracket[] = ['teen', 'adult', 'senior'];
  const variants = [1, 2, 3, 4];
  const files: string[] = [];

  for (const gender of genders) {
    for (const bracket of brackets) {
      for (const variant of variants) {
        files.push(`${gender}_${bracket}_${variant}.webp`);
      }
    }
  }

  return files; // 36 files totali
};
