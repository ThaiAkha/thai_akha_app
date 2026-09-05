import { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';

export interface UserPassportData {
  dietary_profile: string;
  allergies: string[];
  preferred_spiciness_id: number;
}

/**
 * Target minimale del passport: l'host O un suo profilo gestito (F2 account-switch).
 * Sia UserProfile sia ManagedProfile lo soddisfano strutturalmente → il passport
 * legge/scrive sempre sul profilo ATTIVO, non sull'host fisso.
 */
export interface PassportTarget {
  id: string;
  dietary_profile?: string | null;
  allergies?: string[] | null;
  preferred_spiciness_id?: number | null;
}

export const LOCAL_PASSPORT_KEY = 'thai_akha_guest_passport';

/**
 * Passaporto ospite gia' salvato, letto in modo SINCRONO al primo render.
 * Prima arrivava da un effetto, cioe' un frame dopo: finche' il caricamento era
 * una schermata piena nessuno se ne accorgeva, ma con il corpo che si disegna
 * subito quel frame mostrerebbe "scegli la tua dieta" a chi l'ha gia' scelta.
 */
const readGuestPassport = (): UserPassportData | null => {
  try {
    const raw = localStorage.getItem(LOCAL_PASSPORT_KEY);
    return raw ? (JSON.parse(raw) as UserPassportData) : null;
  } catch {
    return null;
  }
};

export function useUserPassport(userProfile: PassportTarget | null, onProfileUpdate?: () => void) {
  const [passport, setPassport] = useState<UserPassportData>(() => readGuestPassport() ?? {
    dietary_profile: '',
    allergies: [],
    preferred_spiciness_id: 2,
  });
  // true only when: logged-in user (passport from DB) OR guest who has explicitly saved a passport
  const [hasExplicitPassport, setHasExplicitPassport] = useState(() => readGuestPassport() !== null);

  // 1. Initial Load: DB if logged in, else LocalStorage
  useEffect(() => {
    if (userProfile && userProfile.id !== 'guest') {
      const dbPassport: UserPassportData = {
        dietary_profile: userProfile.dietary_profile || 'diet_regular',
        allergies: userProfile.allergies || [],
        preferred_spiciness_id: userProfile.preferred_spiciness_id || 2,
      };

      // Controlla se c'è un passport guest locale da migrare
      const localRaw = localStorage.getItem(LOCAL_PASSPORT_KEY);
      if (localRaw) {
        try {
          const localPassport: UserPassportData = JSON.parse(localRaw);
          // Migriamo i dati locali sul DB in modo silente
          syncToSupabase(localPassport, userProfile.id);
          localStorage.removeItem(LOCAL_PASSPORT_KEY); // Puliamo dopo migrazione
          setPassport(localPassport);
          setHasExplicitPassport(true);
          onProfileUpdate?.(); // Refreshiamo il profilo globale
          return;
        } catch (e) {
          console.error('Error parsing local passport:', e);
        }
      }

      setPassport(dbPassport);
      setHasExplicitPassport(true);
    } else {
      // Guest mode
      const localRaw = localStorage.getItem(LOCAL_PASSPORT_KEY);
      if (localRaw) {
        try {
          setPassport(JSON.parse(localRaw));
          setHasExplicitPassport(true);
        } catch (e) {
          console.error('Error parsing local passport:', e);
        }
      }
      // else: brand-new guest → hasExplicitPassport stays false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- onProfileUpdate e' una callback del parent non memoizzata: si reagisce solo al profilo
  }, [userProfile]);

  // 2. Sincronizzazione verso Supabase (DB)
  const syncToSupabase = async (data: UserPassportData, userId: string) => {
    try {
      await supabase.from('profiles').update({
        dietary_profile: data.dietary_profile,
        allergies: (data.allergies || []).filter(a => a.trim() !== ''), // string[] e' un Json valido
        preferred_spiciness_id: data.preferred_spiciness_id,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
    } catch (err) {
      console.error('Passport DB Sync Error:', err);
    }
  };

  // 3. Funzione di aggiornamento pubblica
  const updatePassport = async (newData: Partial<UserPassportData>) => {
    const updated = { ...passport, ...newData };
    updated.allergies = updated.allergies || [];
    setPassport(updated);
    setHasExplicitPassport(true);

    if (userProfile && userProfile.id !== 'guest') {
      // User is logged in -> Sync DB
      await syncToSupabase(updated, userProfile.id);
    } else {
      // Guest -> Sync LocalStorage
      localStorage.setItem(LOCAL_PASSPORT_KEY, JSON.stringify(updated));
    }
  };

  return {
    passport,
    updatePassport,
    hasExplicitPassport,
  };
}
