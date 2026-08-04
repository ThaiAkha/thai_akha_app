// MULTI-KITCHEN — Colonna sinistra RIUSABILE: nav giorni (oggi → +N) con card-giorno + pillole
// Morning(rosso)/Evening(verde). Componente presentazionale: riceve `days` (da useDaysOverview),
// la selezione corrente e onSelect. `headerSlot` = controllo prominente in cima (es. switcher
// pickup/dropoff nel Driver Planner). Usato da Kitchen Planner, Driver Planner, e altri ruoli.
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';
import { CalendarDays, Sunrise, Sunset, Plus } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import BadgePaxNumber from '../ui/badge/BadgePaxNumber';
import type { DayOverview } from '../../hooks/useDaysOverview';

export type DaySession = 'morning_class' | 'evening_class';

const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]; };
// Esportato: usato anche dalle toolbar delle pagine (es. "Today · 23 Jun · Morning").
export const dayLabel = (iso: string, t: (k: string, o?: any) => string) => {
    const today = todayISO();
    const tmr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]; })();
    const dm = new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    if (iso === today) return `${t('groupsPlanner.today', { defaultValue: 'Today' })} · ${dm}`;
    if (iso === tmr) return `${t('groupsPlanner.tomorrow', { defaultValue: 'Tomorrow' })} · ${dm}`;
    const weekday = new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long' });
    return `${weekday} · ${dm}`;
};

// Colori sessione: Morning = rosso, Evening = verde. Pillola SEMPRE tenue-colorata; hover/attivo = vivo.
// Active = + barra bordo sinistra colorata. Classi LETTERALI (JIT Tailwind); hover via group-hover.
const SESSION_TONE = {
    morning_class: {
        rowOn: 'bg-red-500/15 border-red-500/40',
        rowOff: 'bg-red-50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20 group-hover:bg-red-500/15 group-hover:border-red-500/40',
        bar: 'bg-red-500',
        barHover: 'group-hover:bg-red-500',
        iconOn: 'text-red-500 border-red-400 dark:border-red-500/50',
        iconOff: 'text-red-500/80 dark:text-red-400/70 border-red-200 dark:border-red-500/25 group-hover:text-red-500 group-hover:border-red-400 dark:group-hover:border-red-500/50',
        labelOn: 'text-red-700 dark:text-red-300',
        labelOff: 'text-gray-700 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-300',
        badgeOn: 'bg-red-500/20 text-red-700 dark:text-red-300',
        badgeOff: 'bg-white/70 dark:bg-gray-800/60 text-red-600 dark:text-red-300 group-hover:bg-red-500/20 group-hover:text-red-700 dark:group-hover:text-red-300',
    },
    evening_class: {
        rowOn: 'bg-green-500/15 border-green-500/40',
        rowOff: 'bg-green-50 border-green-200 dark:bg-green-500/5 dark:border-green-500/20 group-hover:bg-green-500/15 group-hover:border-green-500/40',
        bar: 'bg-green-500',
        barHover: 'group-hover:bg-green-500',
        iconOn: 'text-green-600 border-green-400 dark:border-green-500/50',
        iconOff: 'text-green-600/80 dark:text-green-400/70 border-green-200 dark:border-green-500/25 group-hover:text-green-600 group-hover:border-green-400 dark:group-hover:border-green-500/50',
        labelOn: 'text-green-700 dark:text-green-300',
        labelOff: 'text-gray-700 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-300',
        badgeOn: 'bg-green-500/20 text-green-700 dark:text-green-300',
        badgeOff: 'bg-white/70 dark:bg-gray-800/60 text-green-600 dark:text-green-300 group-hover:bg-green-500/20 group-hover:text-green-700 dark:group-hover:text-green-300',
    },
} as const;

interface DaysSidebarProps {
    days: DayOverview[];
    selectedDate: string;
    selectedSession: DaySession;
    onSelect: (date: string, session: DaySession) => void;
    /** Titolo header (default: "Days"). */
    title?: string;
    /** Controllo prominente sotto il titolo (es. switcher pickup/dropoff). */
    headerSlot?: React.ReactNode;
}

