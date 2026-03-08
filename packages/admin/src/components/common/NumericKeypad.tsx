import React from 'react';
import { cn } from '../../lib/utils';
import { Check, Delete } from 'lucide-react';

interface NumericKeypadProps {
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    onConfirm: () => void;
    className?: string;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
    onKeyPress,
    onDelete,
    onConfirm,
    className
}) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

    return (
        <div className={cn("flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-200 dark:border-gray-700", className)}>
            {/* --- GRID KEYS --- */}
            <div className="grid grid-cols-3 gap-2">
                {keys.map((key) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onKeyPress(key)}
                        className="h-14 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xl font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/80 active:scale-95 transition-all shadow-sm"
                    >
                        {key}
                    </button>
                ))}

                {/* DELETE KEY */}
                <button
                    type="button"
                    onClick={onDelete}
                    className="h-14 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95 transition-all shadow-sm"
                >
                    <Delete className="w-6 h-6" />
                </button>
            </div>

            {/* --- CONFIRM BUTTON --- */}
            <button
                type="button"
                onClick={onConfirm}
                className="w-full h-14 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <Check className="w-5 h-5" />
                Confirm Entry
            </button>
        </div>
    );
};

export default NumericKeypad;
