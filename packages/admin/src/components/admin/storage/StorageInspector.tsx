import { Plus, Image as ImageIcon, Music, Video, FileText, File as FileIcon, Save, Loader2, Check, Copy, ExternalLink } from 'lucide-react';
import SectionHeader from '../../ui/SectionHeader';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';
import DeleteZone from '../../../components/ui/DeleteZone';
import Tooltip from '../../../components/ui/Tooltip';
import { cn } from '../../../lib/utils';
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
    if (!selectedFile && !pendingFile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
                <FileIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-gray-400">
                    No file selected
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Click a file from the list to view details
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
                        <p className="text-[12px] font-black uppercase text-amber-600 tracking-tighter">Staging Asset</p>
                        <p className="text-[10px] font-bold text-gray-500 mt-2 max-w-[180px] break-all">{pendingFile.name}</p>
                    </div>
                ) : (selectedFile && selectedFile.metadata?.mimetype?.startsWith('image/')) ? (
                    <img
                        src={getFilePreview(selectedFile.name)}
                        alt={selectedFile.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (selectedFile && selectedFile.metadata?.mimetype?.startsWith('audio/')) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-brand-50/20 dark:bg-brand-500/5">
                        <Music className="w-12 h-12 text-brand-500 mb-6 animate-bounce-slow" />
                        <audio
                            controls
                            className="w-full h-12 rounded-full"
                            src={getFilePreview(selectedFile.name)}
                        >
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="size-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            {selectedFile && getFileIcon(selectedFile.metadata?.mimetype)}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">{selectedFile?.metadata?.mimetype || 'UNKNOWN FILE'}</p>
                    </div>
                )}
            </div>

            {/* Actions Card */}
            <div className="space-y-3">
                {pendingFile ? (
                    <Tooltip content="Upload assets to storage" position="bottom">
                        <Button
                            onClick={onConfirmUpload}
                            variant="olive"
                            className="w-full h-12 text-[12px] font-black uppercase tracking-[0.1em] border-none shadow-xl shadow-amber-500/30 transition-all active:scale-95"
                            startIcon={isUploading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Save className="w-5 h-5 text-white" />}
                            disabled={isUploading}
                        >
                            {isUploading ? 'SAVING...' : 'CONFIRM UPLOAD'}
                        </Button>
                    </Tooltip>
                ) : isEditing ? (
                    <Tooltip content="Save changes" position="bottom">
                        <Button
                            onClick={onRename}
                            variant="olive"
                            className="w-full h-12 text-[12px] font-black uppercase tracking-[0.1em] border-none shadow-xl shadow-blue-500/30 transition-all active:scale-95"
                            startIcon={isUploading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Save className="w-5 h-5 text-white" />}
                            disabled={isUploading}
                        >
                            {isUploading ? 'SAVING...' : 'SAVE CHANGES'}
                        </Button>
                    </Tooltip>
                ) : (
                    <div className="space-y-4">
                        {/* Specialized Downloads */}
                        <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.05]">
                            <SectionHeader title="Download Options" variant="inspector" className="mb-3" />

                            <div className="grid grid-cols-1 gap-2">
                                {(selectedFile && selectedFile.metadata?.mimetype?.startsWith('image/')) ? (
                                    <>
                                        <a href={getFilePreview(selectedFile.name)} download={selectedFile.name} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-brand-500 transition-colors group text-decoration-none">
                                            <div className="flex items-center gap-3">
                                                <ImageIcon className="w-4 h-4 text-brand-500" />
                                                <div className="text-left">
                                                    <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200">Original Quality</p>
                                                    <p className="text-[9px] text-gray-400 tracking-tight">Full resolution asset</p>
                                                </div>
                                            </div>
                                            <Check className="w-3 h-3 text-gray-300 group-hover:text-brand-500" />
                                        </a>
                                    </>
                                ) : (selectedFile && selectedFile.metadata?.mimetype?.startsWith('audio/')) ? (
                                    <>
                                        <a href={getFilePreview(selectedFile.name)} download={selectedFile.name} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-500 transition-colors group text-decoration-none">
                                            <div className="flex items-center gap-3">
                                                <Music className="w-4 h-4 text-purple-500" />
                                                <div className="text-left">
                                                    <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200">Standard MP3</p>
                                                    <p className="text-[9px] text-gray-400 tracking-tight">Compatible format</p>
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
                                                <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200">Raw Document</p>
                                                <p className="text-[9px] text-gray-400 tracking-tight">Standard file download</p>
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
                                className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-800 bg-white"
                                startIcon={copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            >
                                {copied ? 'COPIED' : 'COPY LINK'}
                            </Button>
                            <Button
                                onClick={() => window.open(getFilePreview(selectedFile?.name || ''), '_blank')}
                                variant="outline"
                                className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-800 bg-white"
                                startIcon={<ExternalLink className="w-4 h-4" />}
                            >
                                PREVIEW
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Fields List */}
            <div className="space-y-5 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-2">
                    <SectionHeader title={pendingFile ? 'Set Filename' : 'Asset Name'} variant="inspector" />
                    {pendingFile ? (
                        <Input
                            value={pendingFileName}
                            onChange={(e) => onPendingFileNameChange(e.target.value)}
                            className="h-11 text-[12px] font-bold border-brand-300 focus:border-brand-600 bg-brand-50/30 shadow-inner"
                            placeholder="Enter filename..."
                        />
                    ) : isEditing ? (
                        <Input
                            value={editingNameValue}
                            onChange={(e) => onEditingNameValueChange(e.target.value)}
                            className="h-11 text-[12px] font-bold border-blue-300 focus:border-blue-600 bg-blue-50/30 shadow-inner"
                            placeholder="Enter new name..."
                        />
                    ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[12px] font-bold text-gray-700 dark:text-gray-300 break-all leading-relaxed border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-gray-200">
                            {selectedFile?.name}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Tooltip content="File size on disk" position="bottom" className="w-full">
                        <div className="space-y-2">
                            <SectionHeader title="Disk Size" variant="inspector" />
                            <div className={cn(
                                "p-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg text-[11px] font-black text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800/50",
                                isEditing && "opacity-60 cursor-not-allowed"
                            )}>
                                {formatBytes(pendingFile ? pendingFile.size : (selectedFile?.metadata?.size || 0))}
                            </div>
                        </div>
                    </Tooltip>
                    <Tooltip content="MIME type of the asset" position="bottom" className="w-full">
                        <div className="space-y-2">
                            <SectionHeader title="MIME Type" variant="inspector" />
                            <div className={cn(
                                "p-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg text-[11px] font-black text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800/50 truncate",
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
                            <SectionHeader title="Created At" variant="inspector" />
                            <div className={cn(
                                "p-3 bg-gray-50/30 dark:bg-gray-800/10 rounded-lg text-[11px] font-bold text-gray-500 border border-gray-100 dark:border-gray-800/50",
                                isEditing && "opacity-60 cursor-not-allowed"
                            )}>
                                {new Date(selectedFile.created_at).toLocaleString()}
                            </div>
                        </div>
                        <div className="space-y-2 pb-10">
                            <SectionHeader title="Last Synced" variant="inspector" />
                            <div className={cn(
                                "p-3 bg-gray-50/30 dark:bg-gray-800/10 rounded-lg text-[11px] font-bold text-gray-500 border border-gray-100 dark:border-gray-800/50",
                                isEditing && "opacity-60 cursor-not-allowed"
                            )}>
                                {new Date(selectedFile.updated_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Asset */}
                {isEditing && selectedFile && (
                    <DeleteZone label="DELETE ASSET" onDelete={onDelete} />
                )}
            </div>
        </div>
    );
};

export default StorageInspector;
