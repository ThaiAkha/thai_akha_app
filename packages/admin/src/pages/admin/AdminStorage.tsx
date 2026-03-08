import React from 'react';
import {
    Plus,
    Loader2,
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import {
    DataExplorerLayout,
    DataExplorerToolbar,
    DataExplorerInspector,
} from '../../components/data-explorer';
import { PRIMARY_BTN } from '../../components/data-explorer/DataExplorerToolbar';
import { cn } from '../../lib/utils';

// Modular Components
import StorageSidebar from '../../components/admin/storage/StorageSidebar';
import StorageContent from '../../components/admin/storage/StorageContent';
import StorageInspector from '../../components/admin/storage/StorageInspector';
import StorageInspectorActions from '../../components/admin/storage/StorageInspectorActions';

// Logic Hook
import { useAdminStorage } from '../../hooks/useAdminStorage';

const AdminStorage: React.FC = () => {
    const { data, ui, inspector } = useAdminStorage();

    return (
        <>
            <PageMeta
                title="Admin Storage Explorer | Thai Akha Kitchen"
                description="Manage bucket files and media assets."
            />

            <DataExplorerLayout
                viewMode={ui.viewMode}
                inspectorOpen={inspector.isInspectorOpen}
                onInspectorClose={inspector.closeInspector}
                sidebar={
                    <StorageSidebar
                        buckets={data.buckets}
                        selectedBucket={ui.selectedBucket}
                        onSelect={ui.setSelectedBucket}
                    />
                }
                toolbar={
                    <DataExplorerToolbar
                        searchValue={ui.searchTerm}
                        onSearchChange={ui.setSearchTerm}
                        searchPlaceholder="Search files..."
                        viewMode={ui.viewMode}
                        onViewModeChange={ui.setViewMode}
                        onRefresh={() => data.fetchFiles(ui.selectedBucket)}
                        isRefreshing={data.loading}
                        primaryAction={
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={inspector.handleStageFile}
                                    disabled={inspector.isUploading}
                                />
                                <span className={cn(PRIMARY_BTN, "cursor-pointer")}>
                                    {inspector.isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {inspector.isUploading ? 'CARICA' : 'CARICA'}
                                </span>
                            </label>
                        }
                    />
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={inspector.isEditing || !!inspector.pendingFile}
                        onClose={inspector.closeInspector}
                        headerActions={
                            <StorageInspectorActions
                                pendingFile={inspector.pendingFile}
                                selectedFile={inspector.selectedFile}
                                isEditing={inspector.isEditing}
                                setIsEditing={inspector.setIsEditing}
                                setEditingNameValue={inspector.setEditingNameValue}
                                handleRename={inspector.handleRename}
                                isUploading={inspector.isUploading}
                            />
                        }
                    >
                        <StorageInspector
                            selectedFile={inspector.selectedFile}
                            pendingFile={inspector.pendingFile}
                            pendingFileName={inspector.pendingFileName}
                            onPendingFileNameChange={inspector.setPendingFileName}
                            isEditing={inspector.isEditing}
                            isUploading={inspector.isUploading}
                            editingNameValue={inspector.editingNameValue}
                            onEditingNameValueChange={inspector.setEditingNameValue}
                            getFilePreview={data.getFilePreview}
                            onConfirmUpload={inspector.handleConfirmUpload}
                            onRename={inspector.handleRename}
                            onDelete={inspector.handleDelete}
                            onCopyUrl={ui.handleCopyUrl}
                            copied={ui.copied}
                            onClose={inspector.closeInspector}
                        />
                    </DataExplorerInspector>
                }
            >
                <StorageContent
                    loading={data.loading && data.filteredFiles.length === 0}
                    viewMode={ui.viewMode}
                    filteredFiles={data.filteredFiles}
                    selectedFile={inspector.selectedFile}
                    onFileSelect={inspector.handleFileSelect}
                    getFilePreview={data.getFilePreview}
                />
            </DataExplorerLayout>
        </>
    );
};

export default AdminStorage;
