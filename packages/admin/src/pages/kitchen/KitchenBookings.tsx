/**
 * 🍽️ KITCHEN BOOKINGS — read-only 3-pane view for the teacher, using the standard
 * admin DataExplorer shell (same layout as the payout/reports pages).
 *  SIDEBAR  : days → classes (Morning/Evening) with pax counts.
 *  CENTER   : participants line-by-line (avatar · passport · diet · allergies · menu), grouped by booking.
 *  INSPECTOR: group/booking info (hotel · pickup · zone · leader · diet/allergy summary).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';
import { supabase } from '@thaiakha/shared/lib/supabase';
import {
  Users, AlertTriangle, Leaf, CalendarDays, Crown, MapPin, Hotel, Clock, Flame, Globe2,
  Compass, CreditCard, Printer, Download,
} from 'lucide-react';
import { DataExplorerLayout } from '../../components/data-explorer';
import LeaderHeader from '../../components/common/LeaderHeader';
import DaysSidebar, { type DaySession } from '../../components/common/DaysSidebar';
import { InspectorShell } from '../../components/ui/inspector/InspectorShell';
import { useKitchenGroups, type KitchenGroup, type KitchenParticipant } from '../../hooks/useKitchenGroups';

const dietLabel = (d?: string | null) => (d || 'diet_regular').replace(/^diet_/, '').replace(/^allergy_/, '').replace(/_/g, ' ');
const fmtDay = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const avatarSrc = (p: KitchenParticipant) =>
  p.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.profile?.full_name || 'Guest')}&size=64`;

const KitchenBookings: React.FC = () => {
  const { t } = useTranslation('reservation');
  const { groups, days, loading } = useKitchenGroups();

  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('morning_class');
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const [exploreId, setExploreId] = useState<string | null>(null); // booking-detail mode (explore icon)
  const [reportBusy, setReportBusy] = useState<'print' | 'download' | null>(null); // MULTI-KITCHEN (Fase 4)
  const [reportError, setReportError] = useState<string | null>(null);

  // MULTI-KITCHEN (Fase 4) — kitchen_report del giorno selezionato (edge render-report,
  // scoped lato server: la teacher ottiene solo la propria kitchen). Genera on-the-fly.
  const handleReport = async (mode: 'print' | 'download') => {
    if (!selectedDay || reportBusy) return;
    setReportBusy(mode); setReportError(null);
    try {
      const { data, error } = await supabase.functions.invoke('render-report', {
        body: { report: 'kitchen_report', week_start: selectedDay, week_end: selectedDay, format: 'A4' },
      });
      if (error) {
        let msg = error.message;
        const ctx = (error as { context?: { json?: () => Promise<{ error?: string }> } }).context;
        if (ctx?.json) { try { msg = (await ctx.json())?.error ?? msg; } catch { /* ignore */ } }
        throw new Error(msg);
      }
      const url = URL.createObjectURL(data as Blob);
      if (mode === 'download') {
        const a = document.createElement('a');
        a.href = url; a.download = `ThaiAkha_Kitchen_Report_${selectedDay}.pdf`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      } else {
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
        iframe.src = url;
        iframe.onload = () => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); };
        document.body.appendChild(iframe);
        setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url); }, 60000);
      }
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Report error');
    } finally {
      setReportBusy(null);
    }
  };

  // Sidebar items: one row per day+class with pax > 0
  // Default selection: first day with bookings (i giorni sono già scoped alla kitchen)
  useEffect(() => {
    if (!selectedDay && days.length) {
      const d = days[0];
      setSelectedDay(d.date);
      setSelectedClass(d.morning > 0 ? 'morning_class' : 'evening_class');
    }
  }, [days, selectedDay]);
  const daySession: DaySession = selectedClass === 'evening_class' ? 'evening_class' : 'morning_class';

  const dayGroups = useMemo<KitchenGroup[]>(
    () => groups.filter(g => g.booking_date === selectedDay && (g.session_id || 'morning_class') === selectedClass),
    [groups, selectedDay, selectedClass],
  );

  const selectedGroup = useMemo<KitchenGroup | null>(
    () => dayGroups.find(g => g.participants.some(p => p.id === selectedPid)) ?? null,
    [dayGroups, selectedPid],
  );
  const exploreGroup = useMemo<KitchenGroup | null>(
    () => dayGroups.find(g => g.id === exploreId) ?? null,
    [dayGroups, exploreId],
  );
  const leader = selectedGroup?.participants.find(p => p.is_leader) ?? null;
  const totalPax = dayGroups.reduce((a, g) => a + g.pax_count, 0);

  return (
    <DataExplorerLayout
      viewMode="table"
      inspectorOpen={true}
      onInspectorClose={() => { setSelectedPid(null); setExploreId(null); }}
      sidebar={
        <DaysSidebar
          title={t('kitchen.days', { defaultValue: 'Days & classes' })}
          days={days}
          selectedDate={selectedDay}
          selectedSession={daySession}
          onSelect={(date, session) => { setSelectedDay(date); setSelectedClass(session); setSelectedPid(null); setExploreId(null); }}
        />
      }
      toolbar={
        <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
          <Users className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-bold text-title">
            {selectedDay ? `${fmtDay(selectedDay)} · ${selectedClass === 'evening_class' ? 'Evening' : 'Morning'}` : t('kitchen.participants', { defaultValue: 'Participants' })}
          </span>
          <span className="ml-auto text-xs font-mono text-sub">{totalPax} pax</span>
          {/* MULTI-KITCHEN (Fase 4) — report kitchen del giorno (stampa / PDF) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!selectedDay || reportBusy !== null}
              onClick={() => handleReport('print')}
              title={t('kitchen.printReport', { defaultValue: 'Print report' })}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-body hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 transition-colors"
            >
              <Printer className="size-4" />{reportBusy === 'print' ? '…' : t('kitchen.print', { defaultValue: 'Print' })}
            </button>
            <button
              type="button"
              disabled={!selectedDay || reportBusy !== null}
              onClick={() => handleReport('download')}
              title={t('kitchen.downloadPdf', { defaultValue: 'Download PDF' })}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-body hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 transition-colors"
            >
              <Download className="size-4" />{reportBusy === 'download' ? '…' : 'PDF'}
            </button>
          </div>
        </div>
      }
      inspector={
        <InspectorShell>
          {exploreGroup ? (
            <div className="p-5 space-y-4">
              <LeaderHeader
                label={t('kitchen.bookingDetails', { defaultValue: 'Booking details' })}
                leader={{
                  name: exploreGroup.leaderName,
                  role: exploreGroup.ownerRole,
                  phone: exploreGroup.phone,
                  agencyPhone: exploreGroup.ownerPhone,
                  email: exploreGroup.ownerEmail,
                  lineId: exploreGroup.ownerLineId,
                  pax: exploreGroup.pax_count,
                }}
                emptyContactsLabel={t('kitchen.noContacts', { defaultValue: 'No contacts on file.' })}
              />
              <div className="flex flex-wrap gap-2">
                {exploreGroup.status && (
                  <span className="text-xs font-bold uppercase bg-gray-100 dark:bg-gray-800 text-sub px-2 py-0.5 rounded">{exploreGroup.status}</span>
                )}
                <PaymentBadge status={exploreGroup.paymentStatus} />
              </div>
              <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                <InfoRow icon={<Users className="w-4 h-4" />} label="Pax" value={`${exploreGroup.pax_count}`} />
                <InfoRow icon={<Hotel className="w-4 h-4" />} label="Hotel" value={exploreGroup.hotel_name || '—'} />
                <InfoRow icon={<Clock className="w-4 h-4" />} label="Pickup" value={exploreGroup.pickup_time || '—'} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Zone" value={exploreGroup.pickup_zone || exploreGroup.meeting_point || '—'} />
              </div>
            </div>
          ) : !selectedGroup ? (
            <div className="p-6 text-sm text-sub flex flex-col items-center gap-3 text-center mt-10">
              <MapPin className="w-8 h-8 opacity-30" />
              {t('kitchen.pickParticipant', { defaultValue: 'Pick a participant to see their group.' })}
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-sub mb-1">{t('kitchen.groupInfo', { defaultValue: 'Group info' })}</div>
                <div className="text-base font-black text-title">#{selectedGroup.id.slice(0, 8)}</div>
                {selectedGroup.status && <span className="mt-1 inline-block text-xs font-bold uppercase bg-gray-100 dark:bg-gray-800 text-sub px-2 py-0.5 rounded">{selectedGroup.status}</span>}
              </div>
              <InfoRow icon={<Users className="w-4 h-4" />} label="Pax" value={`${selectedGroup.pax_count}`} />
              {leader && <InfoRow icon={<Crown className="w-4 h-4 text-amber-500" />} label="Tour leader" value={leader.profile?.full_name || '—'} />}
              <InfoRow icon={<Hotel className="w-4 h-4" />} label="Hotel" value={selectedGroup.hotel_name || '—'} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Pickup" value={selectedGroup.pickup_time || '—'} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Zone" value={selectedGroup.pickup_zone || selectedGroup.meeting_point || '—'} />
              <InfoRow icon={<Globe2 className="w-4 h-4" />} label="Diets" value={summariseDiets(selectedGroup)} />
              <InfoRow icon={<Flame className="w-4 h-4 text-red-500" />} label="Allergies" value={summariseAllergies(selectedGroup) || 'none'} />
            </div>
          )}
        </InspectorShell>
      }
    >
      {/* MULTI-KITCHEN (Fase 4) — errore generazione report */}
      {reportError && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-xs font-bold text-red-700 dark:text-red-400 border-b border-red-100 dark:border-red-900/40">
          {reportError}
        </div>
      )}
      {/* CENTER: participants line-by-line, grouped by booking */}
      {loading ? (
        <div className="p-10 text-sm text-sub">{t('messages.loading', { defaultValue: 'Loading…' })}</div>
      ) : dayGroups.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-3 text-sub">
          <CalendarDays className="w-10 h-10 opacity-40" />
          <p className="text-sm">{t('empty.noParticipants', { defaultValue: 'Select a day & class.' })}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {dayGroups.map(g => (
            <div key={g.id}>
              <div className="px-4 py-2.5 bg-gray-50/70 dark:bg-gray-800/50 flex items-center gap-2 border-y border-gray-100 dark:border-gray-800">
                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-sm font-black text-body truncate">{g.leaderName}</span>
                {g.ownerRole === 'agency' && (
                  <span className="text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded shrink-0">Agency</span>
                )}
                <button
                  onClick={() => { setExploreId(g.id); setSelectedPid(null); }}
                  title={t('kitchen.bookingDetails', { defaultValue: 'Booking details' })}
                  className={cn('p-1 rounded-lg transition-colors shrink-0',
                    exploreId === g.id ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400' : 'text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700')}
                >
                  <Compass className="w-4 h-4" />
                </button>
                <span className="ml-auto flex items-center gap-1 text-xs font-bold text-sub whitespace-nowrap shrink-0">
                  {g.pax_count} pax{g.hotel_name ? ` · ${g.hotel_name}` : ''}{g.pickup_time ? ` · ${g.pickup_time}` : ''}
                </span>
              </div>
              {g.participants.map(p => {
                const active = selectedPid === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPid(p.id); setExploreId(null); }}
                    className={cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors', active ? 'bg-primary-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50')}
                  >
                    <img src={avatarSrc(p)} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-title truncate">{p.profile?.full_name || '—'}</span>
                        {p.is_leader && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        {p.profile?.nationality && <span className="text-xs font-mono text-sub uppercase">{p.profile.nationality}</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                          <Leaf className="w-3 h-3" />{dietLabel(p.menu?.profile || p.profile?.dietary_profile)}
                        </span>
                        {(p.menu?.allergies.length ? p.menu.allergies : p.profile?.allergies || []).slice(0, 3).map((a, i) => (
                          <span key={i} className="inline-flex items-center gap-0.5 text-xs font-bold uppercase bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-2.5 h-2.5" />{a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs shrink-0" title={[p.menu?.curry, p.menu?.soup, p.menu?.stirfry].filter(Boolean).join(' · ')}>
                      <span className={cn('text-base', !p.menu?.curry && 'opacity-20')}>🍛</span>
                      <span className={cn('text-base', !p.menu?.soup && 'opacity-20')}>🥣</span>
                      <span className={cn('text-base', !p.menu?.stirfry && 'opacity-20')}>🥡</span>
                    </div>
                  </button>
                );
              })}
              {Array.from({ length: g.placeholders }).map((_, i) => (
                <div key={`ph-${i}`} className="flex items-center gap-3 px-4 py-3 opacity-50">
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 shrink-0" />
                  <span className="text-xs italic text-sub">{t('kitchen.notRegistered', { defaultValue: 'Seat not registered yet' })}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </DataExplorerLayout>
  );
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-sub mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-black uppercase tracking-widest text-sub">{label}</div>
        <div className="text-sm font-bold text-body break-words">{value}</div>
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: string | null }) {
  const paid = status === 'paid' || status === 'completed' || status === 'succeeded';
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold uppercase px-2 py-0.5 rounded',
      paid ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
           : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400')}>
      <CreditCard className="w-3 h-3" />{paid ? 'Paid' : (status || 'Unpaid')}
    </span>
  );
}

function summariseDiets(g: KitchenGroup): string {
  const counts = new Map<string, number>();
  g.participants.forEach(p => {
    const d = dietLabel(p.menu?.profile || p.profile?.dietary_profile);
    counts.set(d, (counts.get(d) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([d, n]) => `${n}× ${d}`).join(' · ') || '—';
}

function summariseAllergies(g: KitchenGroup): string {
  const set = new Set<string>();
  g.participants.forEach(p => (p.menu?.allergies.length ? p.menu.allergies : p.profile?.allergies || []).forEach(a => set.add(a)));
  return Array.from(set).join(', ');
}

export default KitchenBookings;
