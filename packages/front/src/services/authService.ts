import { supabase } from '../lib/supabase';

/**
 * 👤 USER PROFILE INTERFACE
 * Include sia i dati del Turista (Guest) che quelli dell'Agenzia (B2B).
 */
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  // Added 'driver' to the allowed roles union to fix cross-component comparison errors kha
  role: 'admin' | 'manager' | 'agency' | 'kitchen' | 'logistics' | 'alumni' | 'guest' | 'driver';
  
  // Dati Turista / Preferenze
  dietary_profile: string;
  allergies: string[];
  preferred_spiciness_id?: number;
  avatar_url?: string; // Per le Agenzie, questo funge da Logo Aziendale

  // 👇 DATI SPECIFICI AGENZIA (B2B)
  agency_company_name?: string;
  agency_commission_rate?: number;
  agency_tax_id?: string;
  agency_phone?: string;
  
  // 👇 INDIRIZZO & LOGISTICA AGENZIA
  agency_address?: string;
  agency_city?: string;
  agency_province?: string;
  agency_country?: string;
  agency_postal_code?: string;
}

export const authService = {

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
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset', // URL di ritorno
    });
    if (error) throw error;
  },

  /** 🚪 LOGOUT */
  async signOut() {
    await supabase.auth.signOut();
    localStorage.clear();
  },

  /** 
   * 👤 GET CURRENT SESSION PROFILE 
   * Scarica tutti i dati, inclusi quelli fiscali/agenzia se presenti.
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 👇 SELECT COMPLETA: Include colonne Agenzia [Source 72, 1147]
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, email, role, avatar_url,
          dietary_profile, allergies, preferred_spiciness_id,
          agency_company_name, agency_commission_rate,
          agency_tax_id, agency_phone,
          agency_address, agency_city, agency_province, agency_country, agency_postal_code
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        role: (data.role as any) || 'guest',
        avatar_url: data.avatar_url,
        
        // Defaults per Guest
        dietary_profile: data.dietary_profile || 'diet_regular',
        allergies: data.allergies || [],
        preferred_spiciness_id: data.preferred_spiciness_id || 2,

        // Mappatura Dati Agenzia
        agency_company_name: data.agency_company_name,
        agency_commission_rate: data.agency_commission_rate,
        agency_tax_id: data.agency_tax_id,
        agency_phone: data.agency_phone,
        agency_address: data.agency_address,
        agency_city: data.agency_city,
        agency_province: data.agency_province,
        agency_country: data.agency_country,
        agency_postal_code: data.agency_postal_code

      } as UserProfile;

    } catch (err) {
      console.error("Auth profile fetch error kha:", err);
      return null;
    }
  },

  /** 
   * 💾 UPDATE PROFILE 
   * Aggiornamento generico dei dati profilo
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  }
};