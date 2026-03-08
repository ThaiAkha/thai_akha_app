import React, { useMemo } from 'react';
import { HardDrive, Folder } from 'lucide-react';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import type { Bucket } from '../../../hooks/useAdminStorage';
import SectionHeader from '../../ui/SectionHeader';

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
    const sidebarItems = useMemo(() => {
        return buckets.map(bucket => ({
            id: bucket.id,
            label: bucket.name,
            icon: <Folder className="w-5 h-5" />,
            badge: bucket.public ? (
                <span className="text-[10px] font-black text-blue-500 border border-blue-200 px-2 py-0.5 rounded-md uppercase bg-blue-50/50">Pub</span>
            ) : undefined,
        }));
    }, [buckets]);

    return (
        <DataExplorerSidebar
            title="Buckets"
            titleIcon={<HardDrive className="w-5 h-5" />}
            items={sidebarItems}
            selectedId={selectedBucket}
            onSelect={onSelect}
            footer={
                <div className="px-2 py-2 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/20">
                    <div className="flex gap-1.5 items-center px-2">
                        <SectionHeader title="Status" variant="sidebar" className="text-blue-600 mb-0 ml-0" />
                        <p className="text-[9px] text-blue-700 dark:text-blue-400 font-bold leading-tight uppercase">
                            Live Storage
                        </p>
                    </div>
                </div>
            }
        />
    );
};

export default StorageSidebar;
