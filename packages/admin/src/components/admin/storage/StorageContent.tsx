import React from 'react';
import { useTranslation } from 'react-i18next';
import { File as FileIcon, Image as ImageIcon, Video, Music, FileText, ExternalLink, Search } from 'lucide-react';
import {
    DataExplorerContent,
    GridCard,
    DataExplorerRow,
    DataCardContent,
    DataRowText,
    DataTableHead,
    HeaderCell,
    CardGrid,
} from '../../../components/data-explorer';
import { Table, TableBody, TableCell } from '../../../components/ui/table';
import Badge from '../../../components/ui/badge/Badge';
import Button from '../../../components/ui/button/Button';
import { Caption, SectionTitle } from '../../typography';
import { FileObject, formatBytes } from '../../../hooks/useAdminStorage';
import { getLocaleCode } from '../../../lib/dateFormatter';

// Locale da sorgente unica: copre tutte e 4 le lingue (en/th/es/zh).
const getLocale = getLocaleCode;

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
    const { i18n } = useTranslation('storage');
    return (
        <DataExplorerContent
            loading={loading}
            emptyIcon={<Search className="w-8 h-8 opacity-20" />}
            emptyMessage="No files found"
            isEmpty={filteredFiles.length === 0}
        >
            {filteredFiles.length > 0 && viewMode === 'grid' && (
                <CardGrid padding={4} gap={3}>
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
                                            <Badge color="light" size="sm" className="text-xs font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-800/40">
                                                {item.metadata?.mimetype?.split('/')[1] || 'FILE'}
                                            </Badge>
                                        }
                                        footerLeft={
                                            <SectionTitle tone="sub" className="font-mono tracking-tighter shrink-0">
                                                {formatBytes(item.metadata?.size || 0)}
                                            </SectionTitle>
                                        }
                                        footerRight={
                                            <Caption>
                                                {new Date(item.updated_at).toLocaleDateString(getLocale(i18n.language))}
                                            </Caption>
                                        }
                                    />
                                )}
                            />
                        );
                    })}
                </CardGrid>
            )}

            {filteredFiles.length > 0 && viewMode === 'table' && (
                <Table className="text-xs">
                    <DataTableHead>
                        <TableCell isHeader className="px-4 py-3 w-10"> </TableCell>
                        <HeaderCell label="File Name" />
                        <HeaderCell label="Size" />
                        <HeaderCell label="Type" />
                        <HeaderCell label="Last Modified" />
                    </DataTableHead>
                    <TableBody>
                        {filteredFiles.map((file, idx) => (
                            <DataExplorerRow
                                key={file.id}
                                idx={idx}
                                selected={selectedFile?.name === file.name}
                                onClick={() => onFileSelect(file)}
                            >
                                <TableCell className="px-4 py-3 text-center">
                                    <span className="text-sub">{getFileIcon(file.metadata?.mimetype)}</span>
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
                                    <Badge color="light" size="sm" className="font-bold text-xs uppercase tracking-widest">
                                        {file.metadata?.mimetype?.split('/')[1]?.toUpperCase() || 'FILE'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <DataRowText
                                        extra={new Date(file.updated_at).toLocaleDateString(getLocale(i18n.language))}
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
