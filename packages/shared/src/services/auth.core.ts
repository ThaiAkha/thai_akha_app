import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/auth.types';
import type { TablesInsert, TablesUpdate } from '../types';

/** Campi profilo che il chiamante puo' aggiungere all'upsert di sicurezza del signup. */
export type SignUpProfileFields = Omit<
    TablesInsert<'profiles'>,
    'id' | 'email' | 'full_name' | 'updated_at'
>;

export const authCoreService = {
    /** 🔑 LOGIN (Comune per tutti) */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    /**
     * 📝 SIGN UP + SAFETY UPSERT (Comune)
     * Crea l'utente Auth (metadata `full_name`) e garantisce il profilo anche se il
     * trigger SQL fallisce. Ruolo e campi extra arrivano dal chiamante: e' l'unico
     * punto in cui front e admin divergono davvero (guest vs agency).
     * `warnLabel` tiene invariato il messaggio di console.warn di ciascuna app.
     */
    async signUpWithProfile(
        email: string,
        password: string,
        fullName: string,
        profileFields: SignUpProfileFields,
        warnLabel: string
    ) {
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
                    email,
                    full_name: fullName,
                    ...profileFields,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) console.warn(`${warnLabel} warning:`, profileError.message);
        }

        return authData;
    },

    /**
     * 🔄 RESET PASSWORD (Recovery Flow)
     * Invia l'email brandizzata (EN/TH) via Edge Function `send-password-reset`,
     * che genera il recovery link con generateLink (NO email di default Supabase)
     * e spedisce con Resend. `lang` opzionale (default 'en').
     */
    async resetPassword(email: string, resetUrl: string, lang: 'en' | 'th' = 'en') {
        const { data, error } = await supabase.functions.invoke('send-password-reset', {
            body: { email, lang, redirectTo: resetUrl },
        });
        if (error) throw error;
        if (data && (data as { ok?: boolean }).ok === false) {
            throw new Error((data as { error?: string }).error || 'Password reset email failed');
        }
    },

    /** 🚪 LOGOUT */
    async signOut(cacheKeyToRemove?: string) {
        if (cacheKeyToRemove) {
            localStorage.removeItem(cacheKeyToRemove);
        }
        await supabase.auth.signOut();
    },

    /** 👤 GET CURRENT SESSION PROFILE (Comune) */
    async getCurrentUserProfile(defaultRole: 'guest' | 'agency' = 'guest'): Promise<UserProfile | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select(`
          id, full_name, email, role, avatar_url, whatsapp,
          dietary_profile, allergies, preferred_spiciness_id,
          agency_company_name,
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
                role: (data.role as UserRole | null) || defaultRole,
                avatar_url: data.avatar_url,
                whatsapp: data.whatsapp,
                dietary_profile: data.dietary_profile || 'diet_regular',
                allergies: data.allergies || [],
                preferred_spiciness_id: data.preferred_spiciness_id || 2,
                agency_company_name: data.agency_company_name,
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
            } as UserProfile;
        } catch (err) {
            console.error("getCurrentUserProfile error:", err);
            return null;
        }
    },

    /** 💾 UPDATE PROFILE */
    async updateProfile(userId: string, updates: Partial<UserProfile>) {
        const { error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            } as TablesUpdate<'profiles'>)
            .eq('id', userId);

        if (error) throw error;
    },

    /** 🔒 CHANGE PASSWORD */
    async changePassword(password: string) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    },

    /** 🖼️ UPLOAD AVATAR — bucket avatars-user-upload, cartella per-utente (RLS path-ownership) */
    async uploadAvatar(userId: string, file: File) {
        const BUCKET = 'avatars-user-upload';
        const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;

        // Cleanup dei vecchi upload dell'utente (una sola foto per utente)
        const { data: old } = await supabase.storage.from(BUCKET).list(userId);
        if (old?.length) {
            await supabase.storage.from(BUCKET).remove(old.map(f => `${userId}/${f.name}`));
        }

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(filePath);

        await this.updateProfile(userId, { avatar_url: publicUrl });
        return publicUrl;
    }
};
