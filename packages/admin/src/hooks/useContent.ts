import { useState, useCallback } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { useTranslation } from 'react-i18next';


export const useContent = () => {
    const { i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const getPageMetadata = useCallback(async (slug: string) => {
        try {
            setLoading(true);
            const data = await contentService.getPageMetadata(slug, 'site_metadata_admin', i18n.language);
            return data;
        } catch (err) {
            setError(err as Error);
            return null;
        } finally {
            setLoading(false);
        }
    }, [i18n.language]);

    const getMenuItems = useCallback(async () => {
        try {
            setLoading(true);
            const data = await contentService.getMenuItems('site_metadata_admin', i18n.language);
            return data;
        } catch (err) {
            setError(err as Error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [i18n.language]);

    const getHomeCards = useCallback(async () => {
        try {
            setLoading(true);
            const data = await contentService.getHomeCards(i18n.language);
            return data;
        } catch (err) {
            setError(err as Error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [i18n.language]);

    const getQuizRewards = useCallback(async () => {
        try {
            setLoading(true);
            const data = await contentService.getQuizRewards();
            return data;
        } catch (err) {
            setError(err as Error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getCookingClasses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await contentService.getCookingClasses();
            return data;
        } catch (err) {
            setError(err as Error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getDietaryProfiles = useCallback(async () => {
        try {
            setLoading(true);
            const data = await contentService.getDietaryProfiles();
            return data;
        } catch (err) {
            setError(err as Error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getQuizData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await contentService.getQuizData();
            return data;
        } catch (err) {
            setError(err as Error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getPageMetadata,
        getMenuItems,
        getHomeCards,
        getQuizRewards,
        getCookingClasses,
        getDietaryProfiles,
        getQuizData,
    };
};
