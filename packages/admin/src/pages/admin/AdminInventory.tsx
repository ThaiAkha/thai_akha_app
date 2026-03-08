import React from 'react';
import {
    Plus,
    FileSpreadsheet,
    FileJson,
    Copy,
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import { PRIMARY_BTN } from '../../components/data-explorer/DataExplorerToolbar';
import { Dropdown } from '../../components/ui/dropdown/Dropdown';
import { DropdownItem } from '../../components/ui/dropdown/DropdownItem';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
    DataExplorerInspector,
} from '../../components/data-explorer';

// Modular Components
import InventorySidebar from '../../components/admin/inventory/InventorySidebar';
import InventoryContent from '../../components/admin/inventory/InventoryContent';
import InventoryInspector from '../../components/admin/inventory/InventoryInspector';
import InventoryInspectorActions from '../../components/admin/inventory/InventoryInspectorActions';

// Logic Hook
import { useAdminInventory } from '../../hooks/useAdminInventory';

const AdminInventory: React.FC = () => {
    const { data, ui, inspector } = useAdminInventory();

    return (
        <>
            <PageMeta
                title="Inventory | Admin"
                description="Manage product catalog, stock levels, and pricing."
            />

            <DataExplorerLayout
                viewMode={ui.viewMode}
                inspectorOpen={inspector.isInspectorOpen}
                onInspectorClose={inspector.closeInspector}
                sidebar={
                    <InventorySidebar
                        categories={data.categories}
                        selectedCategoryId={ui.selectedCategoryId}
                        onSelect={ui.setSelectedCategoryId}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        primaryAction={
                            <button type="button" onClick={inspector.handleCreateNew} className={PRIMARY_BTN}>
                                <Plus className="w-4 h-4" />
                                NUOVO
                            </button>
                        }
                        searchPlaceholder="Search products or SKU..."
                        searchValue={ui.searchTerm}
                        onSearchChange={ui.setSearchTerm}
                        viewMode={ui.viewMode}
                        onViewModeChange={ui.setViewMode}
                        onRefresh={data.fetchData}
                        isRefreshing={data.loading}
                        onExportClick={() => ui.setIsExportOpen(!ui.isExportOpen)}
                        exportDropdown={
                            <Dropdown isOpen={ui.isExportOpen} onClose={() => ui.setIsExportOpen(false)} className="w-56 mt-2 left-0 shadow-2xl border-brand-100 dark:border-brand-500/20">
                                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Export formats</p>
                                </div>
                                <DropdownItem onClick={ui.exportToCSV} className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Google Sheets / CSV</p>
                                        <p className="text-[10px] text-gray-400">Standard spreadsheet format</p>
                                    </div>
                                </DropdownItem>
                                <DropdownItem onClick={ui.exportToJSON} className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                                    <FileJson className="w-4 h-4 text-blue-600" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">JSON Format</p>
                                        <p className="text-[10px] text-gray-400">Raw data structure</p>
                                    </div>
                                </DropdownItem>
                                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                                <DropdownItem onClick={ui.copyToClipboard} className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                                    <Copy className="w-4 h-4 text-brand-600" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Copy to Clipboard</p>
                                        <p className="text-[10px] text-gray-400">Quick share as text</p>
                                    </div>
                                </DropdownItem>
                            </Dropdown>
                        }
                    />
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={inspector.isEditing}
                        onClose={inspector.closeInspector}
                        headerActions={
                            <InventoryInspectorActions
                                isNew={inspector.isNew}
                                isEditing={inspector.isEditing}
                                setIsEditing={inspector.setIsEditing}
                                handleSave={inspector.handleSave}
                                isSaving={inspector.isSaving}
                                editingProduct={inspector.editingProduct}
                            />
                        }
                    >
                        <InventoryInspector
                            editingProduct={inspector.editingProduct}
                            onEditingProductChange={inspector.setEditingProduct}
                            categories={data.categories}
                            isEditing={inspector.isEditing}
                            isNew={inspector.isNew}
                            onDelete={inspector.handleDelete}
                        />
                    </DataExplorerInspector>
                }
            >
                <InventoryContent
                    loading={data.loading && data.filteredProducts.length === 0}
                    viewMode={ui.viewMode}
                    filteredProducts={data.filteredProducts}
                    editingProduct={inspector.editingProduct}
                    onProductSelect={inspector.handleProductSelect}
                    selectedIds={ui.selectedIds}
                    onToggleSelectAll={ui.toggleSelectAll}
                    onToggleSelectRow={ui.toggleSelectRow}
                />
            </DataExplorerLayout>
        </>
    );
};

export default AdminInventory;
