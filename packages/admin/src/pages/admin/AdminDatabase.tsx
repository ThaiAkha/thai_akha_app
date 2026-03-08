import React from 'react';
import {
    Plus,
    FileSpreadsheet,
    FileJson,
    Copy,
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import Tooltip from '../../components/ui/Tooltip';
import { Dropdown } from '../../components/ui/dropdown/Dropdown';
import { DropdownItem } from '../../components/ui/dropdown/DropdownItem';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
    DataExplorerInspector,
} from '../../components/data-explorer';
import { PRIMARY_BTN } from '../../components/data-explorer/DataExplorerToolbar';

// Modular Components
import DbSidebar from '../../components/admin/database/DbSidebar';
import DbContent from '../../components/admin/database/DbContent';
import DbInspector from '../../components/admin/database/DbInspector';
import DbInspectorActions from '../../components/admin/database/DbInspectorActions';

// Logic Hook
import { useAdminDatabase } from '../../hooks/useAdminDatabase';

const AdminDatabase: React.FC = () => {
    const { data, ui, inspector } = useAdminDatabase();

    return (
        <>
            <PageMeta
                title="Admin Database Explorer | Thai Akha Kitchen"
                description="Manage raw system tables with safety constraints."
            />

            <DataExplorerLayout
                viewMode={ui.viewMode}
                inspectorOpen={!!inspector.selectedRow}
                onInspectorClose={inspector.closeInspector}
                sidebar={
                    <DbSidebar
                        selectedTable={data.selectedTable}
                        onSelect={ui.setSelectedTable}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        searchValue={ui.searchTerm}
                        onSearchChange={ui.setSearchTerm}
                        searchPlaceholder={`Search ${data.selectedTable}...`}
                        viewMode={ui.viewMode}
                        onViewModeChange={ui.setViewMode}
                        onRefresh={() => data.fetchTableData(data.selectedTable)}
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
                        primaryAction={
                            <Tooltip content="Insert new record" position="bottom">
                                <button
                                    type="button"
                                    onClick={() => inspector.setSelectedRow({})}
                                    className={PRIMARY_BTN}
                                >
                                    <Plus className="w-4 h-4" />
                                    NUOVA RIGA
                                </button>
                            </Tooltip>
                        }
                    />
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={inspector.isEditing}
                        onClose={inspector.closeInspector}
                        headerActions={
                            <DbInspectorActions
                                isEditing={inspector.isEditing}
                                setIsEditing={inspector.setIsEditing}
                                setShowDeleteConfirm={inspector.setShowDeleteConfirm}
                                handleSave={inspector.handleSave}
                                isSaving={inspector.isSaving}
                                selectedRow={inspector.selectedRow}
                            />
                        }
                    >
                        <DbInspector
                            selectedRow={inspector.selectedRow}
                            onRowChange={inspector.setSelectedRow}
                            allColumns={data.allColumns}
                            isEditing={inspector.isEditing}
                            showDeleteConfirm={inspector.showDeleteConfirm}
                            onShowDeleteConfirm={inspector.setShowDeleteConfirm}
                            onDelete={() => {
                                alert("Delete restricted for safety kha.");
                                inspector.setShowDeleteConfirm(false);
                            }}
                        />
                    </DataExplorerInspector>
                }
            >
                <DbContent
                    loading={data.loading}
                    viewMode={ui.viewMode}
                    selectedTable={data.selectedTable}
                    filteredData={data.filteredData}
                    selectedRow={inspector.selectedRow}
                    onRowSelect={inspector.setSelectedRow}
                    columns={data.columns}
                    selectedIds={ui.selectedIds}
                    onToggleSelectAll={ui.toggleSelectAll}
                    onToggleSelectRow={ui.toggleSelectRow}
                />
            </DataExplorerLayout>
        </>
    );
};

export default AdminDatabase;
