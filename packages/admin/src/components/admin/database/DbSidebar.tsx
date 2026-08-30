import React from 'react';
import { useTranslation } from 'react-i18next';
import { Database } from 'lucide-react';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import { SYSTEM_TABLES } from '../../../hooks/useAdminDatabase';
import SectionHeader from '../../ui/SectionHeader';
import { SectionTitle } from '../../typography';

interface DbSidebarProps {
    selectedTable: string;
    onSelect: (tableId: string) => void;
}

const DbSidebar: React.FC<DbSidebarProps> = ({
    selectedTable,
    onSelect
}) => {
    const { t } = useTranslation('database');
    return (
        <DataExplorerSidebar
            title={t('sidebar.title')}
            titleIcon={<Database className="w-5 h-5" />}
            items={SYSTEM_TABLES}
            selectedId={selectedTable}
            onSelect={onSelect}
            footer={
                <div className="px-2 py-2 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/20">
                    <div className="flex gap-1.5 items-center px-2">
                        <SectionHeader title={t('sidebar.statusLabel')} variant="sidebar" className="text-warning mb-0 ml-0" />
                        <SectionTitle className="text-warning">
                            {t('sidebar.status')}
                        </SectionTitle>
                    </div>
                </div>
            }
        />
    );
};

export default DbSidebar;
