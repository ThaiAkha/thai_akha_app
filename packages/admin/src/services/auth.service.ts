import { authCoreService } from '@thaiakha/shared/services';
import type { UserProfile } from '@thaiakha/shared/types';

/**
 * Commissione di default di una nuova agenzia (3 tier per-passeggero).
 * Vive qui perche' e' una regola B2B dell'admin: il front non registra agenzie.
 */
const DEFAULT_AGENCY_COMMISSION_CONFIG = {
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
};

/**
 * Auth admin = core condiviso + i soli override B2B.
 * signIn / resetPassword / updateProfile / changePassword / uploadAvatar
 * arrivano tali e quali da `authCoreService`.
 */
export const authService = {
    ...authCoreService,

    /**
     * 📝 SIGN UP (STANDARD)
     * Override: nell'admin chi si registra e' sempre un partner, quindi ruolo 'agency'
     * (nel front lo stesso metodo crea un 'guest').
     */
    async signUp(email: string, password: string, fullName: string) {
        return authCoreService.signUpWithProfile(
            email,
            password,
            fullName,
            { role: 'agency' },
            'Profile upsert'
        );
    },

    /**
     * 🏢 SIGN UP AGENCY (PARTNER B2B)
     * Solo admin: registrazione con dati fiscali e commissione di default.
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
        return authCoreService.signUpWithProfile(
            email,
            password,
            contactName,
            {
                role: 'agency',
                agency_company_name: companyName,
                agency_tax_id: taxId,
                agency_phone: phone,
                line_id: lineId || null,
                commission_config: DEFAULT_AGENCY_COMMISSION_CONFIG
            },
            'Agency profile'
        );
    },

    /**
     * 👤 GET CURRENT USER PROFILE
     * Override: ruolo di fallback 'agency' (nel front e' 'guest').
     */
    async getCurrentUserProfile(): Promise<UserProfile | null> {
        return authCoreService.getCurrentUserProfile('agency');
    },

    /**
     * 🚪 LOGOUT
     * Override: pulisce solo la cache profilo dell'admin, il resto del localStorage
     * (preferenze staff/agenzia) resta.
     */
    async signOut() {
        await authCoreService.signOut('akha_user_profile_cache_v1');
    }
};

export type { UserProfile };
