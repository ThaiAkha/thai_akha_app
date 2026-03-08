import React, { useMemo } from 'react';
import { ShoppingBag, Package } from 'lucide-react';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import type { Category } from '../../../hooks/useAdminInventory';
import SectionHeader from '../../ui/SectionHeader';

interface InventorySidebarProps {
    categories: Category[];
    selectedCategoryId: string;
    onSelect: (categoryId: string) => void;
}

const InventorySidebar: React.FC<InventorySidebarProps> = ({
    categories,
    selectedCategoryId,
    onSelect
}) => {
    const sidebarItems = useMemo(() => {
        return [
            { id: 'all', label: 'All Items', icon: <ShoppingBag className="w-5 h-5" /> },
            ...categories.map(cat => ({
                id: cat.id,
                label: cat.title,
                icon: <Package className="w-5 h-5" />
            }))
        ];
    }, [categories]);

    return (
        <DataExplorerSidebar
            title="Categories"
            titleIcon={<Package className="w-5 h-5" />}
            items={sidebarItems}
            selectedId={selectedCategoryId}
            onSelect={onSelect}
            footer={
                <div className="px-2 py-2 bg-green-50 dark:bg-green-900/10 border-t border-green-100 dark:border-green-900/20">
                    <div className="flex gap-1.5 items-center px-2">
                        <SectionHeader title="Status" variant="sidebar" className="text-green-600 mb-0 ml-0" />
                        <p className="text-[9px] text-green-700 dark:text-green-400 font-bold leading-tight uppercase">
                            Live Inventory
                        </p>
                    </div>
                </div>
            }
        />
    );
};

export default InventorySidebar;
