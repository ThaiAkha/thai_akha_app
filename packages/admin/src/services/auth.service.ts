import { supabase } from '@thaiakha/shared/lib/supabase';
import { authCoreService } from '@thaiakha/shared/services';
import type { UserProfile } from '@thaiakha/shared/types';

export const authService = {
    ...authCoreService, // Eredita signIn, signOut, getCurrentUserProfile, ecc.

    /**
     * 📝 SIGN UP (STANDARD)
     * Registrazione standard — assegna ruolo 'agency' di default.
     */
    async signUp(email: string, password: string, fullName: string) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });

        if (authError) throw authError;

        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: email,
                    full_name: fullName,
                    role: 'agency',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) console.warn("Profile upsert warning:", profileError.message);
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
        contactName: string,
        companyName: string,
        taxId: string,
        phone: string,
        lineId: string = ''
    ) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: contactName }
            }
        });

        if (authError) throw authError;

        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: email,
                    full_name: contactName,
                    role: 'agency',
                    agency_company_name: companyName,
                    agency_tax_id: taxId,
                    agency_phone: phone,
                    line_id: lineId || null,
                    commission_config: {
                        mode: 'tiered',
                        unit: 'per_passenger',
                        currency: 'THB',
                        tiers: [
                            { tier: 'silver', min_pax: 0, rate: 350 },
                            { tier: 'gold', min_pax: 50, rate: 400 },
                            { tier: 'platinum', min_pax: 150, rate: 450 }
                        ],
                        cycle: 'rolling_3m_from_registration',
                        reset_to: 'silver',
                        applies_to: ['morning_class', 'evening_class'],
                        private_pax_counts_volume: true,
                        private_earns_tier: false,
                        volume_statuses: ['confirmed', 'completed']
                    },
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) console.warn("Agency profile warning:", profileError.message);
        }

        return authData;
    },

    /** 
     * 👤 GET CURRENT USER PROFILE (Override per admin cache)
     */
    async getCurrentUserProfile(): Promise<UserProfile | null> {
        return authCoreService.getCurrentUserProfile('agency');
    },

    /** 🚪 LOGOUT (Override per admin cache) */
    async signOut() {
        await authCoreService.signOut('akha_user_profile_cache_v1');
    }
};

export type { UserProfile };
