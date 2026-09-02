import React from 'react';
import { useTranslation } from 'react-i18next';
import { Rss } from 'lucide-react';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import { NEWS_TABLES } from '../../../hooks/useAdminNews';
import { SectionTitle } from '../../typography';

interface NewsSidebarProps {
    selectedTable: string;
    onSelect: (tableId: string) => void;
}

const NewsSidebar: React.FC<NewsSidebarProps> = ({ selectedTable, onSelect }) => {
    const { t } = useTranslation('pages');
    return (
        <DataExplorerSidebar
            title={t('news.sectionContent')}
            titleIcon={<Rss className="w-5 h-5" />}
            items={NEWS_TABLES}
            selectedId={selectedTable}
            onSelect={onSelect}
            footer={
                <div className="px-2 py-2 bg-lime-50 dark:bg-lime-900/10 border-t border-lime-100 dark:border-lime-900/20">
                    <div className="flex gap-1.5 items-center px-2">
                        <SectionTitle as="h6" tone="sub" className="text-lime-600 mb-0 ml-0">{t('news.sectionStatus')}</SectionTitle>
                        <SectionTitle className="text-lime-700 dark:text-lime-400">
                            Live edits
                        </SectionTitle>
                    </div>
                </div>
            }
        />
    );
};

export default NewsSidebar;
