import Button from '../../ui/button/Button';
import { cn } from '../../../lib/utils';
import { Search, Receipt, Trash2, CreditCard, X } from 'lucide-react';
import { Guest, OrderItem } from '../../../hooks/useManagerPos';

interface PosInspectorProps {
    activeGuest: Guest | null;
    activeGuestId: string | null;
    currentTab: OrderItem[];
    totalDue: number;
    isProcessing: boolean;
    onRemoveItem: (item: OrderItem) => void;
    onSave: () => void;
    onPayCash: () => void;
    onClose: () => void;
}

const PosInspector: React.FC<PosInspectorProps> = ({
    activeGuest,
    activeGuestId,
    currentTab,
    totalDue,
    isProcessing,
    onRemoveItem,
    onSave,
    onPayCash,
    onClose,
}) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                <div className="flex flex-col">
                    <h6 className="tracking-widest text-xs font-bold text-gray-500">Customer Name</h6>
                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{activeGuest?.full_name || "Select Guest"}</span>
                </div>
                {activeGuestId && (
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {!activeGuestId ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-2">
                        <Search className="w-8 h-8" />
                        <span className="text-xs font-medium">Select a guest first</span>
                    </div>
                ) : currentTab.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-2">
                        <Receipt className="w-8 h-8" />
                        <span className="text-xs font-medium">Empty Tab</span>
                    </div>
                ) : (
                    currentTab.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center group animate-in slide-in-from-right-2 fade-in duration-300">
                            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 flex justify-between items-center border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={cn(
                                        "size-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                                        item.status === 'new' ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"
                                    )}>
                                        {item.quantity}
                                    </div>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</span>
                                </div>
                                <span className="text-xs font-mono text-gray-500 ml-2">{item.price * item.quantity}</span>
                            </div>
                            {item.status !== 'paid' && (
                                <button
                                    onClick={() => onRemoveItem(item)}
                                    className="size-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
                    <span className="text-xl font-mono font-black text-gray-900 dark:text-white">{totalDue.toLocaleString()} <span className="text-xs text-gray-400 font-normal">THB</span></span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        onClick={onSave}
                        disabled={isProcessing || !activeGuestId || currentTab.filter(i => i.status === 'new').length === 0}
                        className="w-full justify-center"
                    >
                        Save Tab
                    </Button>
                    <Button
                        variant="primary"
                        startIcon={<CreditCard className="w-4 h-4" />}
                        onClick={onPayCash}
                        disabled={isProcessing || totalDue === 0}
                        className="w-full justify-center bg-green-600 hover:bg-green-700 text-white ring-0"
                    >
                        Pay Cash
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PosInspector;
