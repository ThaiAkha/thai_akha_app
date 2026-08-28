// POS — colonna sinistra a CLASSI:
//  • auto-coda: mostra UNA classe alla volta = la prima non completata (tutti paid → avanza).
//  • dentro la classe: una card per TEACHER (kitchen) → "Morning · Teacher 1" / "· Teacher 2".
//  • dentro la card: i booking PADRE (avatar leader), cliccabili = selezionano per la fattura + si espandono.
//  • espanso: lista partecipanti + "Split → nuovo gruppo" (selezione per nomi, o pax se non registrati).
//  • i FIGLI (split pagamento) appaiono annidati sotto il padre, conto separato, con "merge".
//  Recupero: frecce ◀ ▶ per rivedere classi già completate.
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';
import { Users, User, Crown, Scissors, Undo2, Check } from 'lucide-react';
import SectionHeader from '../../ui/SectionHeader';
import BadgePaxNumber from '../../ui/badge/BadgePaxNumber';
import { Guest } from '../../../hooks/useManagerPos';

const isPaid = (g: Guest) => g.payment_status === 'paid' || g.payment_status === 'completed' || g.payment_status === 'succeeded';
const sessKey = (g: Guest): 'morning' | 'evening' => (g.session_id || '').includes('evening') ? 'evening' : 'morning';
const avatarOf = (name?: string, url?: string) => url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Guest')}&size=48`;

interface ClassBucket { date: string; session: 'morning' | 'evening'; guests: Guest[]; allPaid: boolean }

interface PosClassSidebarProps {
    guests: Guest[];
    /** Sessione attiva (Morning/Evening) scelta dallo switch nella toolbar centrale. */
    session: 'morning' | 'evening';
    activeGuestId: string | null;
    onSelectGuest: (id: string) => void;
    /** Crea un sotto-gruppo: parentId, user_id dei registrati selezionati, pax totale del nuovo gruppo. */
    onSplit: (parentId: string, userIds: string[], pax: number) => void;
    onMerge: (childId: string) => void;
    /** Split disponibile solo per la teacher (KitchenPos). Il manager non splitta. */
    allowSplit?: boolean;
}

