import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table as TableIcon } from 'lucide-react';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';
import { Heading, SectionTitle } from '../typography';

interface DataExplorerContentProps {
    loading?: boolean;
    emptyIcon?: React.ReactNode;
    emptyMessage?: string;
    /**
     * Lo stato vuoto e' esplicito: React.Children.count non lo sa dire, perche'
     * i chiamanti passano `{cond && <div/>}` e un figlio `false` conta 1.
     */
    isEmpty?: boolean;
    children: React.ReactNode;
}

const DataExplorerContent: React.FC<DataExplorerContentProps> = ({
    loading = false,
    emptyIcon,
    emptyMessage,
    isEmpty = false,
    children,
}) => {
    const { t } = useTranslation('dashboard');

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
                <span className="text-xs font-black uppercase tracking-[0.2em] text-sub animate-pulse">
                    {t('explorer.loading')}
                </span>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="max-w-sm w-full bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-10 flex flex-col items-center text-center shadow-xl shadow-gray-100/50 dark:shadow-none animate-in fade-in zoom-in duration-500">
                    <div className="size-20 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 mb-6 drop-shadow-sm">
                        {emptyIcon || <TableIcon size={40} />}
                    </div>
                    <Heading level="h4" className="tracking-tight mb-2 text-body uppercase">
                        {t('explorer.emptyTable')}
                    </Heading>
                    <SectionTitle tone="sub" className="tracking-widest">
                        {emptyMessage || t('explorer.emptyTableHint')}
                    </SectionTitle>
                    <div className="mt-8 size-1.5 rounded-full bg-primary-500 animate-pulse" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default DataExplorerContent;
