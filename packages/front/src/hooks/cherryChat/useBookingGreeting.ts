import { useState, useEffect, useRef } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { getUserBookingState, type UserBookingState } from '@thaiakha/shared/services';
import type { ChatMessage } from '@thaiakha/shared';
import type { UserProfile } from '../../services/auth.service';

/**
 * Saluto proattivo per chi ha una prenotazione. Statico (zero token), caldo,
 * mostrato una sola volta a sessione. Vedi Step 4 / 04_Target_Architecture.
 */
export function buildBookingGreeting(fullName: string | undefined, b: UserBookingState): string {
  const first = fullName ? fullName.split(' ')[0] : '';
  const hi = first ? `Sawasdee kha ${first}!` : 'Sawasdee kha!';
  const cls = b.sessionType === 'evening' ? 'evening class' : 'morning class';
  const n = b.daysUntil ?? 0;
  if (b.state === 'imminent') {
    return n <= 0
      ? `${hi} 🍒 Your ${cls} is today! Remember our meeting point — and tell me if there's anything you'd like to prepare kha.`
      : `${hi} 🍒 Your ${cls} is just ${n} day${n === 1 ? '' : 's'} away! Remember our meeting point — anything you'd like to know before then kha?`;
  }
  // future
  return `${hi} 🍒 ${n} day${n === 1 ? '' : 's'} until your ${cls}! Are you training with our quizzes to win prizes? I'm here for anything you need kha.`;
}

interface BookingGreetingParams {
  userProfile?: UserProfile | null;
  messagesLength: number;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  messagesRef: MutableRefObject<ChatMessage[]>;
}

/**
 * Stato prenotazione (read-only) + saluto proattivo. Estratto 1:1 da useCherryChat:
 * ritorna il ref usato dalle closure (sendMessage) e mantiene lo state interno per
 * l'effetto di saluto.
 */
export function useBookingGreeting({ userProfile, messagesLength, setMessages, messagesRef }: BookingGreetingParams) {
  // Stato prenotazione (read-only) — recuperato una volta per profilo e riusato
  // nel prompt. Guida la response policy (guest/loggato × booking).
  // Ref per le closure (sendMessage) + state per il saluto proattivo (Step 4).
  const bookingStateRef = useRef<UserBookingState>({ state: 'none' });
  const [bookingState, setBookingState] = useState<UserBookingState>({ state: 'none' });

  // Guard: il saluto proattivo va mostrato UNA sola volta per sessione.
  const greetedRef = useRef(false);

  useEffect(() => {
    let active = true;
    if (!userProfile?.id) {
      bookingStateRef.current = { state: 'none' };
      setBookingState({ state: 'none' });
      return;
    }
    getUserBookingState(userProfile.id)
      .then(s => { if (active) { bookingStateRef.current = s; setBookingState(s); } })
      .catch(() => { if (active) { bookingStateRef.current = { state: 'none' }; setBookingState({ state: 'none' }); } });
    return () => { active = false; };
  }, [userProfile?.id]);

  // ── Saluto proattivo (Step 4) ────────────────────────────────────────────────
  // Se l'utente ha una prenotazione, personalizziamo il messaggio di apertura.
  // Mostrato UNA volta al giorno (prima sessione della giornata) — non a ogni
  // apertura. Statico → zero token. Solo su apertura "fresca" (esiste il greeting
  // generico); per chi è già a metà conversazione, skip. Stato in localStorage
  // (app-side, NON scritto da Cherry).
  useEffect(() => {
    if (greetedRef.current) return;
    if (bookingState.state === 'none') return;
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem('cherry_greeting_date') === today) {
        greetedRef.current = true; // già salutato oggi → niente saluto
        return;
      }
    } catch { /* localStorage non disponibile → fallback: una volta a sessione */ }
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === 'static:greeting');
      if (idx === -1) return prev; // utente con history → niente saluto invasivo
      greetedRef.current = true;
      try { localStorage.setItem('cherry_greeting_date', today); } catch { /* noop */ }
      const copy = [...prev];
      copy[idx] = { ...copy[idx], text: buildBookingGreeting(userProfile?.full_name, bookingState) };
      messagesRef.current = copy;
      return copy;
    });
    // messages.length nelle deps: cattura il momento in cui init aggiunge il
    // greeting, qualunque sia l'ordine rispetto al fetch del booking.
  }, [bookingState, userProfile?.full_name, messagesLength, setMessages, messagesRef]);

  return bookingStateRef;
}
