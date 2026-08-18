import { supabase } from '@thaiakha/shared/lib/supabase';
import { authCoreService } from '@thaiakha/shared/services';
import type { UserProfile } from '@thaiakha/shared/types';
import { invalidateGeminiClients } from './geminiClient';

/**
 * Auth front = core condiviso + i soli override B2C.
 * signIn / resetPassword / updateProfile / changePassword / uploadAvatar
 * arrivano tali e quali da `authCoreService`.
 */
export const authService = {
    ...authCoreService,

    /**
     * 📝 SIGN UP (GUEST/USER STANDARD)
     * Override: nel front chi si registra e' un turista (ruolo 'guest' + dieta di base
     * + anagrafica opzionale del form); nell'admin lo stesso metodo crea un'agenzia.
     */
    async signUp(
        email: string,
        password: string,
        fullName: string,
        age?: number | null,
        gender?: string | null,
        nationality?: string | null,
    ) {
        return authCoreService.signUpWithProfile(
            email,
            password,
            fullName,
            {
                role: 'guest',
                dietary_profile: 'diet_regular',
                ...(age != null && { age }),
                ...(gender && { gender }),
                ...(nationality && { nationality })
            },
            'Guest profile'
        );
    },

    /**
     * 👤 GET CURRENT USER PROFILE
     * Override: ruolo di fallback 'guest' (nell'admin e' 'agency').
     */
    async getCurrentUserProfile(): Promise<UserProfile | null> {
        return authCoreService.getCurrentUserProfile('guest');
    },

    /**
     * 🚪 LOGOUT
     * Override e NON `authCoreService.signOut(key)`: qui va svuotato tutto il
     * localStorage (cache pubbliche, booking in corso) e va invalidato il client
     * Gemini, il cui token e' legato all'utente. L'ordine conta: prima il signOut
     * Supabase, che ha ancora bisogno dei token nel localStorage.
     */
    async signOut() {
        await supabase.auth.signOut();
        invalidateGeminiClients();
        localStorage.clear();
    }
};

export type { UserProfile };
