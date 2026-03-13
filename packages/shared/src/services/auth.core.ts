import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/auth.types';

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

    /** 🔄 RESET PASSWORD (Recovery Flow) */
    async resetPassword(email: string, resetUrl: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: resetUrl,
        });
        if (error) throw error;
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
                role: (data.role as any) || defaultRole,
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

        await this.updateProfile(userId, { avatar_url: publicUrl });
        return publicUrl;
    }
};
