import React from 'react';
import { Rss } from 'lucide-react';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import { NEWS_TABLES } from '../../../hooks/useAdminNews';
import SectionHeader from '../../ui/SectionHeader';

interface NewsSidebarProps {
    selectedTable: string;
    onSelect: (tableId: string) => void;
}

const NewsSidebar: React.FC<NewsSidebarProps> = ({ selectedTable, onSelect }) => {
    return (
        <DataExplorerSidebar
            title="Content"
            titleIcon={<Rss className="w-5 h-5" />}
            items={NEWS_TABLES}
            selectedId={selectedTable}
            onSelect={onSelect}
            footer={
                <div className="px-2 py-2 bg-lime-50 dark:bg-lime-900/10 border-t border-lime-100 dark:border-lime-900/20">
                    <div className="flex gap-1.5 items-center px-2">
                        <SectionHeader title="Status" variant="sidebar" className="text-lime-600 mb-0 ml-0" />
                        <p className="text-[9px] text-lime-700 dark:text-lime-400 font-bold leading-tight uppercase">
                            Live edits
                        </p>
                    </div>
                </div>
            }
        />
    );
};

export default NewsSidebar;
