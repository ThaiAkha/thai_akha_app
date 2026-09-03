import { supabase } from '@thaiakha/shared/lib/supabase';
import { authCoreService } from '@thaiakha/shared/services';
import type { UserProfile } from '@thaiakha/shared/types';
import { pickEmailLang } from '@thaiakha/shared/lib/i18n';
import i18n from '../i18n';
import { invalidateGeminiClients } from './geminiClient';

/**
 * #172: welcome email brandizzata (edge send-front-welcome, EN/TH) subito dopo la
 * registrazione. Fire-and-forget: un errore qui non ferma ne' la registrazione ne' il
 * booking in corso. La edge manda SOLO all'utente autenticato (JWT), il body non sceglie
 * il destinatario; si passa la lingua REALE del sito e la edge ricade su EN se non ha
 * il template (oggi tutte tranne TH).
 */
function sendWelcomeEmail(fullName: string): void {
    void supabase.functions
        .invoke('send-front-welcome', {
            body: {
                user_name: fullName,
                lang: i18n.language,
                cta_url: `${window.location.origin}/thai-cooking-classes-chiang-mai`,
            },
        })
        .catch((err: unknown) => console.error('Welcome email failed (non-blocking):', err));
}

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
     * #172: salva la lingua del sito come `preferred_language` (ridotta alle 4 lingue
     * email, altrimenti en): e' la lingua che le edge booking useranno quando avranno
     * i pack; poi parte la welcome email.
     */
    async signUp(
        email: string,
        password: string,
        fullName: string,
        age?: number | null,
        gender?: string | null,
        nationality?: string | null,
    ) {
        const authData = await authCoreService.signUpWithProfile(
            email,
            password,
            fullName,
            {
                role: 'guest',
                dietary_profile: 'diet_regular',
                preferred_language: pickEmailLang(i18n.language),
                ...(age != null && { age }),
                ...(gender && { gender }),
                ...(nationality && { nationality })
            },
            'Guest profile'
        );
        if (authData.user) sendWelcomeEmail(fullName);
        return authData;
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
