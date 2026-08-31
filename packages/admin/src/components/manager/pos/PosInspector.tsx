import { useTranslation } from 'react-i18next';
import Button from '../../ui/button/Button';
import { InspectorShell, InspectorHeader, InspectorBody, InspectorEmpty, InspectorFooter } from '../../ui/inspector/InspectorShell';
import { InspectorLeader } from '../../ui/inspector';
import LeaderHeader from '../../common/LeaderHeader';
import { ReportLineRow, ReportLineMedia } from '../../reports';
import { Search, Receipt, CreditCard, GraduationCap, Banknote } from 'lucide-react';
import { Guest, OrderItem, ClassFeeItem } from '../../../hooks/useManagerPos';

interface PosInspectorProps {
    activeGuest: Guest | null;
    activeGuestId: string | null;
    currentTab: OrderItem[];
    classFee: ClassFeeItem | null;
    totalDue: number;
    isProcessing: boolean;
    onRemoveItem: (item: OrderItem) => void;
    onSave: () => void;
    onPayCash: () => void;
    /** Optional: only the manager settles (canSettle). Kitchen is save-only. */
    onPayCard?: () => void;
    onClose: () => void;
    /** When false (kitchen/teacher), hide payment — the user can only save the order. */
    canSettle?: boolean;
}

const PosInspector: React.FC<PosInspectorProps> = ({
    activeGuest,
    activeGuestId,
    currentTab,
    classFee,
    totalDue,
    isProcessing,
    onRemoveItem,
    onSave,
    onPayCash,
    onPayCard,
    onClose,
    canSettle = true,
}) => {
    const { t } = useTranslation('pos');

    return (
        <InspectorShell>
            {/* Standard planner: header = LeaderHeader ovunque. L'InspectorHeader resta per
                il contesto (sessione + data) e il close; la PERSONA sta nel blocco leader,
                con avatar e pax come in Logistic, Reservation e Kitchen. */}
            <InspectorHeader
                subtitle={activeGuest ? new Date(activeGuest.booking_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : undefined}
                title={activeGuest?.session_name || t('inspector.selectGuest')}
                onClose={activeGuestId ? onClose : undefined}
            />
            {activeGuest && (
                <InspectorLeader className="p-4 pb-0">
                    <LeaderHeader
                        label={t('inspector.customerName')}
                        leader={{ name: activeGuest.full_name, pax: activeGuest.pax_count }}
                    />
                </InspectorLeader>
            )}

            <InspectorBody className="p-4 space-y-3">
                {!activeGuestId ? (
                    <InspectorEmpty icon={<Search className="w-8 h-8" />} hint={t('inspector.emptySelectHint')} />
                ) : currentTab.length === 0 && !classFee ? (
                    <InspectorEmpty icon={<Receipt className="w-8 h-8" />} hint={t('inspector.emptyTab')} />
                ) : (
                    <>
                        {/* CLASS FEE LINE — Pay on Arrival unpaid */}
                        {classFee && (
                            <ReportLineRow
                                density="sm"
                                leading={<ReportLineMedia tone="amber" icon={<GraduationCap className="w-4 h-4" />} />}
                                title={classFee.name}
                                subtitle={t('inspector.payOnArrival')}
                                amount={(classFee.price * classFee.quantity).toLocaleString()}
                            />
                        )}

                        {/* SHOP ITEMS */}
                        {currentTab.map((item, idx) => (
                            <ReportLineRow
                                key={idx}
                                density="sm"
                                leading={<ReportLineMedia tone={item.status === 'new' ? 'primary' : 'gray'} badge={item.quantity} />}
                                title={item.name}
                                amount={(item.price * item.quantity).toLocaleString()}
                                onDelete={item.status !== 'paid' ? () => onRemoveItem(item) : undefined}
                                confirmDelete={{
                                    title: t('inspector.removeItemTitle', { defaultValue: 'Remove item?' }),
                                    message: t('inspector.removeItemMsg', { defaultValue: 'Remove "{{name}}" from this order?', name: item.name }),
                                    confirmLabel: t('inspector.remove', { defaultValue: 'Remove' }),
                                }}
                            />
                        ))}
                    </>
                )}
            </InspectorBody>

            <InspectorFooter>
                <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-sub uppercase tracking-widest">{t('inspector.totalAmount')}</span>
                    <span className="text-xl font-mono font-black text-title">{totalDue.toLocaleString()} <span className="text-xs text-sub font-normal">THB</span></span>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        variant={canSettle ? 'outline' : 'primary'}
                        onClick={onSave}
                        disabled={isProcessing || !activeGuestId || currentTab.filter(i => i.status === 'new').length === 0}
                        className="w-full justify-center"
                    >
                        {t('inspector.saveTab')}
                    </Button>
                    {canSettle && (
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="primary"
                                startIcon={<Banknote className="w-4 h-4" />}
                                onClick={onPayCash}
                                disabled={isProcessing || totalDue === 0}
                                className="w-full justify-center bg-green-600 hover:bg-green-700 text-white ring-0"
                            >
                                {t('inspector.payCash', { defaultValue: 'Cash' })}
                            </Button>
                            <Button
                                variant="primary"
                                startIcon={<CreditCard className="w-4 h-4" />}
                                onClick={onPayCard}
                                disabled={isProcessing || totalDue === 0}
                                className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white ring-0"
                            >
                                {t('inspector.payCard', { defaultValue: 'Card' })}
                            </Button>
                        </div>
                    )}
                </div>
            </InspectorFooter>
        </InspectorShell>
    );
};

export default PosInspector;
