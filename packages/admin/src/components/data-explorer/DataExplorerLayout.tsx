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
    // normal: center=6, inspector=4, overlay=40%
    // wide:   center=4, inspector=6, overlay=60%
    const centerCols = inspectorSize === 'wide' ? 'lg:col-span-4' : 'lg:col-span-6';
    const inspectorCols = inspectorSize === 'wide' ? 'lg:col-span-6' : 'lg:col-span-4';
    const overlayWidth = inspectorSize === 'wide' ? 'lg:w-[60%]' : 'lg:w-[40%]';
    const overlayMargin = inspectorSize === 'wide' ? 'lg:mr-[60%]' : 'lg:mr-[40%]';

    return (
        <PageContainer variant="threecolumn" className="flex flex-col">
            <PageGrid columns={12} className="flex-1 min-h-0 overflow-hidden gap-0">

                {/* --- LEFT COLUMN: Sidebar (sempre 2) --- */}
                {sidebar}

                {/* --- CENTER + RIGHT COLUMNS: Conditional Layout Based on View Mode --- */}
                {viewMode === 'table' && inspectorOpen ? (
                    <>
                        {/* CENTER COLUMN */}
                        <div
                            className={`${centerCols} flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden`}
                            onClick={() => onInspectorClose?.()}
                        >
                            <div onClick={(e) => e.stopPropagation()}>
                                {toolbar}
                            </div>
                            <div className="flex-1 overflow-auto no-scrollbar">
                                {children}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Inspector */}
                        <div
                            className={`${inspectorCols} flex flex-col bg-white dark:bg-gray-900 overflow-hidden`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {inspector}
                        </div>
                    </>
                ) : (
                    /* DEFAULT: Full-width center column (10 colonne) */
                    <div
                        className="lg:col-span-10 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden relative"
                        onClick={() => onInspectorClose?.()}
                    >
                        <div onClick={(e) => e.stopPropagation()}>
                            {toolbar}
                        </div>

                        <div className={cn(
                            "flex-1 overflow-auto no-scrollbar relative transition-all duration-300",
                            viewMode === 'grid' && inspectorOpen && overlayMargin
                        )}>
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
