import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HardDrive, Folder } from 'lucide-react';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import type { Bucket } from '../../../hooks/useAdminStorage';
import { SectionTitle } from '../../typography';

interface StorageSidebarProps {
    buckets: Bucket[];
    selectedBucket: string;
    onSelect: (bucketId: string) => void;
}

const StorageSidebar: React.FC<StorageSidebarProps> = ({
    buckets,
    selectedBucket,
    onSelect
}) => {
    const { t } = useTranslation('storage');
    const sidebarItems = useMemo(() => {
        return buckets.map(bucket => ({
            id: bucket.id,
            label: bucket.name,
            icon: <Folder className="w-5 h-5" />,
            badge: bucket.public ? (
                // il fondo del chip deve seguire il tema, altrimenti text-info ci finisce sopra a 1.51
                <span className="text-xs font-black text-info border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 rounded-md uppercase bg-blue-50/50 dark:bg-blue-500/10">Pub</span>
            ) : undefined,
        }));
    }, [buckets]);

    return (
        <DataExplorerSidebar
            title={t('sidebar.title')}
            titleIcon={<HardDrive className="w-5 h-5" />}
            items={sidebarItems}
            selectedId={selectedBucket}
            onSelect={onSelect}
            footer={
                <div className="px-2 py-2 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/20">
                    <div className="flex gap-1.5 items-center px-2">
                        <SectionTitle as="h6" tone="sub" className="text-info mb-0 ml-0">{t('sidebar.statusLabel')}</SectionTitle>
                        <SectionTitle className="text-info">
                            {t('sidebar.status')}
                        </SectionTitle>
                    </div>
                </div>
            }
        />
    );
};

export default StorageSidebar;
