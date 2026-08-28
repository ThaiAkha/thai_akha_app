import React from 'react';
import { 
    Plus, 
    FileSpreadsheet, 
    Copy,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageMeta from '../../components/common/PageMeta';
import { PRIMARY_BTN } from '../../components/data-explorer/DataExplorerToolbar';
import { Dropdown } from '../../components/ui/dropdown/Dropdown';
import { DropdownItem } from '../../components/ui/dropdown/DropdownItem';
import { Caption, Paragraph, SectionTitle } from '../../components/typography';
import { 
    DataExplorerLayout, 
    DataExplorerToolbar, 
    DataExplorerInspector 
} from '../../components/data-explorer';

// Modular Components
import MediaSidebar from '../../components/admin/media/MediaSidebar';
import MediaContent from '../../components/admin/media/MediaContent';
import MediaInspector from '../../components/admin/media/MediaInspector';
import MediaInspectorActions from '../../components/admin/media/MediaInspectorActions';

// Logic Hook
import { useAdminMedia } from '../../hooks/useAdminMedia';

const AdminMedia: React.FC = () => {
    const { t } = useTranslation('common');
    const { data, ui, inspector } = useAdminMedia();

    return (
        <>
            <PageMeta 
                title="Admin Media Library | Thai Akha Kitchen"
                description="Manage photos, videos and audio assets."
            />

            <DataExplorerLayout
                viewMode={ui.viewMode}
                inspectorOpen={inspector.isInspectorOpen}
                onInspectorClose={inspector.closeInspector}
                sidebar={
                    <MediaSidebar 
                        categories={data.categories}
                        selectedFolder={ui.selectedFolder}
                        onSelect={ui.setSelectedFolder}
                    />
                }
                toolbar={
                    <DataExplorerToolbar 
                        primaryAction={
                            <button type="button" onClick={inspector.handleCreateNew} className={PRIMARY_BTN}>
                                <Plus className="w-4 h-4" />
                                {t('actions.new', 'New Asset')}
                            </button>
                        }
                        searchPlaceholder={t('content.searchPlaceholder', 'Search by filename, title or tags...')}
                        searchValue={ui.searchTerm}
                        onSearchChange={ui.setSearchTerm}
                        viewMode={ui.viewMode}
                        onViewModeChange={ui.setViewMode}
                        onRefresh={data.fetchData}
                        isRefreshing={data.loading}
                        onExportClick={() => ui.setIsExportOpen(!ui.isExportOpen)}
                        exportDropdown={
                            <Dropdown isOpen={ui.isExportOpen} onClose={() => ui.setIsExportOpen(false)} className="w-56 mt-2 left-0 shadow-2xl border-primary-100 dark:border-primary-500/20">
                                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                    <SectionTitle className="mb-0 text-sub">Export Formats</SectionTitle>
                                </div>
                                <DropdownItem onClick={() => {}} className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors opacity-50 cursor-not-allowed">
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                    <div className="text-left">
                                        <Paragraph size="xs" className="font-bold leading-4">Export CSV</Paragraph>
                                        <Caption className="italic leading-4">Coming soon kha</Caption>
                                    </div>
                                </DropdownItem>
                                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                                <DropdownItem onClick={() => {}} className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors opacity-50 cursor-not-allowed">
                                    <Copy className="w-4 h-4 text-primary-600" />
                                    <div className="text-left">
                                        <Paragraph size="xs" className="font-bold leading-4">Copy JSON</Paragraph>
                                        <Caption className="italic leading-4">Available in next update</Caption>
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
                            <MediaInspectorActions 
                                isEditing={inspector.isEditing}
                                setIsEditing={inspector.setIsEditing}
                                handleSave={inspector.handleSave}
                                isSaving={inspector.isSaving}
                            />
                        }
                    >
                        <MediaInspector 
                            editingAsset={inspector.editingAsset}
                            onEditingAssetChange={inspector.setEditingAsset}
                            isEditing={inspector.isEditing}
                            isNew={inspector.isNew}
                            onDelete={inspector.handleDelete}
                        />
                    </DataExplorerInspector>
                }
            >
                <MediaContent 
                    loading={data.loading && data.filteredAssets.length === 0}
                    viewMode={ui.viewMode}
                    filteredAssets={data.filteredAssets}
                    editingAsset={inspector.editingAsset}
                    onAssetSelect={inspector.handleAssetSelect}
                    selectedIds={ui.selectedIds}
                    onToggleSelectAll={ui.toggleSelectAll}
                    onToggleSelectRow={ui.toggleSelectRow}
                />
            </DataExplorerLayout>
        </>
    );
};

export default AdminMedia;
