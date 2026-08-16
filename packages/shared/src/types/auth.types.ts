/**
 * Unified Role type - merge di tutti i ruoli possibili da entrambe le app
 */
export type UserRole =
  | 'admin'
  | 'manager'
  | 'agency'
  | 'kitchen'
  | 'logistics'
  | 'driver'
  | 'alumni'
  | 'guest'
  | 'guest_virtual';

/**
 * Unified UserProfile - compatibile con entrambe le app
 * Include tutti i campi opzionali da entrambe le versioni
 */
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  dietary_profile: string;
  allergies: string[];
  preferred_spiciness_id?: number;
  avatar_url?: string;

  // Agency fields (optional - solo per role 'agency')
  agency_company_name?: string;
  agency_tax_id?: string;
  agency_phone?: string;
  /** Modello commissioni 3-tier per-passeggero. Calcolo single-source: RPC calculate_agency_commission. */
  commission_config?: {
    mode: 'flat' | 'tiered';
    unit?: string;
    currency?: string;
    tiers?: { tier: string; min_pax: number; rate: number }[];
    cycle?: string;
    reset_to?: string;
    applies_to?: string[];
    private_pax_counts_volume?: boolean;
    private_earns_tier?: boolean;
    volume_statuses?: string[];
  };
  agency_address?: string;
  agency_city?: string;
  agency_province?: string;
  agency_country?: string;
  agency_postal_code?: string;

  // Optional metadata
  whatsapp?: boolean;
  phone_prefix?: string;
  phone_number?: string;
  phone_whatsapp?: boolean;
  gender?: 'male' | 'female' | 'other' | '';
  age?: number | '';
  nationality?: string;
  is_active?: boolean;

  // Gamification
  quiz_points?: number;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}
