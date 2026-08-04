import React from 'react';
import PageContainer from '../layout/PageContainer';
import PageGrid from '../layout/PageGrid';
import { cn } from '@thaiakha/shared/lib/utils';

interface DataExplorerLayoutProps {
    sidebar: React.ReactNode;
    toolbar: React.ReactNode;
    inspector?: React.ReactNode;
    inspectorOpen?: boolean;
    onInspectorClose?: () => void;
    viewMode: 'table' | 'grid';
    /** 'normal' = 4/12 col inspector (default) | 'wide' = 6/12 col inspector (50% page) */
    inspectorSize?: 'normal' | 'wide';
    children: React.ReactNode;
}

const DataExplorerLayout: React.FC<DataExplorerLayoutProps> = ({
    sidebar,
    toolbar,
    inspector,
    inspectorOpen = false,
    onInspectorClose,
    viewMode,
    inspectorSize = 'normal',
    children,
}) => {
    // Inspector width within the 10-col content area (sidebar takes the other 2/12).
    // The old inspector was 4/12 ≈ 33% of the page (40% of the content area). Reduced to give
    // the center more room: tablet (lg, iPad landscape) −10%, desktop (xl) −20%.
    //   40% × 0.90 = 36% of content → ~30% of page (−10%)
    //   40% × 0.80 = 32% of content → ~27% of page (−20%)
    // 'wide' keeps the ~50/50 split unchanged.
    const inspectorBasis = inspectorSize === 'wide' ? 'lg:basis-[60%]' : 'lg:basis-[36%] xl:basis-[32%]';
    const overlayWidth = inspectorSize === 'wide' ? 'lg:w-[60%]' : 'lg:w-[40%]';
    const overlayMargin = inspectorSize === 'wide' ? 'lg:mr-[60%]' : 'lg:mr-[40%]';

    return (
        <PageContainer variant="threecolumn" className="flex flex-col">
            <PageGrid columns={12} className="flex-1 min-h-0 overflow-hidden gap-0">

                {/* --- LEFT COLUMN: Sidebar (sempre 2) --- */}
                {sidebar}

                {/* --- CENTER + RIGHT COLUMNS: Conditional Layout Based on View Mode --- */}
                {viewMode === 'table' && inspectorOpen ? (
                    <div className="lg:col-span-10 flex flex-col lg:flex-row min-h-0 overflow-hidden">
                        {/* CENTER COLUMN */}
                        <div
                            className="flex-1 min-w-0 flex flex-col bg-white dark:bg-gray-900 lg:border-r border-gray-200 dark:border-gray-800 overflow-hidden"
                            onClick={() => onInspectorClose?.()}
                        >
                            <div onClick={(e) => e.stopPropagation()}>
                                {toolbar}
                            </div>
                            {/* Content clicks must NOT bubble to the center-column close handler,
                                otherwise selecting a category/product closes the inspector and
                                wipes unsaved work (POS cart reset bug). */}
                            <div className="flex-1 overflow-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
                                {children}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Inspector */}
                        <div
                            className={cn('lg:shrink-0 flex flex-col bg-white dark:bg-gray-900 overflow-hidden', inspectorBasis)}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {inspector}
                        </div>
                    </div>
                ) : (
                    /* DEFAULT: Full-width center column (10 colonne) */
                    <div
                        className="lg:col-span-10 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden relative"
                        onClick={() => onInspectorClose?.()}
                    >
                        <div onClick={(e) => e.stopPropagation()}>
                            {toolbar}
                        </div>

                        <div
                            className={cn(
                                "flex-1 overflow-auto no-scrollbar relative transition-all duration-300",
                                viewMode === 'grid' && inspectorOpen && overlayMargin
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {children}
                        </div>

                        {/* Inspector Overlay - grid mode only */}
                        {viewMode === 'grid' && inspectorOpen && (
                            <div
                                className={`absolute inset-y-0 right-0 ${overlayWidth} w-full bg-white dark:bg-gray-900 shadow-2xl z-20 transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {inspector}
                            </div>
                        )}
                    </div>
                )}

            </PageGrid>
        </PageContainer>
    );
};

export default DataExplorerLayout;
