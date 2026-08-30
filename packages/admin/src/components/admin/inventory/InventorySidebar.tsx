import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Package } from 'lucide-react';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import type { Category } from '../../../hooks/useAdminInventory';
import SectionHeader from '../../ui/SectionHeader';
import { SectionTitle } from '../../typography';

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
    const { t } = useTranslation('inventory');
    const sidebarItems = useMemo(() => {
        return [
            { id: 'all', label: t('sidebar.allItems'), icon: <ShoppingBag className="w-5 h-5" /> },
            ...categories.map(cat => ({
                id: cat.id,
                label: cat.title,
                icon: <Package className="w-5 h-5" />
            }))
        ];
    }, [categories, t]);

    return (
        <DataExplorerSidebar
            title={t('sidebar.title')}
            titleIcon={<Package className="w-5 h-5" />}
            items={sidebarItems}
            selectedId={selectedCategoryId}
            onSelect={onSelect}
            footer={
                <div className="px-2 py-2 bg-green-50 dark:bg-green-900/10 border-t border-green-100 dark:border-green-900/20">
                    <div className="flex gap-1.5 items-center px-2">
                        <SectionHeader title={t('inspector.statusLabel')} variant="sidebar" className="text-success mb-0 ml-0" />
                        <SectionTitle className="text-success">
                            Live Inventory
                        </SectionTitle>
                    </div>
                </div>
            }
        />
    );
};

export default InventorySidebar;
