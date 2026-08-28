import { Lock, Edit2, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateByLanguage } from '../../../lib/dateFormatter';
import SectionHeader from '../../ui/SectionHeader';
import { cn } from '@thaiakha/shared/lib/utils';
import Button from '../../../components/ui/button/Button';
import Badge from '../../../components/ui/badge/Badge';
import Card from '../../ui/Card';
import { DayData, EditSessionState, BulkSessionType } from '../../../hooks/useAdminCalendar';
import { getSessionCapacity } from '@thaiakha/shared/lib/sessionUtils';

interface CalendarInspectorProps {
    isBulkMode: boolean;
    selectedDate: string | null;
    selectedDates: Set<string>;
    availability: Record<string, DayData>;
    isEditing: boolean;
    setIsEditing: (v: boolean) => void;
    bulkSessionType: BulkSessionType;
    editState: Record<string, EditSessionState>;
    updateEditState: (sid: string, field: keyof EditSessionState, value: string | number | boolean) => void;
    onSave: () => void;
    onCancel: () => void;
}

const CalendarInspector: React.FC<CalendarInspectorProps> = ({
    isBulkMode,
    selectedDate,
    selectedDates,
    availability,
    isEditing,
    setIsEditing,
    bulkSessionType,
    editState,
    updateEditState,
    onSave,
    onCancel
}) => {
    const { t, i18n } = useTranslation('calendar');
    const noData = isBulkMode ? (selectedDates.size === 0) : (!selectedDate || !availability[selectedDate!]);

    if (noData) {
        return (
            <Card className="hidden lg:flex lg:col-span-3 flex-col h-full items-center justify-center text-center text-sub">
                <Lock className="w-10 h-10 mb-6 opacity-30" />
                <p className="text-xs font-black uppercase tracking-widest max-w-[160px]">{isBulkMode ? t('inspector.emptyBulk') : t('inspector.emptySelect')}</p>
            </Card>
        );
    }

    const dayData = !isBulkMode ? availability[selectedDate!] : null;

    return (
        <Card className="hidden lg:flex lg:col-span-3 flex-col h-full overflow-hidden !p-0">
            <div className="flex flex-col h-full overflow-hidden p-6 gap-6">
                <div className="shrink-0">
                    <h3 className="text-xl font-black text-title leading-tight">
                        {isBulkMode ? t('inspector.bulkDays', { count: selectedDates.size }) : formatDateByLanguage(selectedDate!, i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 mt-1 uppercase font-black tracking-widest">
                        {isBulkMode
                            ? (bulkSessionType === 'all' ? t('inspector.bulkUpdateAll') : bulkSessionType === 'morning_class' ? t('inspector.bulkUpdateMorning') : t('inspector.bulkUpdateEvening'))
                            : (isEditing ? t('inspector.editingDay') : t('inspector.quickPreview'))}
                    </p>
                </div>
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
                    {!isEditing && !isBulkMode ? (
                        <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                            {['morning_class', 'evening_class'].map(s => {
                                const sess = dayData?.[s as 'morning_class' | 'evening_class'];
                                if (!sess) return null;
                                const safeCapacity = getSessionCapacity(sess.capacity) ?? 0;
                                const safeSeats = typeof sess.seats === 'number' && !isNaN(sess.seats) ? sess.seats : 0;
                                return (
                                    <div key={s} className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("size-2 rounded-full", sess.status === 'CLOSED' ? "bg-red-500" : "bg-green-500")} />
                                                <span className="font-black text-sm uppercase tracking-widest text-title">{s === 'morning_class' ? t('inspector.morningClass') : t('inspector.eveningClass')}</span>
                                            </div>
                                            <Badge color={sess.status === 'CLOSED' ? 'error' : 'success'} className="font-black text-sm uppercase">{sess.status}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl">
                                                <p className="text-sm font-black uppercase text-sub mb-1">{t('inspector.booked')}</p>
                                                <span className="text-xl font-black text-title">{Math.max(0, safeCapacity - safeSeats)}</span>
                                            </div>
                                            <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl">
                                                <p className="text-sm font-black uppercase text-sub mb-1">{t('inspector.available')}</p>
                                                <span className="text-xl font-black text-primary-600 dark:text-primary-400">{safeSeats}</span>
                                            </div>
                                        </div>
                                        {sess.status === 'CLOSED' && <div className="mt-3 p-3 bg-red-50/50 dark:bg-red-900/20 rounded-xl text-sm font-bold text-red-600 dark:text-red-300 border border-red-100 dark:border-red-900">{sess.reason || t('inspector.classClose')}</div>}
                                    </div>
                                );
                            })}
                            <div>
                                <Button
                                    variant="primary"
                                    className="w-full py-4 text-sm font-black tracking-widest uppercase"
                                    onClick={() => setIsEditing(true)}
                                    startIcon={<Edit2 className="w-4 h-4" />}
                                >
                                    {t('inspector.editAvailability')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-left-4 pb-10">
                            {(() => {
                                const sessions = isBulkMode ? (bulkSessionType === 'all' ? ['all'] : [bulkSessionType]) : ['morning_class', 'evening_class'];
                                return sessions.map(s => {
                                    const key = (s === 'all' && isBulkMode) ? 'morning_class' : s as string;
                                    const sess = editState[key];
                                    const safeSeats = typeof sess.seats === 'number' && !isNaN(sess.seats) ? sess.seats : 0;
                                    const safeOccupied = typeof sess.occupied === 'number' && !isNaN(sess.occupied) ? sess.occupied : 0;
                                    return (
                                        <div key={s} className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/30 dark:bg-gray-800/30">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-black text-sm uppercase tracking-widest flex items-center gap-2 text-title">{s === 'all' ? t('inspector.allClasses') : (s === 'morning_class' ? t('bulk.morning') : t('bulk.evening'))} {t('inspector.session')}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black uppercase text-sub">{t('inspector.forceClose')}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={sess.isClosed}
                                                        onChange={(e) => {
                                                            updateEditState(key, 'isClosed', e.target.checked);
                                                            if (s === 'all') updateEditState('evening_class', 'isClosed', e.target.checked);
                                                        }}
                                                        className="size-4 rounded text-primary-600 dark:bg-gray-800 dark:border-gray-700"
                                                    />
                                                </div>
                                            </div>
                                            {sess.isClosed ? (
                                                <div className="animate-in fade-in slide-in-from-top-2">
                                                    <SectionHeader title={t('inspector.closingReason')} variant="inspector" className="mb-2 capitalize" />
                                                    <input
                                                        type="text"
                                                        value={sess.reason}
                                                        onChange={(e) => {
                                                            updateEditState(key, 'reason', e.target.value);
                                                            if (s === 'all') updateEditState('evening_class', 'reason', e.target.value);
                                                        }}
                                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm text-body bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-500"
                                                        placeholder={t('inspector.reasonPlaceholder')}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="animate-in fade-in slide-in-from-top-2">
                                                    <SectionHeader title={isBulkMode ? t('inspector.addRemoveSpots') : t('inspector.availableSeats')} variant="inspector" className="mb-2 capitalize" />
                                                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-1.5 shadow-sm">
                                                        <button
                                                            onClick={() => {
                                                                const v = safeSeats - 1;
                                                                updateEditState(key, 'seats', v);
                                                                if (s === 'all') updateEditState('evening_class', 'seats', v);
                                                            }}
                                                            className="size-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 font-black text-title"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-lg font-black text-title">{isBulkMode && safeSeats > 0 ? `+${safeSeats}` : safeSeats}</span>
                                                        <button
                                                            onClick={() => {
                                                                const v = safeSeats + 1;
                                                                updateEditState(key, 'seats', v);
                                                                if (s === 'all') updateEditState('evening_class', 'seats', v);
                                                            }}
                                                            className="size-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 font-black text-title"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="mt-2 text-sm font-bold text-sub uppercase tracking-widest text-center">
                                                        {isBulkMode ? t('inspector.bulkModHint') : t('inspector.totalCapacity', { count: safeSeats + safeOccupied })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                            <div className="space-y-4 pt-6 sticky bottom-0 bg-white dark:bg-gray-900 z-30 border-t border-gray-100 dark:border-gray-800">
                                <Button
                                    variant="primary"
                                    className="w-full py-4 text-sm font-black tracking-widest uppercase"
                                    onClick={onSave}
                                    disabled={isBulkMode && selectedDates.size === 0}
                                >
                                    {isBulkMode ? t('inspector.saveDays', { count: selectedDates.size }) : t('inspector.saveChanges')}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full py-4 text-sm font-black uppercase tracking-widest text-body"
                                    onClick={onCancel}
                                >
                                    {t('inspector.cancel')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default CalendarInspector;
