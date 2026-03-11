import { supabase } from '@thaiakha/shared/lib/supabase';

/**
 * 👤 USER PROFILE INTERFACE
 * Include sia i dati del Turista (Guest) che quelli dell'Agenzia (B2B).
 */
export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    role: 'admin' | 'manager' | 'agency' | 'kitchen' | 'logistics' | 'driver';

    // Dati Turista / Preferenze
    dietary_profile: string;
    allergies: string[];
    preferred_spiciness_id?: number;
    avatar_url?: string; // Per le Agenzie, questo funge da Logo Aziendale
    whatsapp?: boolean;
    gender?: 'male' | 'female' | 'other' | '';
    age?: number | '';
    nationality?: string;

    // 👇 DATI SPECIFICI AGENZIA (B2B)
    agency_company_name?: string;
    agency_commission_rate?: number;
    agency_tax_id?: string;
    agency_phone?: string;
    commission_config?: {
        mode: 'flat' | 'tiered';
        tiers?: { threshold: number; rate: number }[];
        reset_period?: string;
        included_statuses?: string[];
    };

    // 👇 INDIRIZZO & LOGISTICA AGENZIA
    agency_address?: string;
    agency_city?: string;
    agency_province?: string;
    agency_country?: string;
    agency_postal_code?: string;

    // 👇 REFINEMENT: ACCOUNT STATUS
    is_active?: boolean;
}

export const authService = {

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
        phone: string
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
                    agency_commission_rate: 20,
                    commission_config: {
                        mode: 'tiered',
                        tiers: [
                            { threshold: 1, rate: 20 },
                            { threshold: 10, rate: 25 }
                        ]
                    },
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) console.warn("Agency profile warning:", profileError.message);
        }

        return authData;
    },

    /**
     * 👤 GET CURRENT USER PROFILE
     * Usa getSession() (localStorage, niente HTTP) per ottenere l'utente,
     * poi fetch dal DB solo per il profilo.
     */
    async getCurrentUserProfile(): Promise<UserProfile | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id, full_name, email, role, avatar_url, whatsapp,
                    dietary_profile, allergies, preferred_spiciness_id,
                    agency_company_name, agency_commission_rate,
                    agency_tax_id, agency_phone, commission_config,
                    agency_address, agency_city, agency_province, agency_country, agency_postal_code,
                    gender, age, nationality, is_active
                `)
                .eq('id', session.user.id)
                .maybeSingle();

            if (error || !data) return null;

            return {
                id: data.id,
                full_name: data.full_name,
                email: data.email,
                role: (data.role as UserProfile['role']) || 'agency',
                avatar_url: data.avatar_url,
                whatsapp: data.whatsapp,
                dietary_profile: data.dietary_profile || 'diet_regular',
                allergies: data.allergies || [],
                preferred_spiciness_id: data.preferred_spiciness_id || 2,
                agency_company_name: data.agency_company_name,
                agency_commission_rate: data.agency_commission_rate,
                agency_tax_id: data.agency_tax_id,
                agency_phone: data.agency_phone,
                commission_config: data.commission_config,
                agency_address: data.agency_address,
                agency_city: data.agency_city,
                agency_province: data.agency_province,
                agency_country: data.agency_country,
                agency_postal_code: data.agency_postal_code,
                gender: data.gender,
                age: data.age,
                nationality: data.nationality,
                is_active: data.is_active
            };
        } catch (err) {
            console.error("getCurrentUserProfile error:", err);
            return null;
        }
    },

    /** 🔑 LOGIN */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    /** 🔄 RESET PASSWORD */
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/auth/reset',
        });
        if (error) throw error;
    },

    /** 🚪 LOGOUT */
    async signOut() {
        localStorage.removeItem('akha_user_profile_cache_v1');
        await supabase.auth.signOut();
    },

    /** 💾 UPDATE PROFILE */
    async updateProfile(userId: string, updates: Partial<UserProfile>) {
        const { error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
    },

    /** 🔒 CHANGE PASSWORD */
    async changePassword(password: string) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    },

    /** 🖼️ UPLOAD AVATAR */
    async uploadAvatar(userId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        await authService.updateProfile(userId, { avatar_url: publicUrl });
        return publicUrl;
    }
};
