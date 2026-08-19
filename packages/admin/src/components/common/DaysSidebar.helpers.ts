// Helper estratti da DaysSidebar.tsx (react-refresh: il file componente esporta solo componenti).
// `dayLabel` e' usato anche dalle toolbar delle pagine (es. "Today · 23 Jun · Morning").
const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]; };

export const dayLabel = (iso: string, t: (k: string, o?: { defaultValue?: string }) => string) => {
    const today = todayISO();
    const tmr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]; })();
    const dm = new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    if (iso === today) return `${t('groupsPlanner.today', { defaultValue: 'Today' })} · ${dm}`;
    if (iso === tmr) return `${t('groupsPlanner.tomorrow', { defaultValue: 'Tomorrow' })} · ${dm}`;
    const weekday = new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long' });
    return `${weekday} · ${dm}`;
};
