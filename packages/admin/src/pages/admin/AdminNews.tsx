import React from 'react';
import { Plus, FileSpreadsheet, FileJson, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

// News-specific modular components
import NewsSidebar from '../../components/admin/news/NewsSidebar';
import NewsContent from '../../components/admin/news/NewsContent';
import NewsInspector from '../../components/admin/news/NewsInspector';
import DbInspectorActions from '../../components/admin/database/DbInspectorActions';

// Logic Hook
import { useAdminNews } from '../../hooks/useAdminNews';

const AdminNews: React.FC = () => {
    const { t } = useTranslation('database');
    const { data, ui, inspector } = useAdminNews();

    return (
        <>
            <PageMeta
                title="News & Content"
                description="Manage Akha news, culture sections, ethnic groups and page sections"
            />

            <DataExplorerLayout
                viewMode={ui.viewMode}
                inspectorOpen={!!inspector.selectedRow}
                onInspectorClose={inspector.closeInspector}
                inspectorSize="wide"
                sidebar={
                    <NewsSidebar
                        selectedTable={data.selectedTable}
                        onSelect={ui.setSelectedTable}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        searchValue={ui.searchTerm}
                        onSearchChange={ui.setSearchTerm}
                        searchPlaceholder={`Search in ${data.selectedTable}...`}
                        viewMode={ui.viewMode}
                        onViewModeChange={ui.setViewMode}
                        onRefresh={() => data.fetchTableData(data.selectedTable)}
                        isRefreshing={data.loading}
                        onExportClick={() => ui.setIsExportOpen(!ui.isExportOpen)}
                        exportDropdown={
                            <Dropdown isOpen={ui.isExportOpen} onClose={() => ui.setIsExportOpen(false)} className="w-56 mt-2 left-0 shadow-2xl border-primary-100 dark:border-primary-500/20">
                                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('actions.exportFormats')}</p>
                                </div>
                                <DropdownItem onClick={ui.exportToCSV} className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{t('actions.exportCsv')}</p>
                                        <p className="text-[10px] text-gray-400">{t('actions.exportCsvDesc')}</p>
                                    </div>
                                </DropdownItem>
                                <DropdownItem onClick={ui.exportToJSON} className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">
                                    <FileJson className="w-4 h-4 text-blue-600" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{t('actions.exportJson')}</p>
                                        <p className="text-[10px] text-gray-400">{t('actions.exportJsonDesc')}</p>
                                    </div>
                                </DropdownItem>
                                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                                <DropdownItem onClick={ui.copyToClipboard} className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">
                                    <Copy className="w-4 h-4 text-primary-600" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{t('actions.copyClipboard')}</p>
                                        <p className="text-[10px] text-gray-400">{t('actions.copyClipboardDesc')}</p>
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
                                    New Row
                                </button>
                            </Tooltip>
                        }
                    />
                }
                inspector={
                    <DataExplorerInspector
                        title={data.selectedTable.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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
                        <NewsInspector
                            selectedRow={inspector.selectedRow}
                            onRowChange={inspector.setSelectedRow}
                            allColumns={data.allColumns}
                            isEditing={inspector.isEditing}
                            showDeleteConfirm={inspector.showDeleteConfirm}
                            onShowDeleteConfirm={inspector.setShowDeleteConfirm}
                            onDelete={inspector.handleDelete}
                        />
                    </DataExplorerInspector>
                }
            >
                <NewsContent
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

export default AdminNews;
