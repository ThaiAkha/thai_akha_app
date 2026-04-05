// packages/admin/src/hooks/useCherryChat.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { buildAdminPrompt, type BookingDaySummary, type GuestAlert } from '../prompts/adminPrompt';
import {
  getOrCreateSession,
  loadRecentMessages,
  saveMessage,
  updateSummary,
  checkRateLimit,
  type ChatSession,
  type DbChatMessage,
} from '@thaiakha/shared/services';
import { contentService } from '@thaiakha/shared/services';
import { supabase } from '@thaiakha/shared';
import type { ChatMessage } from '@thaiakha/shared';
import type { UserProfile } from '../services/auth.service';

const HISTORY_WINDOW = 5;
const SUMMARY_THRESHOLD = 20;

export const useCherryChat = (userProfile?: UserProfile | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatRef = useRef<any>(null);
  const sessionRef = useRef<ChatSession | null>(null);
  const initialized = useRef(false);
  const cookingClassesRef = useRef<any[]>([]);
  const bookingSnapshotRef = useRef<BookingDaySummary[]>([]);
  const guestAlertsRef = useRef<GuestAlert[]>([]);

  const buildSystemPrompt = useCallback(
    (history: DbChatMessage[], summary: string | null): string => {
      const base = buildAdminPrompt(
        userProfile || {},
        false,
        {
          cookingClasses: cookingClassesRef.current,
          bookingSnapshot: bookingSnapshotRef.current,
          guestAlerts: guestAlertsRef.current,
        }
      );

      let historyBlock = '';
      if (summary) {
        historyBlock += `\n### SESSION SUMMARY (previous context):\n${summary}\n`;
      }
      if (history.length > 0) {
        historyBlock += `\n### RECENT CONVERSATION:\n`;
        historyBlock += history
          .slice(-HISTORY_WINDOW)
          .map(m => `${m.sender_role === 'user' ? 'Staff' : 'Cherry'}: ${m.content}`)
          .join('\n');
      }
      return base + historyBlock;
    },
    [userProfile]
  );

  const initGeminiChat = useCallback(
    (history: DbChatMessage[], summary: string | null) => {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: buildSystemPrompt(history, summary),
          temperature: 0.5,
        },
      });
    },
    [buildSystemPrompt]
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const [classes, session, bookingsResult] = await Promise.all([
        contentService.getCookingClasses(),
        getOrCreateSession(userProfile?.id),
        supabase
          .from('bookings')
          .select('internal_id, booking_date, session_id, pax_count, visitor_count, status, guest_name, booking_ref, hotel_name, pickup_time, pickup_zone, payment_method, payment_status, total_price, special_requests, customer_note')
          .gte('booking_date', today)
          .lte('booking_date', nextWeek)
          .neq('status', 'cancelled')
          .order('booking_date'),
      ]);

      cookingClassesRef.current = classes;
      sessionRef.current = session;
      setSessionId(session.id);

      // Build booking snapshot
      const bookings = bookingsResult.data ?? [];
      bookingSnapshotRef.current = bookings.map(b => ({
        date: b.booking_date,
        session: b.session_id ?? 'unknown',
        pax: b.pax_count ?? 0,
        visitors: b.visitor_count ?? 0,
        status: b.status ?? 'unknown',
        bookingRef: b.booking_ref ?? undefined,
        hotelName: b.hotel_name ?? undefined,
        pickupTime: b.pickup_time ?? undefined,
        pickupZone: b.pickup_zone ?? undefined,
        paymentMethod: b.payment_method ?? undefined,
        paymentStatus: b.payment_status ?? undefined,
        totalPrice: b.total_price ?? undefined,
        specialRequests: b.special_requests ?? undefined,
        customerNote: b.customer_note ?? undefined,
      }));

      // Fetch dietary alerts from menu_selections for confirmed bookings
      const bookingIds = bookings
        .filter(b => b.status === 'confirmed')
        .map(b => b.internal_id)
        .filter(Boolean) as string[];

      if (bookingIds.length > 0) {
        const { data: selections } = await supabase
          .from('menu_selections')
          .select('booking_id, dietary_profile, allergies, curry_id, soup_id, stirfry_id, spiciness_level')
          .in('booking_id', bookingIds);

        if (selections?.length) {
          // Map booking_id → booking date/session for context
          const bookingMap = new Map(bookings.map(b => [b.internal_id, b]));
          guestAlertsRef.current = selections
            .filter(s => s.dietary_profile !== 'diet_regular' || (Array.isArray(s.allergies) && s.allergies.length > 0))
            .map(s => {
              const booking = bookingMap.get(s.booking_id);
              return {
                name: bookingMap.get(s.booking_id)?.guest_name ?? 'Guest',
                date: booking?.booking_date ?? '',
                session: booking?.session_id ?? '',
                dietary: s.dietary_profile ?? 'regular',
                allergies: Array.isArray(s.allergies) ? s.allergies : [],
                curryChoice: s.curry_id ?? undefined,
                soupChoice: s.soup_id ?? undefined,
                stirfryChoice: s.stirfry_id ?? undefined,
                spicinessLevel: s.spiciness_level ?? undefined,
              };
            });
        }
      }

      const history = await loadRecentMessages(session.id, HISTORY_WINDOW * 2);
      const initialMessages: ChatMessage[] = history.map(
        (m): ChatMessage => ({
          id: m.id,
          role: m.sender_role === 'user' ? 'user' : 'model',
          text: m.content,
        })
      );

      let historyForGemini = history;
      if (initialMessages.length === 0) {
        const greeting = userProfile?.full_name
          ? `Sawasdee kha ${userProfile.full_name.split(' ')[0]}! Admin panel active. How can I assist you today? kha`
          : "Sawasdee kha! I'm Cherry, your kitchen AI. How can I help the team today? kha";
        initialMessages.push({ id: 'greeting', role: 'model', text: greeting });

        const greetingDbMsg: DbChatMessage = {
          id: 'greeting',
          sender_role: 'assistant',
          content: greeting,
          type: 'text',
          created_at: new Date().toISOString(),
          session_id: session.id,
        };
        historyForGemini = [...history, greetingDbMsg];
      }

      setMessages(initialMessages);
      initGeminiChat(historyForGemini, session.summary);
    };

    init();
  }, [userProfile?.id]);

  const triggerAutoSummary = async (sid: string) => {
    if (!chatRef.current) return;
    try {
      const result = await chatRef.current.sendMessage({
        message:
          'Please summarize this conversation in max 2 sentences, focusing on: operational requests, booking summaries, and any staff notes. Be concise.',
      });
      const summary: string = result.text?.trim() || '';
      if (summary) await updateSummary(sid, summary);
    } catch {
      // silent fail
    }
  };

  const sendMessage = async (userText: string) => {
    if (!chatRef.current || !userText.trim() || isLoading) return;

    const sid = sessionRef.current?.id ?? null;

    if (sid) {
      const rateLimit = await checkRateLimit(userProfile?.id, undefined);
      if (!rateLimit.allowed) {
        setError(rateLimit.reason ?? 'Limit reached.');
        return;
      }
    }

    const userMsgId = `user-${Date.now()}`;
    const modelMsgId = `model-${Date.now()}`;

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', text: userText },
      { id: modelMsgId, role: 'model', text: '', isStreaming: true },
    ]);
    setIsLoading(true);
    setError(null);

    if (sid) saveMessage(sid, 'user', userText, 'text');

    try {
      const streamResponse = await chatRef.current.sendMessageStream({ message: userText });
      let fullResponse = '';

      for await (const chunk of streamResponse) {
        const text = (chunk as any).text;
        if (text) {
          fullResponse += text;
          setMessages(prev =>
            prev.map(m => (m.id === modelMsgId ? { ...m, text: fullResponse } : m))
          );
        }
      }

      setMessages(prev =>
        prev.map(m => (m.id === modelMsgId ? { ...m, isStreaming: false } : m))
      );

      if (sid) saveMessage(sid, 'assistant', fullResponse, 'text');

      if (sid && sessionRef.current && sessionRef.current.message_count >= SUMMARY_THRESHOLD) {
        sessionRef.current.message_count = 0;
        triggerAutoSummary(sid);
      }
    } catch (err) {
      console.error('[useCherryChat/admin] sendMessage error:', err);
      setError('The kitchen is very busy kha! Please try again.');
      setMessages(prev => prev.filter(m => m.id !== modelMsgId));
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading, error, sessionId };
};
