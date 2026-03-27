import { Lock, Edit2, Minus, Plus } from 'lucide-react';
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
    updateEditState: (sid: string, field: keyof EditSessionState, value: any) => void;
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
    const noData = isBulkMode ? (selectedDates.size === 0) : (!selectedDate || !availability[selectedDate!]);

    if (noData) {
        return (
            <Card className="hidden lg:flex lg:col-span-3 flex-col h-full items-center justify-center text-center text-gray-400 dark:text-gray-500">
                <Lock className="w-10 h-10 mb-6 opacity-30" />
                <p className="text-xs font-black uppercase tracking-widest max-w-[160px]">{isBulkMode ? 'Select days for Bulk Edit' : 'Select a date to start'}</p>
            </Card>
        );
    }

    const dayData = !isBulkMode ? availability[selectedDate!] : null;

    return (
        <Card className="hidden lg:flex lg:col-span-3 flex-col h-full overflow-hidden !p-0">
            <div className="flex flex-col h-full overflow-hidden p-6 gap-6">
                <div className="shrink-0">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                        {isBulkMode ? `${selectedDates.size} Days` : new Date(selectedDate!).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 mt-1 uppercase font-black tracking-widest">
                        {isBulkMode ? `Bulk Update: ${bulkSessionType === 'all' ? 'All Day' : (bulkSessionType === 'morning_class' ? 'Morning Only' : 'Evening Only')}` : (isEditing ? 'Editing Day' : 'Quick Preview')}
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
                                                <span className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white">{s === 'morning_class' ? 'Morning Class' : 'Evening Class'}</span>
                                            </div>
                                            <Badge color={sess.status === 'CLOSED' ? 'error' : 'success'} className="font-black text-sm uppercase">{sess.status}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl">
                                                <p className="text-sm font-black uppercase text-gray-500 dark:text-gray-400 mb-1">Booked</p>
                                                <span className="text-xl font-black text-gray-900 dark:text-white">{Math.max(0, safeCapacity - safeSeats)}</span>
                                            </div>
                                            <div className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl">
                                                <p className="text-sm font-black uppercase text-gray-500 dark:text-gray-400 mb-1">Available</p>
                                                <span className="text-xl font-black text-primary-600 dark:text-primary-400">{safeSeats}</span>
                                            </div>
                                        </div>
                                        {sess.status === 'CLOSED' && <div className="mt-3 p-3 bg-red-50/50 dark:bg-red-900/20 rounded-xl text-sm font-bold text-red-600 dark:text-red-300 border border-red-100 dark:border-red-900">{sess.reason || 'Class Close'}</div>}
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
                                    EDIT AVAILABILITY
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
                                                <span className="font-black text-sm uppercase tracking-widest flex items-center gap-2 text-gray-900 dark:text-white">{s === 'all' ? 'All Classes' : (s === 'morning_class' ? 'Morning' : 'Evening')} Session</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-400">Force Close</span>
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
                                                    <SectionHeader title="Closing Reason" variant="inspector" className="mb-2 capitalize" />
                                                    <input
                                                        type="text"
                                                        value={sess.reason}
                                                        onChange={(e) => {
                                                            updateEditState(key, 'reason', e.target.value);
                                                            if (s === 'all') updateEditState('evening_class', 'reason', e.target.value);
                                                        }}
                                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-500"
                                                        placeholder="Example: Private Event"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="animate-in fade-in slide-in-from-top-2">
                                                    <SectionHeader title={isBulkMode ? "Add/Remove Spots" : "Available Seats"} variant="inspector" className="mb-2 capitalize" />
                                                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-1.5 shadow-sm">
                                                        <button
                                                            onClick={() => {
                                                                const v = safeSeats - 1;
                                                                updateEditState(key, 'seats', v);
                                                                if (s === 'all') updateEditState('evening_class', 'seats', v);
                                                            }}
                                                            className="size-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 font-black text-gray-900 dark:text-white"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-lg font-black text-gray-900 dark:text-white">{isBulkMode && safeSeats > 0 ? `+${safeSeats}` : safeSeats}</span>
                                                        <button
                                                            onClick={() => {
                                                                const v = safeSeats + 1;
                                                                updateEditState(key, 'seats', v);
                                                                if (s === 'all') updateEditState('evening_class', 'seats', v);
                                                            }}
                                                            className="size-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 font-black text-gray-900 dark:text-white"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="mt-2 text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-center">
                                                        {isBulkMode ? "The modification will add/subtract spots to the current capacity" : `Total Capacity: ${safeSeats + safeOccupied}`}
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
                                    {isBulkMode ? `SAVE ${selectedDates.size} DAYS` : "SAVE CHANGES"}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full py-4 text-sm font-black uppercase tracking-widest text-gray-800"
                                    onClick={onCancel}
                                >
                                    CANCEL
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
