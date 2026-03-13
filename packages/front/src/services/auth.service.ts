import { supabase } from '@thaiakha/shared/lib/supabase';
import { authCoreService } from '@thaiakha/shared/services';
import type { UserProfile } from '@thaiakha/shared/types';

export const authService = {
    ...authCoreService, // Eredita signIn, signOut, getCurrentUserProfile, ecc.

    /**
     * 📝 SIGN UP (GUEST/USER STANDARD)
     * Registrazione classica per i turisti.
     */
    async signUp(email: string, password: string, fullName: string) {
        // 1. Crea Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName } // Metadati passati al Trigger SQL (se presente)
            }
        });

        if (authError) throw authError;

        // 2. Safety Upsert: Garantisce che il profilo esista anche se il Trigger SQL fallisce
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: email,
                    full_name: fullName,
                    role: 'guest', // Ruolo di default
                    dietary_profile: 'diet_regular',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) console.warn("Guest profile warning:", profileError.message);
        }

        return authData;
    },

    /**
     * 🏢 SIGN UP AGENCY (PARTNER B2B)
     * Registrazione specifica per Partner: forza il ruolo 'agency' e salva i dati fiscali.
     */
    async signUpAgency(
        email: string,
        password: string,
        companyName: string,
        taxId: string,
        phone: string
    ) {
        // 1. Crea Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: companyName } // Usa il nome azienda come nome utente
            }
        });

        if (authError) throw authError;

        // 2. Scrivi Profilo Agenzia Esteso
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: email,
                    full_name: companyName,     // Nome visualizzato
                    role: 'agency',             // 👈 FORZA IL RUOLO B2B

                    // Dati Specifici Agenzia
                    agency_company_name: companyName,
                    agency_tax_id: taxId,
                    agency_phone: phone,
                    agency_commission_rate: 20, // Default 20% (Modificabile solo da Admin)

                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) console.warn("Agency profile warning:", profileError.message);
        }

        return authData;
    },

    /** 
     * 👤 GET CURRENT USER PROFILE (Override per front cache)
     */
    async getCurrentUserProfile(): Promise<UserProfile | null> {
        return authCoreService.getCurrentUserProfile('guest');
    },

    /** 🚪 LOGOUT (Override per front cache) */
    async signOut() {
        // Usa un remove brute-force come nell'originale front authService
        localStorage.clear();
        await supabase.auth.signOut();
    }
};

export type { UserProfile };
