import React from 'react';
import { Table as TableIcon } from 'lucide-react';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';

interface DataExplorerContentProps {
    loading?: boolean;
    emptyIcon?: React.ReactNode;
    emptyMessage?: string;
    children: React.ReactNode;
}

const DataExplorerContent: React.FC<DataExplorerContentProps> = ({
    loading = false,
    emptyIcon,
    children,
}) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <AkhaPixelPattern
                    variant="logo"
                    size={6}
                    speed={60}
                    loop={true}
                    loopDelay={500}
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-pulse">
                    Accedi ai dati...
                </span>
            </div>
        );
    }

    // Check if children is empty (for React.Children.count)
    const childCount = React.Children.count(children);
    if (childCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="max-w-sm w-full bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-10 flex flex-col items-center text-center shadow-xl shadow-gray-100/50 dark:shadow-none animate-in fade-in zoom-in duration-500">
                    <div className="size-20 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 mb-6 drop-shadow-sm">
                        {emptyIcon || <TableIcon size={40} />}
                    </div>
                    <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight mb-2">
                        Tabella vuota
                    </h3>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
                        Inserire primo contenuto per iniziare
                    </p>
                    <div className="mt-8 size-1.5 rounded-full bg-brand-500 animate-pulse" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default DataExplorerContent;