const DaysSidebar: React.FC<DaysSidebarProps> = ({ days, selectedDate, selectedSession, onSelect, title, headerSlot }) => {
    const { t } = useTranslation('manager');
    // Mostra solo OGGI di default; "+" aggiunge un giorno alla volta (futuro).
    const [visibleCount, setVisibleCount] = useState(1);
    const shown = days.slice(0, Math.min(Math.max(1, visibleCount), days.length || 1));
    const canAddMore = visibleCount < days.length;

    return (
        <div className="lg:col-span-2 flex flex-col bg-white dark:bg-[#0a0a0b] border-r border-gray-100 dark:border-white/[0.05] overflow-hidden">
            <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-2.5 shrink-0 shadow-sm">
                <div className="p-1.5 rounded-lg bg-white dark:bg-white/[0.05] shadow-sm border border-gray-100 dark:border-white/[0.05] text-gray-600 dark:text-gray-400">
                    <CalendarDays size={16} />
                </div>
                <SectionHeader title={title ?? t('groupsPlanner.days', { defaultValue: 'Days' })} variant="title" />
            </div>

            {/* Slot prominente opzionale (es. pickup/dropoff) */}
            {headerSlot && <div className="px-3 pt-3 shrink-0">{headerSlot}</div>}

            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                {shown.map(d => {
                    const sessions: { key: DaySession; label: string; icon: React.ReactNode; pax: number }[] = [
                        { key: 'morning_class', label: t('groupsPlanner.morningClass', { defaultValue: 'Morning Class' }), icon: <Sunrise size={20} />, pax: d.morning },
                        { key: 'evening_class', label: t('groupsPlanner.eveningClass', { defaultValue: 'Evening Class' }), icon: <Sunset size={20} />, pax: d.evening },
                    ];
                    const dayActive = selectedDate === d.date;
                    return (
                        <div key={d.date}>
                            <div className={cn('px-4 py-4 flex items-center justify-between',
                                dayActive ? 'bg-orange-500/10' : 'bg-gray-50/50 dark:bg-white/[0.02]')}>
                                <span className={cn('text-base font-black tracking-tight', dayActive ? 'text-orange-700 dark:text-orange-300' : 'text-gray-800 dark:text-gray-100')}>{dayLabel(d.date, t)}</span>
                                <BadgePaxNumber paxCount={d.morning + d.evening} size="lg" />
                            </div>
                            <div className="px-3 py-5 space-y-4">
                                {sessions.map(s => {
                                    const isActive = selectedDate === d.date && selectedSession === s.key;
                                    const tone = SESSION_TONE[s.key];
                                    return (
                                        <button
                                            key={s.key}
                                            onClick={() => onSelect(d.date, s.key)}
                                            className={cn('group relative w-full flex items-center gap-3 pl-3 pr-4 py-3 rounded-xl border transition-all text-left overflow-hidden', isActive ? tone.rowOn : tone.rowOff)}
                                        >
                                            <span className={cn('absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-colors', isActive ? tone.bar : cn('bg-transparent', tone.barHover))} />
                                            <span className={cn('flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 transition-colors bg-white dark:bg-gray-900', isActive ? tone.iconOn : tone.iconOff)}>{s.icon}</span>
                                            <span className={cn('flex-1 text-base font-semibold transition-colors', isActive ? tone.labelOn : tone.labelOff)}>{s.label}</span>
                                            <BadgePaxNumber paxCount={s.pax} size="sm" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Divider + bottone "Next Days" ristretto e centrato sotto le card giorno */}
                {canAddMore && (
                    <div className="border-t border-gray-200 dark:border-gray-800">
                        <div className="flex justify-center py-4">
                            <button
                                type="button"
                                onClick={() => setVisibleCount(c => c + 1)}
                                className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            >
                                <Plus size={18} /> {t('groupsPlanner.addDay', { defaultValue: 'Next Days' })}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DaysSidebar;
