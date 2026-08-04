import { useCallback } from 'react';

/**
 * Hook professionale per bloccare lo scroll del body.
 * Risolve i problemi di 'overscroll-behavior' e scroll parassita su Safari iOS.
 */
export const useScrollLock = () => {
    const lockScroll = useCallback(() => {
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollBarWidth}px`;
        // Prevenzione specifica per iOS Safari
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
    }, []);

    const unlockScroll = useCallback(() => {
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }, []);

    return { lockScroll, unlockScroll };
};