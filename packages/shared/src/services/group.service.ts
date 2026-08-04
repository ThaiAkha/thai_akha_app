// packages/shared/src/services/group.service.ts
// Shared Booking — write path per il flusso "join group" (F1).
// L'inserimento del partecipante passa SEMPRE dalla RPC SECURITY DEFINER
// `join_booking_by_ref`: i guard (booking esiste + status in confirmed/pending,
// idempotenza via ON CONFLICT) vivono nel DB, non nel client. Un nuovo joiner
// NON può leggere il booking target (RLS bookings = own/guest/staff), quindi la
// validazione lato client sarebbe impossibile: per questo è la RPC a decidere.
import { supabase } from '../lib/supabase';

export interface JoinGroupResult {
  /** true se l'utente è stato aggiunto o era già partecipante (idempotente). */
  success: boolean;
  /** internal_id del booking unito (presente su success). */
  bookingId?: string;
  /** Messaggio diagnostico dal DB (es. ref non valido). */
  message?: string;
}

/**
 * Aggiunge l'utente loggato come partecipante (is_leader=false) al booking
 * identificato da `bookingRef` (= `bookings.booking_ref`, il codice TAK del link).
 * Idempotente. Richiede una sessione auth attiva (il joiner deve avere un account
 * o un sotto-profilo host — la creazione account avviene prima, nella pagina).
 */
export const joinGroup = async (bookingRef: string): Promise<JoinGroupResult> => {
  const ref = bookingRef?.trim();
  if (!ref) return { success: false, message: 'Missing booking reference.' };

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return { success: false, message: 'You must be signed in to join a group.' };

  const { data, error } = await supabase.rpc('join_booking_by_ref', {
    p_booking_ref: ref,
    p_user_id: userId,
  });

  if (error) return { success: false, message: error.message };

  // La RPC ritorna json_build_object('success', bool, 'booking_id'|'message', …).
  const result = (data ?? {}) as { success?: boolean; booking_id?: string; message?: string };
  return {
    success: result.success === true,
    bookingId: result.booking_id,
    message: result.message,
  };
};

// ── F2.d — Creazione sotto-profilo gestito (managed) ─────────────────────────

export interface CreateManagedProfileInput {
  fullName: string;
  /** 'minor' (F2.d) o 'visitor' (F3). Default 'minor'. */
  profileKind?: 'minor' | 'visitor';
}

export interface CreateManagedProfileResult {
  success: boolean;
  /** id del profilo gestito creato (uuid generato lato client). */
  profileId?: string;
  message?: string;
}

/**
 * Crea un sotto-profilo gestito (riga `profiles` SENZA auth.user) sotto l'host
 * loggato: `managed_by = auth.uid()`, id uuid generato. Lecito per la RLS
 * `Profiles Insert` (with_check: auth.uid()=id OR managed_by=auth.uid()).
 * Privacy: si crea solo sotto sé stessi; nessun accesso ad altri account.
 */
export const createManagedProfile = async (
  input: CreateManagedProfileInput,
): Promise<CreateManagedProfileResult> => {
  const fullName = input.fullName?.trim();
  if (!fullName) return { success: false, message: 'Name is required.' };

  const { data: authData } = await supabase.auth.getUser();
  const hostId = authData.user?.id;
  if (!hostId) return { success: false, message: 'You must be signed in.' };

  const id = crypto.randomUUID();
  const { error } = await supabase.from('profiles').insert({
    id,
    managed_by: hostId,
    profile_kind: input.profileKind ?? 'minor',
    full_name: fullName,
    role: 'guest',
    dietary_profile: 'diet_regular',
    preferred_spiciness_id: 2,
  });

  if (error) return { success: false, message: error.message };
  return { success: true, profileId: id };
};

// ── F3.c — Associa un visitor gestito a un booking (con limiti) ──────────────

export interface AddVisitorResult {
  success: boolean;
  message?: string;
}

/**
 * Aggiunge un sotto-profilo VISITOR gestito al booking come participant.
 * Delega alla RPC SECURITY DEFINER `add_managed_participant`: i limiti
 * (1/pagante · 2/booking · 4/classe) + il guard "l'host gestisce il profilo"
 * vivono nel DB. Idempotente. Ritorna il messaggio di limite se superato.
 */
export const addVisitorToBooking = async (
  bookingId: string,
  visitorProfileId: string,
): Promise<AddVisitorResult> => {
  if (!bookingId || !visitorProfileId) {
    return { success: false, message: 'Missing booking or visitor.' };
  }
  const { data, error } = await supabase.rpc('add_managed_participant', {
    p_booking_id: bookingId,
    p_profile_id: visitorProfileId,
  });
  if (error) return { success: false, message: error.message };

  const result = (data ?? {}) as { success?: boolean; message?: string };
  return { success: result.success === true, message: result.message };
};
