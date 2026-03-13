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
  | 'guest';

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
  agency_commission_rate?: number;
  agency_tax_id?: string;
  agency_phone?: string;
  commission_config?: {
    mode: 'flat' | 'tiered';
    tiers?: { threshold: number; rate: number }[];
    reset_period?: string;
    included_statuses?: string[];
  };
  agency_address?: string;
  agency_city?: string;
  agency_province?: string;
  agency_country?: string;
  agency_postal_code?: string;

  // Optional metadata
  whatsapp?: boolean;
  gender?: 'male' | 'female' | 'other' | '';
  age?: number | '';
  nationality?: string;
  is_active?: boolean;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}
