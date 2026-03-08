import React from 'react';
import { File as FileIcon, Image as ImageIcon, Video, Music, FileText, ExternalLink, Search } from 'lucide-react';
import { DataExplorerContent, GridCard, DataExplorerRow, DataCardContent, DataRowText } from '../../../components/data-explorer';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../../components/ui/table';
import Badge from '../../../components/ui/badge/Badge';
import Button from '../../../components/ui/button/Button';
import { FileObject, formatBytes } from '../../../hooks/useAdminStorage';

interface StorageContentProps {
    loading: boolean;
    viewMode: 'table' | 'grid';
    filteredFiles: FileObject[];
    selectedFile: FileObject | null;
    onFileSelect: (file: FileObject) => void;
    getFilePreview: (fileName: string) => string;
}

const getFileIcon = (mimetype: string) => {
    if (!mimetype) return <FileIcon className="w-5 h-5" />;
    if (mimetype.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (mimetype.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (mimetype.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (mimetype.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
};

const StorageContent: React.FC<StorageContentProps> = ({
    loading,
    viewMode,
    filteredFiles,
    selectedFile,
    onFileSelect,
    getFilePreview
}) => {
    return (
        <DataExplorerContent
            loading={loading}
            emptyIcon={<Search className="w-8 h-8 opacity-20" />}
            emptyMessage="No files found"
        >
            {filteredFiles.length > 0 && viewMode === 'grid' && (
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {filteredFiles.map((file) => {
                            const isImage = file.metadata?.mimetype?.startsWith('image/');
                            return (
                                <GridCard
                                    key={file.id}
                                    item={file}
                                    selected={selectedFile?.name === file.name}
                                    onClick={() => onFileSelect(file)}
                                    imageUrl={isImage ? getFilePreview(file.name) : undefined}
                                    imageIcon={getFileIcon(file.metadata?.mimetype)}
                                    imageOverlay={isImage ? (
                                        <Button
                                            size="icon"
                                            className="size-8 rounded-full shadow-lg"
                                            onClick={() => window.open(getFilePreview(file.name), '_blank')}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    ) : undefined}
                                    renderFields={(item) => (
                                        <DataCardContent
                                            title={item.name}
                                            badges={
                                                <Badge color="light" size="sm" className="text-[9px] font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-800/40">
                                                    {item.metadata?.mimetype?.split('/')[1] || 'FILE'}
                                                </Badge>
                                            }
                                            footerLeft={
                                                <p className="text-[10px] font-mono font-bold text-gray-400 tracking-tighter uppercase shrink-0">
                                                    {formatBytes(item.metadata?.size || 0)}
                                                </p>
                                            }
                                            footerRight={
                                                <p className="text-[9px] font-bold text-gray-300">
                                                    {new Date(item.updated_at).toLocaleDateString()}
                                                </p>
                                            }
                                        />
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {filteredFiles.length > 0 && viewMode === 'table' && (
                <Table className="text-xs">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                        <TableRow>
                            <TableCell isHeader className="px-4 py-3 w-10"> </TableCell>
                            <TableCell isHeader className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">File Name</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Size</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Type</TableCell>
                            <TableCell isHeader className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Last Modified</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredFiles.map((file, idx) => (
                            <DataExplorerRow
                                key={file.id}
                                idx={idx}
                                selected={selectedFile?.name === file.name}
                                onClick={() => onFileSelect(file)}
                            >
                                <TableCell className="px-4 py-3 text-center">
                                    <span className="text-gray-400">{getFileIcon(file.metadata?.mimetype)}</span>
                                </TableCell>
                                <TableCell className="px-4 py-3 truncate max-w-xs">
                                    <DataRowText
                                        title={file.name}
                                    />
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <DataRowText
                                        description={formatBytes(file.metadata?.size || 0)}
                                    />
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <Badge color="light" size="sm" className="font-bold text-[10px] uppercase tracking-widest">
                                        {file.metadata?.mimetype?.split('/')[1]?.toUpperCase() || 'FILE'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <DataRowText
                                        extra={new Date(file.updated_at).toLocaleDateString()}
                                    />
                                </TableCell>
                            </DataExplorerRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </DataExplorerContent>
    );
};

export default StorageContent;
