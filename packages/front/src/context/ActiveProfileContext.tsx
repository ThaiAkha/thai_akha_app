/* eslint-disable react-refresh/only-export-components -- Provider + hook useActiveProfile convivono per design (context pattern) */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { UserProfile } from '../services/auth.service';

/**
 * F2 — Account-switch ("profilo attivo").
 *
 * Un host loggato può AGIRE come sé stesso o come uno dei suoi profili gestiti
 * (sotto-profili `managed_by = host.id`, senza auth.user). La **sessione auth
 * resta SEMPRE dell'host**: il profilo attivo è solo stato lato app.
 *
 * Privacy: si caricano e si possono attivare SOLO l'host e i suoi managed —
 * mai profili arbitrari. Le scritture (menu/dieta/quiz) useranno `activeProfileId`,
 * lecite grazie alle RLS già estese a `managed_by`.
 */

export interface ManagedProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  /** 'primary' | 'minor' | 'visitor' */
  profile_kind: string;
  dietary_profile: string | null;
  allergies: string[];
  preferred_spiciness_id: number | null;
  quiz_points: number | null;
}

interface ActiveProfileContextValue {
  /** Host reale (proprietario della sessione auth). Non cambia mai con lo switch. */
  host: UserProfile | null;
  /** Profili gestiti dall'host (managed_by = host.id). */
  managedProfiles: ManagedProfile[];
  /** id del profilo su cui si sta agendo (host.id di default). */
  activeProfileId: string | null;
  /** true se si sta agendo come un profilo gestito (≠ host). */
  isActingAsManaged: boolean;
  /** Nome da mostrare per il profilo attivo. */
  activeDisplayName: string;
  /** 'primary' | 'minor' | 'visitor' del profilo attivo (host = 'primary'). */
  activeProfileKind: string;
  /** true se il profilo attivo è un visitor (NO menu/premi/certificato). */
  isActiveVisitor: boolean;
  /** Imposta il profilo attivo: accetta solo host.id o un managed id valido. */
  setActiveProfile: (id: string) => void;
  /** Ricarica la lista dei profili gestiti. */
  refreshManaged: () => void;
  loading: boolean;
}

/**
 * Profilo attivo persistito (localStorage): sopravvive ai cambi route, così
 * menu/quiz (pagine separate, fuori da UserPage) condividono lo stesso profilo
 * attivo del dashboard. Validato sempre contro host + managed prima dell'uso.
 */
const ACTIVE_PROFILE_KEY = 'thai_akha_active_profile';
const readPersistedActive = (): string | null => {
  try { return localStorage.getItem(ACTIVE_PROFILE_KEY); } catch { return null; }
};
const writePersistedActive = (id: string | null): void => {
  try {
    if (id) localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    else localStorage.removeItem(ACTIVE_PROFILE_KEY);
  } catch { /* storage non disponibile → no-op */ }
};

const ActiveProfileContext = createContext<ActiveProfileContextValue | null>(null);

export const useActiveProfile = (): ActiveProfileContextValue => {
  const ctx = useContext(ActiveProfileContext);
  if (!ctx) throw new Error('useActiveProfile must be used within an ActiveProfileProvider');
  return ctx;
};

export const ActiveProfileProvider: React.FC<{
  host: UserProfile | null;
  /**
   * Cambia quando l'utente entra in una pagina che usa il profilo attivo (user/menu/quiz):
   * rilegge i managed al rientro, come quando il provider era montato per-route (#87).
   * null = nessun refresh extra.
   */
  refreshKey?: string | null;
  children: React.ReactNode;
}> = ({ host, refreshKey = null, children }) => {
  const hostId = host?.id ?? null;
  const isRealHost = !!hostId && hostId !== 'guest';

  const [managedProfiles, setManagedProfiles] = useState<ManagedProfile[]>([]);
  // Init dal valore persistito (validato dopo il load dei managed); fallback host.
  const [activeProfileId, setActiveProfileId] = useState<string | null>(
    () => (isRealHost ? readPersistedActive() ?? hostId : hostId),
  );
  const [loading, setLoading] = useState(false);

  const refreshManaged = useCallback(() => {
    if (!isRealHost) { setManagedProfiles([]); return; }
    setLoading(true);
    void supabase
      .from('profiles')
      .select('id, full_name, avatar_url, profile_kind, dietary_profile, allergies, preferred_spiciness_id, quiz_points')
      .eq('managed_by', hostId as string)
      .then(({ data, error }) => {
        const list: ManagedProfile[] = (!error && data)
          ? data.map(r => ({
              id: r.id,
              full_name: r.full_name,
              avatar_url: r.avatar_url,
              profile_kind: r.profile_kind,
              dietary_profile: r.dietary_profile,
              allergies: Array.isArray(r.allergies) ? (r.allergies as string[]) : [],
              preferred_spiciness_id: r.preferred_spiciness_id,
              quiz_points: r.quiz_points,
            }))
          : [];
        setManagedProfiles(list);
        // Valida il profilo attivo (anche quello persistito) contro host + managed.
        setActiveProfileId(prev => (prev === hostId || list.some(p => p.id === prev) ? prev : hostId));
        setLoading(false);
      });
  }, [hostId, isRealHost]);

  // Al cambio host: ripristina il persistito (se valido) e ricarica i managed.
  useEffect(() => {
    setActiveProfileId(isRealHost ? readPersistedActive() ?? hostId : hostId);
    refreshManaged();
  }, [hostId, isRealHost, refreshManaged]);

  // Rientro in una pagina che agisce sul profilo attivo: managed aggiornati
  // (creati altrove: altra scheda, admin, invito accettato).
  useEffect(() => {
    if (refreshKey) refreshManaged();
  }, [refreshKey, refreshManaged]);

  const setActiveProfile = useCallback((id: string) => {
    // Solo host o un suo managed (no id arbitrari → privacy).
    if (id === hostId || managedProfiles.some(p => p.id === id)) {
      setActiveProfileId(id);
      writePersistedActive(id);
    }
  }, [hostId, managedProfiles]);

  const isActingAsManaged = !!activeProfileId && activeProfileId !== hostId;

  const activeDisplayName = useMemo(() => {
    if (!isActingAsManaged) return host?.full_name || 'You';
    return managedProfiles.find(m => m.id === activeProfileId)?.full_name || 'Guest';
  }, [isActingAsManaged, host, managedProfiles, activeProfileId]);

  // Kind del profilo attivo: host = 'primary'; gestito = il suo profile_kind.
  const activeProfileKind = isActingAsManaged
    ? (managedProfiles.find(m => m.id === activeProfileId)?.profile_kind ?? 'primary')
    : 'primary';
  const isActiveVisitor = activeProfileKind === 'visitor';

  const value = useMemo<ActiveProfileContextValue>(() => ({
    host,
    managedProfiles,
    activeProfileId,
    isActingAsManaged,
    activeDisplayName,
    activeProfileKind,
    isActiveVisitor,
    setActiveProfile,
    refreshManaged,
    loading,
  }), [host, managedProfiles, activeProfileId, isActingAsManaged, activeDisplayName, activeProfileKind, isActiveVisitor, setActiveProfile, refreshManaged, loading]);

  return <ActiveProfileContext.Provider value={value}>{children}</ActiveProfileContext.Provider>;
};
