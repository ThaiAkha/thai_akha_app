import { supabase } from './supabase';

/**
 * 🎨 SMART AVATAR 4.8 SYSTEM
 * Gestisce l'assegnazione automatica di avatar basati su profilo utente.
 */

export type AgeBracket = 'child' | 'teen' | 'young' | 'adult' | 'senior';

/**
 * Determina la fascia d'età basata sugli anni.
 * Child (0-12), Teen (13-18), Young (19-28), Adult (29-40), Senior (41+)
 */
export const getAgeBracket = (age: number): AgeBracket => {
    if (age <= 12) return 'child';
    if (age <= 18) return 'teen';
    if (age <= 28) return 'young';
    if (age <= 40) return 'adult';
    return 'senior';
};

/**
 * Restituisce un URL pubblico per un avatar Akha Spirit randomico.
 * Convenzione naming: [gender]_[bracket]_[variant].png (es. male_child_1.png)
 */
export const getSmartAvatarUrl = (gender: 'male' | 'female' | 'other', age: number): string => {
    const bracket = getAgeBracket(age);
    const variant = Math.floor(Math.random() * 4) + 1; // Varianti 1-4

    // Fallback per 'other' - usa 'female' o 'male' randomicamente o un default
    const safeGender = gender === 'other' ? (Math.random() > 0.5 ? 'female' : 'male') : gender;

    const fileName = `${safeGender}_${bracket}_${variant}.png`;

    const { data: { publicUrl } } = supabase.storage
        .from('avatars_user')
        .getPublicUrl(fileName);

    return publicUrl;
};

/**
 * Verifica se un URL appartiene al sistema Smart Avatar (per evitare di sovrascrivere avatar caricati manualmente)
 */
export const isSmartAvatar = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('avatars_user') && (url.includes('male_') || url.includes('female_'));
};
