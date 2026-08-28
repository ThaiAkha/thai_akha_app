import { useTranslation } from 'react-i18next';
import { Plus, Image as ImageIcon, Music, Video, FileText, File as FileIcon, Save, Loader2, Check, Copy, ExternalLink } from 'lucide-react';
import SectionHeader from '../../ui/SectionHeader';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';
import DeleteZone from '../../../components/ui/DeleteZone';
import Tooltip from '../../../components/ui/Tooltip';
import { cn } from '@thaiakha/shared/lib/utils';
import { FileObject, formatBytes } from '../../../hooks/useAdminStorage';

interface StorageInspectorProps {
    selectedFile: FileObject | null;
    pendingFile: File | null;
    pendingFileName: string;
    onPendingFileNameChange: (value: string) => void;
    isEditing: boolean;
    isUploading: boolean;
    editingNameValue: string;
    onEditingNameValueChange: (value: string) => void;
    getFilePreview: (fileName: string) => string;
    onConfirmUpload: () => void;
    onRename: () => void;
    onDelete: () => void;
    onCopyUrl: () => void;
    copied: boolean;
    onClose: () => void;
}

const getFileIcon = (mimetype: string) => {
    if (!mimetype) return <FileIcon className="w-5 h-5" />;
    if (mimetype.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (mimetype.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (mimetype.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (mimetype.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
};

const StorageInspector: React.FC<StorageInspectorProps> = ({
    selectedFile,
    pendingFile,
    pendingFileName,
    onPendingFileNameChange,
    isEditing,
    isUploading,
    editingNameValue,
    onEditingNameValueChange,
    getFilePreview,
    onConfirmUpload,
    onRename,
    onDelete,
    onCopyUrl,
    copied,
}) => {
    const { t } = useTranslation('storage');
    if (!selectedFile && !pendingFile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
                <FileIcon className="w-12 h-12 text-muted mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-sub">
                    {t('inspector.noFile')}
                </p>
                <p className="text-xs text-sub mt-1">
                    {t('inspector.noFileHint')}
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
            {/* Large Preview */}
            <div className="aspect-square lg:aspect-video relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-center group shadow-inner">
                {pendingFile ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="size-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
                            <Plus className="w-10 h-10" />
                        </div>
                        <p className="text-xs font-black uppercase text-amber-600 tracking-tighter">{t('inspector.stagingAsset')}</p>
                        <p className="text-xs font-bold text-sub mt-2 max-w-[180px] break-all">{pendingFile.name}</p>
                    </div>
                ) : (selectedFile && selectedFile.metadata?.mimetype?.startsWith('image/')) ? (
                    <img
                        src={getFilePreview(selectedFile.name)}
                        alt={selectedFile.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (selectedFile && selectedFile.metadata?.mimetype?.startsWith('audio/')) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-primary-50/20 dark:bg-primary-500/5">
                        <Music className="w-12 h-12 text-primary-500 mb-6 animate-bounce-slow" />
                        <audio
                            controls
                            className="w-full h-12 rounded-full"
                            src={getFilePreview(selectedFile.name)}
                        >
                            {t('inspector.audioNotSupported')}
                        </audio>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-sub p-8">
                        <div className="size-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            {selectedFile && getFileIcon(selectedFile.metadata?.mimetype)}
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-center">{selectedFile?.metadata?.mimetype || t('inspector.unknownFile')}</p>
                    </div>
                )}
            </div>

            {/* Actions Card */}
            <div className="space-y-3">
                {pendingFile ? (
                    <Tooltip content={t('inspector.uploadTooltip')} position="bottom">
                        <Button
                            onClick={onConfirmUpload}
                            variant="olive"
                            className="w-full h-12 text-xs font-black uppercase tracking-[0.1em] border-none shadow-xl shadow-amber-500/30 transition-all active:scale-95"
                            startIcon={isUploading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Save className="w-5 h-5 text-white" />}
                            disabled={isUploading}
                        >
                            {isUploading ? t('inspector.saving') : t('inspector.confirmUpload')}
                        </Button>
                    </Tooltip>
                ) : isEditing ? (
                    <Tooltip content={t('inspector.saveTooltip')} position="bottom">
                        <Button
                            onClick={onRename}
                            variant="olive"
                            className="w-full h-12 text-xs font-black uppercase tracking-[0.1em] border-none shadow-xl shadow-blue-500/30 transition-all active:scale-95"
                            startIcon={isUploading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Save className="w-5 h-5 text-white" />}
                            disabled={isUploading}
                        >
                            {isUploading ? t('inspector.saving') : t('inspector.saveChanges')}
                        </Button>
                    </Tooltip>
                ) : (
                    <div className="space-y-4">
                        {/* Specialized Downloads */}
                        <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.05]">
                            <SectionHeader title={t('inspector.downloadOptions')} variant="inspector" className="mb-3" />

                            <div className="grid grid-cols-1 gap-2">
                                {(selectedFile && selectedFile.metadata?.mimetype?.startsWith('image/')) ? (
                                    <>
                                        <a href={getFilePreview(selectedFile.name)} download={selectedFile.name} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-500 transition-colors group text-decoration-none">
                                            <div className="flex items-center gap-3">
                                                <ImageIcon className="w-4 h-4 text-primary-500" />
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-body">{t('inspector.origQuality')}</p>
                                                    <p className="text-xs text-sub tracking-tight">{t('inspector.origQualityDesc')}</p>
                                                </div>
                                            </div>
                                            <Check className="w-3 h-3 text-gray-300 group-hover:text-primary-500" />
                                        </a>
                                    </>
                                ) : (selectedFile && selectedFile.metadata?.mimetype?.startsWith('audio/')) ? (
                                    <>
                                        <a href={getFilePreview(selectedFile.name)} download={selectedFile.name} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-500 transition-colors group text-decoration-none">
                                            <div className="flex items-center gap-3">
                                                <Music className="w-4 h-4 text-purple-500" />
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-body">{t('inspector.standardMp3')}</p>
                                                    <p className="text-xs text-sub tracking-tight">{t('inspector.mp3Desc')}</p>
                                                </div>
                                            </div>
                                            <Check className="w-3 h-3 text-gray-300 group-hover:text-purple-500" />
                                        </a>
                                    </>
                                ) : (
                                    <a href={getFilePreview(selectedFile?.name || '')} download={selectedFile?.name} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-500 transition-colors group text-decoration-none">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <div className="text-left">
                                                <p className="text-xs font-bold text-body">{t('inspector.rawDocument')}</p>
                                                <p className="text-xs text-sub tracking-tight">{t('inspector.rawDocDesc')}</p>
                                            </div>
                                        </div>
                                        <Check className="w-3 h-3 text-gray-300 group-hover:text-gray-500" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Utility Actions */}
                        <div className="flex gap-2">
                            <Button
                                onClick={onCopyUrl}
                                variant="outline"
                                className="flex-1 h-10 text-xs font-black uppercase tracking-widest border-gray-200 dark:border-gray-800 bg-white"
                                startIcon={copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            >
                                {copied ? t('inspector.copied') : t('inspector.copyLink')}
                            </Button>
                            <Button
                                onClick={() => window.open(getFilePreview(selectedFile?.name || ''), '_blank')}
                                variant="outline"
                                className="flex-1 h-10 text-xs font-black uppercase tracking-widest border-gray-200 dark:border-gray-800 bg-white"
                                startIcon={<ExternalLink className="w-4 h-4" />}
                            >
                                {t('inspector.preview')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Fields List */}
            <div className="space-y-5 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-2">
                    <SectionHeader title={pendingFile ? t('inspector.setFilename') : t('inspector.assetName')} variant="inspector" />
                    {pendingFile ? (
                        <Input
                            value={pendingFileName}
                            onChange={(e) => onPendingFileNameChange(e.target.value)}
                            className="h-11 text-xs font-bold border-primary-300 focus:border-primary-600 bg-primary-50/30 shadow-inner"
                            placeholder={t('inspector.filenamePlaceholder')}
                        />
                    ) : isEditing ? (
                        <Input
                            value={editingNameValue}
                            onChange={(e) => onEditingNameValueChange(e.target.value)}
                            className="h-11 text-xs font-bold border-blue-300 focus:border-blue-600 bg-blue-50/30 shadow-inner"
                            placeholder={t('inspector.newNamePlaceholder')}
                        />
                    ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs font-bold text-body break-all leading-relaxed border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-gray-200">
                            {selectedFile?.name}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Tooltip content={t('inspector.tooltipSize')} position="bottom" className="w-full">
                        <div className="space-y-2">
                            <SectionHeader title={t('inspector.diskSize')} variant="inspector" />
                            <div className={cn(
                                "p-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg text-xs font-black text-sub border border-gray-100 dark:border-gray-800/50",
                                isEditing && "opacity-60 cursor-not-allowed"
                            )}>
                                {formatBytes(pendingFile ? pendingFile.size : (selectedFile?.metadata?.size || 0))}
                            </div>
                        </div>
                    </Tooltip>
                    <Tooltip content={t('inspector.tooltipMime')} position="bottom" className="w-full">
                        <div className="space-y-2">
                            <SectionHeader title={t('inspector.mimeType')} variant="inspector" />
                            <div className={cn(
                                "p-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg text-xs font-black text-sub border border-gray-100 dark:border-gray-800/50 truncate",
                                isEditing && "opacity-60 cursor-not-allowed"
                            )}>
                                {pendingFile
                                    ? pendingFile.type.split('/')[1]?.toUpperCase()
                                    : (selectedFile?.metadata?.mimetype?.split('/')[1]?.toUpperCase() || 'FILE')}
                            </div>
                        </div>
                    </Tooltip>
                </div>

                {!pendingFile && selectedFile && (
                    <div className="pt-2 space-y-4">
                        <div className="space-y-2">
                            <SectionHeader title={t('inspector.createdAt')} variant="inspector" />
                            <div className={cn(
                                "p-3 bg-gray-50/30 dark:bg-gray-800/10 rounded-lg text-xs font-bold text-sub border border-gray-100 dark:border-gray-800/50",
                                isEditing && "opacity-60 cursor-not-allowed"
                            )}>
                                {new Date(selectedFile.created_at).toLocaleString()}
                            </div>
                        </div>
                        <div className="space-y-2 pb-10">
                            <SectionHeader title={t('inspector.lastSynced')} variant="inspector" />
                            <div className={cn(
                                "p-3 bg-gray-50/30 dark:bg-gray-800/10 rounded-lg text-xs font-bold text-sub border border-gray-100 dark:border-gray-800/50",
                                isEditing && "opacity-60 cursor-not-allowed"
                            )}>
                                {new Date(selectedFile.updated_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Asset */}
                {isEditing && selectedFile && (
                    <DeleteZone label={t('inspector.deleteAsset')} onDelete={onDelete} />
                )}
            </div>
        </div>
    );
};

export default StorageInspector;
