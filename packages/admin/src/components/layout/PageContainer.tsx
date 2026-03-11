import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'narrow' | 'wide' | 'full' | 'threecolumn';
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className, variant = 'default' }) => {
    return (
        <div className={cn(
            "w-full mx-auto animate-in fade-in duration-500",
            (variant === 'default' || variant === 'narrow') && "px-4 md:px-6 2xl:px-10 py-4 md:py-6 lg:py-8",
            variant === 'default' && "max-w-[1920px]",
            variant === 'narrow' && "max-w-5xl",
            variant === 'wide' && "max-w-7xl px-4 md:px-6 2xl:px-10 py-4 md:py-6 lg:py-12",
            variant === 'full' && "px-4 md:px-6 2xl:px-10 py-4 md:py-6 max-w-full",
            variant === 'threecolumn' && "p-0 m-0 max-w-full h-[calc(100vh-73px)] lg:h-[calc(100vh-80px)] flex flex-col overflow-hidden",
            className
        )}>
            {children}
        </div>
    );
};

export default PageContainer;