const PosClassSidebar: React.FC<PosClassSidebarProps> = ({ guests, session, activeGuestId, onSelectGuest, onSplit, onMerge, allowSplit = false }) => {
    const { t } = useTranslation('manager');
    const { t: tp } = useTranslation('pos');
    const [splitMode, setSplitMode] = useState<string | null>(null); // booking id in split mode
    const [seatSel, setSeatSel] = useState<Set<string>>(new Set()); // seat keys: u:<userId> | a:<index>

    // Classi ordinate (data asc, morning prima di evening) con almeno un booking.
    const classes = useMemo<ClassBucket[]>(() => {
        const map = new Map<string, ClassBucket>();
        for (const g of guests) {
            const s = sessKey(g);
            const key = `${g.booking_date}__${s}`;
            const b = map.get(key) ?? { date: g.booking_date, session: s, guests: [], allPaid: true };
            b.guests.push(g);
            map.set(key, b);
        }
        const list = Array.from(map.values());
        list.forEach(b => { b.allPaid = b.guests.every(isPaid); });
        return list.sort((a, b) => a.date.localeCompare(b.date) || (a.session === 'morning' ? -1 : 1) - (b.session === 'morning' ? -1 : 1));
    }, [guests]);

    // La sessione (Morning/Evening) arriva dallo switch nella toolbar centrale (stato sollevato nell'hook).
    const focus = useMemo(() => classes.find(c => c.session === session) ?? null, [classes, session]);

    // Numerazione "Group N" stabile (per cartellini fisici univoci): ordine per created_at.
    const groupNo = useMemo(() => {
        const m = new Map<string, number>();
        if (!focus) return m;
        [...focus.guests]
            .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '') || a.internal_id.localeCompare(b.internal_id))
            .forEach((g, i) => m.set(g.internal_id, i + 1));
        return m;
    }, [focus]);

    // Teacher → padri (children annidati)
    const teachers = useMemo(() => {
        if (!focus) return [] as { id: string; name: string; parents: Guest[]; childrenOf: Map<string, Guest[]>; pax: number }[];
        const byKitchen = new Map<string, Guest[]>();
        for (const g of focus.guests) {
            const k = g.kitchen_id || '__none__';
            (byKitchen.get(k) ?? byKitchen.set(k, []).get(k)!).push(g);
        }
        return Array.from(byKitchen.entries()).map(([id, gs]) => {
            const parents = gs.filter(g => !g.parent_booking_id);
            const childrenOf = new Map<string, Guest[]>();
            gs.filter(g => g.parent_booking_id).forEach(c => {
                const arr = childrenOf.get(c.parent_booking_id!) ?? [];
                arr.push(c); childrenOf.set(c.parent_booking_id!, arr);
            });
            return { id, name: gs[0]?.kitchen_name || tp('sidebar.title', { defaultValue: 'Guests' }), parents, childrenOf, pax: gs.reduce((a, g) => a + (g.pax_count || 0), 0) };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [focus, tp]);

    // Rappresentante della card = primo registrato (avatar/nome proprio) · altrimenti "Guest 0N" (N = group number).
    const repOf = (g: Guest): { name: string; avatar_url?: string } => {
        const r = g.participants.find(p => p.user_id) ?? g.participants[0];
        if (r) return { name: r.full_name, avatar_url: r.avatar_url };
        const n = groupNo.get(g.internal_id) ?? 0;
        return { name: `${tp('split.guest', { defaultValue: 'Guest' })} ${String(n).padStart(2, '0')}` };
    };

    const startSplit = (g: Guest) => { setSplitMode(g.internal_id); setSeatSel(new Set()); };
    const toggleSeat = (key: string) => setSeatSel(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });
    const confirmSplit = (g: Guest) => {
        const userIds = [...seatSel].filter(k => k.startsWith('u:')).map(k => k.slice(2));
        const pax = seatSel.size;
        if (pax >= 1 && pax < (g.pax_count || 1)) onSplit(g.internal_id, userIds, pax);
        setSplitMode(null); setSeatSel(new Set());
    };

    const bookingCard = (g: Guest, child = false) => {
        const active = activeGuestId === g.internal_id;
        // Colore card (tenue, 1px): grigio=none · arancione=saved (teacher) · verde=cash · blu=card (manager).
        const state = g.billingState ?? 'none';
        const tone =
            state === 'cash' ? 'bg-green-50/50 dark:bg-green-500/[0.06] border-green-200 dark:border-green-500/30'
                : state === 'card' ? 'bg-blue-50/50 dark:bg-blue-500/[0.06] border-blue-200 dark:border-blue-500/30'
                    : state === 'saved' ? 'bg-orange-50/50 dark:bg-orange-500/[0.06] border-orange-200 dark:border-orange-500/30'
                        : 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-gray-700';
        // Split solo teacher, su gruppo madre >1 pax e non ancora pagato (cash/card).
        const canSplit = allowSplit && !child && (g.pax_count || 1) > 1 && state !== 'cash' && state !== 'card';
        const gNo = groupNo.get(g.internal_id);
        const splitting = splitMode === g.internal_id;
        const rep = repOf(g);
        // Posti: registrati (avatar/nome) + anonimi (placeholder), padded a pax_count
        const real = g.participants;
        const anonCount = Math.max(0, (g.pax_count || 1) - real.length);
        return (
            <div key={g.internal_id} className={cn('rounded-xl border', tone, active && 'shadow-md')}>
                <button onClick={() => onSelectGuest(g.internal_id)} className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left">
                    {rep.avatar_url
                        ? <img src={rep.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700" />
                        : <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0"><User className="size-4 text-gray-400" /></span>}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            {gNo && <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-gray-200 dark:bg-gray-700 text-body px-1.5 py-0.5 rounded">G{gNo}</span>}
                            {g.participants.some(p => p.is_leader) && <Crown className="size-3 text-warning shrink-0" />}
                            <span className="text-sm font-bold text-body truncate">{rep.name}</span>
                        </div>
                    </div>
                    <BadgePaxNumber paxCount={g.pax_count} size="sm" />
                </button>

                {/* Espanso (= booking selezionato): posti + controlli split */}
                {active && (
                    <div className="px-2.5 pb-2.5 pt-1 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                        {real.map((p, i) => {
                            const key = p.user_id ? `u:${p.user_id}` : `r:${i}`;
                            const on = seatSel.has(key);
                            return (
                                <div key={key} className="flex items-center gap-2">
                                    {splitting && (
                                        <button onClick={() => toggleSeat(key)} className={cn('w-4 h-4 rounded border flex items-center justify-center shrink-0', on ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 dark:border-gray-600')}>
                                            {on && <Check className="size-3" />}
                                        </button>
                                    )}
                                    <img src={avatarOf(p.full_name, p.avatar_url)} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                                    <span className="text-xs font-medium text-body truncate flex-1">{p.full_name}</span>
                                    {p.is_leader && <Crown className="size-3 text-warning shrink-0" />}
                                </div>
                            );
                        })}
                        {Array.from({ length: anonCount }).map((_, i) => {
                            const key = `a:${i}`;
                            const on = seatSel.has(key);
                            return (
                                <div key={key} className="flex items-center gap-2">
                                    {splitting && (
                                        <button onClick={() => toggleSeat(key)} className={cn('w-4 h-4 rounded border flex items-center justify-center shrink-0', on ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 dark:border-gray-600')}>
                                            {on && <Check className="size-3" />}
                                        </button>
                                    )}
                                    <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0"><User className="size-3.5 text-gray-400" /></span>
                                    <span className="text-xs font-medium text-sub italic truncate flex-1">{tp('split.guest', { defaultValue: 'Guest' })} {real.length + i + 1}</span>
                                </div>
                            );
                        })}

                        {/* Controlli */}
                        {child ? (
                            <button onClick={() => onMerge(g.internal_id)} className="mt-1 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-sub hover:border-amber-500 hover:text-warning transition-colors">
                                <Undo2 className="size-3.5" /> {tp('split.merge', { defaultValue: 'Merge back' })}
                            </button>
                        ) : canSplit && (splitting ? (
                            <div className="mt-1.5 space-y-1.5">
                                <div className="text-xs font-bold text-sub">
                                    {tp('split.preview', { defaultValue: 'New group' })}: <span className="text-primary-600 dark:text-primary-400">{seatSel.size} pax</span>
                                    <span className="text-sub"> · {tp('split.classPaid', { defaultValue: 'class prepaid' })}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => confirmSplit(g)} disabled={seatSel.size < 1 || seatSel.size >= (g.pax_count || 1)}
                                        className="flex-1 h-8 rounded-lg bg-primary-500 text-white text-xs font-bold disabled:opacity-50 hover:bg-primary-600 transition-colors">
                                        {tp('split.create', { defaultValue: 'Create group' })}
                                    </button>
                                    <button onClick={() => { setSplitMode(null); setSeatSel(new Set()); }} className="h-8 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-sub">
                                        {tp('split.cancel', { defaultValue: 'Cancel' })}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => startSplit(g)} className="mt-1 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-xs font-bold text-sub hover:border-primary-500 hover:text-primary-600 transition-colors">
                                <Scissors className="size-3.5" /> {tp('split.button', { defaultValue: 'Split → new group' })}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="lg:col-span-2 flex flex-col bg-white dark:bg-[#0a0a0b] border-r border-gray-100 dark:border-white/[0.05] overflow-hidden">
            <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-2.5 shrink-0 shadow-sm">
                <div className="p-1.5 rounded-lg bg-white dark:bg-white/[0.05] shadow-sm border border-gray-100 dark:border-white/[0.05] text-sub"><Users size={16} /></div>
                <SectionHeader title={tp('sidebar.title', { defaultValue: 'Guests' })} variant="title" />
            </div>

            {classes.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6 text-sm text-sub text-center">{tp('sidebar.noClass', { defaultValue: 'No classes to bill today.' })}</div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                    {/* Una card per KITCHEN: header (nome + totale clienti) + card gruppo/cliente sotto */}
                    {!focus ? (
                        <div className="py-8 text-center text-sm text-sub">{tp('sidebar.noGuestsSession', { defaultValue: 'No guests for this class.' })}</div>
                    ) : teachers.map(tt => (
                        <div key={tt.id}>
                            <div className="px-4 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                                <span className="text-base font-black tracking-tight text-body truncate">{tt.name}</span>
                                <BadgePaxNumber paxCount={tt.pax} size="lg" />
                            </div>
                            <div className="px-3 py-5 space-y-4">
                                {tt.parents.length === 0 && <div className="px-2 py-1.5 text-xs italic text-sub">{t('groupsPlanner.colEmpty', { defaultValue: 'No guests' })}</div>}
                                {tt.parents.map(p => {
                                    const kids = tt.childrenOf.get(p.internal_id) || [];
                                    return (
                                        <div key={p.internal_id} className={cn('space-y-1.5', kids.length > 0 && 'relative pl-3')}>
                                            {/* Timeline: linea che collega i gruppi splittati dalla stessa madre */}
                                            {kids.length > 0 && <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary-300 dark:bg-primary-500/40" />}
                                            {bookingCard(p)}
                                            {kids.map(c => bookingCard(c, true))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PosClassSidebar;
