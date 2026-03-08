import React, { createContext, useContext, useState } from 'react';

interface PageHeaderContextType {
    title: string;
    titleHighlight: string;
    setPageHeader: (title: string, highlight?: string) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export const PageHeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [title, setTitle] = useState('');
    const [titleHighlight, setTitleHighlight] = useState('');

    const setPageHeader = React.useCallback((t: string, h: string = '') => {
        setTitle(t);
        setTitleHighlight(h);
    }, []);

    const value = React.useMemo(() => ({ title, titleHighlight, setPageHeader }), [title, titleHighlight, setPageHeader]);

    return (
        <PageHeaderContext.Provider value={value}>
            {children}
        </PageHeaderContext.Provider>
    );
};

export const usePageHeader = () => {
    const context = useContext(PageHeaderContext);
    if (!context) {
        throw new Error('usePageHeader must be used within a PageHeaderProvider');
    }
    return context;
};
