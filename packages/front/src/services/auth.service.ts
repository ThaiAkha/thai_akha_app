import { supabase } from '@thaiakha/shared/lib/supabase';
import { authCoreService } from '@thaiakha/shared/services';
import type { UserProfile } from '@thaiakha/shared/types';
import { invalidateGeminiClients } from './geminiClient';

export const authService = {
    ...authCoreService, // Eredita signIn, signOut, getCurrentUserProfile, ecc.

    /**
     * 📝 SIGN UP (GUEST/USER STANDARD)
     * Registrazione classica per i turisti.
     */
    async signUp(
        email: string,
        password: string,
        fullName: string,
        age?: number | null,
        gender?: string | null,
        nationality?: string | null,
    ) {
        // 1. Crea Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });

        if (authError) throw authError;

        // 2. Safety Upsert: Garantisce che il profilo esista anche se il Trigger SQL fallisce
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email,
                    full_name: fullName,
                    role: 'guest',
                    dietary_profile: 'diet_regular',
                    ...(age != null && { age }),
                    ...(gender && { gender }),
                    ...(nationality && { nationality }),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) console.warn("Guest profile warning:", profileError.message);
        }

        return authData;
    },

    /** 👤 GET CURRENT USER PROFILE (Override per front cache) */
    async getCurrentUserProfile(): Promise<UserProfile | null> {
        return authCoreService.getCurrentUserProfile('guest');
    },

    /** 🚪 LOGOUT (Override per front cache) */
    async signOut() {
        // 1. Prima facciamo il logout ufficiale da Supabase (serve che i token siano ancora nel localStorage)
        await supabase.auth.signOut();
        // 2. Invalida il client Gemini cached (token vocale legato all'utente)
        invalidateGeminiClients();
        // 3. Poi puliamo tutto il resto in modo brute-force
        localStorage.clear();
    }
};

export type { UserProfile };
