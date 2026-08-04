import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';

export interface Bucket {
    id: string;
    name: string;
    public: boolean;
}

export interface FileObject {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: {
        size: number;
        mimetype: string;
    };
}

export const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const useAdminStorage = () => {
    const { t } = useTranslation('storage');
    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [selectedBucket, setSelectedBucket] = useState<string>('assets');
    const [files, setFiles] = useState<FileObject[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingFileName, setPendingFileName] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
    const [isEditing, setIsEditing] = useState(false);
    const [editingNameValue, setEditingNameValue] = useState('');

    // ✅ AppHeader handles metadata loading automatically
    // Load Buckets
    useEffect(() => {
        fetchBuckets();
    }, []);

    const fetchBuckets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.storage.listBuckets();
            if (error) throw error;

            const fallbackBuckets: Bucket[] = [
                { id: 'admin', name: 'Admin', public: true },
                { id: 'akha-book', name: 'Akha Book', public: true },
                { id: 'akha-history', name: 'Akha History', public: true },
                { id: 'akha-quiz', name: 'Akha Quiz', public: true },
                { id: 'audio-player', name: 'Audio Player', public: true },
                { id: 'avatars-preset', name: 'Avatars Preset', public: true },
                { id: 'avatars-user-upload', name: 'User Avatar Uploads', public: true },
                { id: 'brand-asset', name: 'Brand Asset', public: true },
                { id: 'categories', name: 'Categories', public: true },
                { id: 'ingredients', name: 'Ingredients', public: true },
                { id: 'kitchen', name: 'Kitchen', public: true },
                { id: 'manuals', name: 'Manuals', public: false },
                { id: 'news', name: 'News', public: true },
                { id: 'payment-proofs', name: 'Payment Proofs', public: false },
                { id: 'recipes', name: 'Recipes', public: true },
                { id: 'showcase', name: 'Showcase', public: true },
                { id: 'song', name: 'Song', public: true }
            ];

            const finalBuckets = (data && data.length > 0) ? data : fallbackBuckets;
            setBuckets(finalBuckets);

            if (finalBuckets.length > 0 && !selectedBucket) {
                setSelectedBucket(finalBuckets[0].id);
            }
        } catch (error: any) {
            console.error('Error fetching buckets:', error);
            const fallbackBuckets: Bucket[] = [
                { id: 'admin', name: 'Admin', public: true },
                { id: 'akha-book', name: 'Akha Book', public: true },
                { id: 'akha-history', name: 'Akha History', public: true },
                { id: 'akha-quiz', name: 'Akha Quiz', public: true },
                { id: 'audio-player', name: 'Audio Player', public: true },
                { id: 'avatars-preset', name: 'Avatars Preset', public: true },
                { id: 'avatars-user-upload', name: 'User Avatar Uploads', public: true },
                { id: 'brand-asset', name: 'Brand Asset', public: true },
                { id: 'categories', name: 'Categories', public: true },
                { id: 'ingredients', name: 'Ingredients', public: true },
                { id: 'kitchen', name: 'Kitchen', public: true },
                { id: 'manuals', name: 'Manuals', public: false },
                { id: 'news', name: 'News', public: true },
                { id: 'payment-proofs', name: 'Payment Proofs', public: false },
                { id: 'recipes', name: 'Recipes', public: true },
                { id: 'showcase', name: 'Showcase', public: true },
                { id: 'song', name: 'Song', public: true }
            ];
            setBuckets(fallbackBuckets);
            setSelectedBucket(fallbackBuckets[0].id);
        } finally {
            setLoading(false);
        }
    };

    const fetchFiles = useCallback(async (bucketId: string) => {
        if (!bucketId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.storage.from(bucketId).list();
            if (error) throw error;
            setFiles((data as any[]) || []);
            setSelectedFile(null);
        } catch (error: any) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedBucket) {
            fetchFiles(selectedBucket);
        }
    }, [selectedBucket, fetchFiles]);

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFileSelect = (file: FileObject) => {
        setPendingFile(null);
        setPendingFileName('');
        setIsEditing(false);
        setSelectedFile(file);
        setIsInspectorOpen(true);
        setCopied(false);
    };

    const handleCopyUrl = async () => {
        if (!selectedFile || !selectedBucket) return;
        const { data } = supabase.storage.from(selectedBucket).getPublicUrl(selectedFile.name);
        try {
            await navigator.clipboard.writeText(data.publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    const handleDelete = async () => {
        if (!selectedFile || !selectedBucket) return;
        if (!window.confirm(t('alerts.confirmDelete', { name: selectedFile.name }))) return;
        try {
            const { error } = await supabase.storage.from(selectedBucket).remove([selectedFile.name]);
            if (error) throw error;
            fetchFiles(selectedBucket);
            setIsInspectorOpen(false);
        } catch (error: any) {
            alert(t('alerts.deleteFailed', { message: error.message }));
        }
    };

    const handleStageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const filesToUpload = e.target.files;
        if (!filesToUpload || filesToUpload.length === 0 || !selectedBucket) return;

        if (filesToUpload.length > 1) {
            setIsUploading(true);
            try {
                for (let i = 0; i < filesToUpload.length; i++) {
                    const file = filesToUpload[i];
                    await supabase.storage
                        .from(selectedBucket)
                        .upload(`${file.name}`, file, { upsert: true });
                }
                fetchFiles(selectedBucket);
            } catch (error: any) {
                alert(t('alerts.uploadFailed', { message: error.message }));
            } finally {
                setIsUploading(false);
            }
        } else {
            const file = filesToUpload[0];
            setPendingFile(file);
            setPendingFileName(file.name);
            setSelectedFile(null);
            setIsInspectorOpen(true);
        }
    };

    const handleConfirmUpload = async () => {
        if (!pendingFile || !selectedBucket) return;
        setIsUploading(true);
        try {
            const { error } = await supabase.storage
                .from(selectedBucket)
                .upload(`${pendingFileName}`, pendingFile, { upsert: true });
            if (error) throw error;
            setPendingFile(null);
            setPendingFileName('');
            fetchFiles(selectedBucket);
            setIsInspectorOpen(false);
        } catch (error: any) {
            alert(t('alerts.uploadFailed', { message: error.message }));
        } finally {
            setIsUploading(false);
        }
    };

    const handleRename = async () => {
        if (!selectedFile || !selectedBucket || !editingNameValue) return;
        if (selectedFile.name === editingNameValue) {
            setIsEditing(false);
            return;
        }
        setIsUploading(true);
        try {
            const { error: moveError } = await supabase.storage
                .from(selectedBucket)
                .copy(selectedFile.name, editingNameValue);
            if (moveError) throw moveError;
            const { error: deleteError } = await supabase.storage
                .from(selectedBucket)
                .remove([selectedFile.name]);
            if (deleteError) throw deleteError;
            setIsEditing(false);
            alert(t('alerts.renamedSuccess'));
            fetchFiles(selectedBucket);
            setIsInspectorOpen(false);
        } catch (error: any) {
            alert(t('alerts.renameFailed', { message: error.message }));
        } finally {
            setIsUploading(false);
        }
    };

    const getFilePreview = (fileName: string) => {
        if (!selectedBucket) return '';
        const { data } = supabase.storage.from(selectedBucket).getPublicUrl(fileName);
        return data.publicUrl;
    };

    const closeInspector = () => {
        setSelectedFile(null);
        setPendingFile(null);
        setIsEditing(false);
        setIsInspectorOpen(false);
    };

    return {
        data: {
            buckets,
            files,
            filteredFiles,
            loading,
            fetchFiles,
            getFilePreview,
        },
        ui: {
            selectedBucket,
            setSelectedBucket,
            searchTerm,
            setSearchTerm,
            viewMode,
            setViewMode,
            copied,
            handleCopyUrl,
        },
        inspector: {
            selectedFile,
            isInspectorOpen,
            isUploading,
            pendingFile,
            pendingFileName,
            setPendingFileName,
            isEditing,
            setIsEditing,
            editingNameValue,
            setEditingNameValue,
            handleFileSelect,
            handleDelete,
            handleStageFile,
            handleConfirmUpload,
            handleRename,
            closeInspector
        }
    };
};
