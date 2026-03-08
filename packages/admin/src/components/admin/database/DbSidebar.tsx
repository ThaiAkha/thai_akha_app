import React from 'react';
import { Database } from 'lucide-react';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import { SYSTEM_TABLES } from '../../../hooks/useAdminDatabase';
import SectionHeader from '../../ui/SectionHeader';

interface DbSidebarProps {
    selectedTable: string;
    onSelect: (tableId: string) => void;
}

const DbSidebar: React.FC<DbSidebarProps> = ({
    selectedTable,
    onSelect
}) => {
    return (
        <DataExplorerSidebar
            title="Tables"
            titleIcon={<Database className="w-5 h-5" />}
            items={SYSTEM_TABLES}
            selectedId={selectedTable}
            onSelect={onSelect}
            footer={
                <div className="px-2 py-2 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/20">
                    <div className="flex gap-1.5 items-center px-2">
                        <SectionHeader title="Status" variant="sidebar" className="text-amber-600 mb-0 ml-0" />
                        <p className="text-[9px] text-amber-700 dark:text-amber-400 font-bold leading-tight uppercase">
                            Live edits
                        </p>
                    </div>
                </div>
            }
        />
    );
};

export default DbSidebar;
