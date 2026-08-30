import React, { useMemo } from 'react';
import {
    Grid,
    Folder,
    Image as ImageIcon,
    Music,
    Video
} from 'lucide-react';
import { SectionTitle } from '../../typography';
import { useTranslation } from 'react-i18next';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import { MediaCategory } from '../../../hooks/useAdminMedia';

interface MediaSidebarProps {
    categories: MediaCategory[];
    selectedFolder: string;
    onSelect: (folderId: string) => void;
}

const MediaSidebar: React.FC<MediaSidebarProps> = ({ categories, selectedFolder, onSelect }) => {
    const { t } = useTranslation('media');

    const sidebarItems = useMemo(() => {
        const getFolderIcon = (folder: string) => {
            const f = folder.toLowerCase();
            if (f.includes('image') || f.includes('photo')) return <ImageIcon className="w-4 h-4" />;
            if (f.includes('audio') || f.includes('story')) return <Music className="w-4 h-4" />;
            if (f.includes('video')) return <Video className="w-4 h-4" />;
            return <Folder className="w-4 h-4" />;
        };

        return [
            { id: 'all', label: t('sidebar.allAssets'), icon: <Grid className="w-4 h-4" /> },
            ...categories.map(cat => ({
                id: cat.id,
                label: cat.title,
                icon: getFolderIcon(cat.id),
                count: cat.count
            }))
        ];
    }, [categories, t]);

    return (
        <DataExplorerSidebar
            title={t('sidebar.title')}
            titleIcon={<Folder className="w-5 h-5 text-primary-500" />}
            items={sidebarItems}
            selectedId={selectedFolder}
            onSelect={onSelect}
            footer={
                <div className="px-2 py-3 bg-primary-50 dark:bg-primary-900/10 border-t border-primary-100 dark:border-primary-900/20">
                    <SectionTitle className="text-primary-700 dark:text-primary-400 tracking-widest text-center">
                        {t('sidebar.footer')}
                    </SectionTitle>
                </div>
            }
        />
    );
};

export default MediaSidebar;
