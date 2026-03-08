import React from 'react';
import PageContainer from '../layout/PageContainer';
import PageGrid from '../layout/PageGrid';
import { cn } from '../../lib/utils';

interface DataExplorerLayoutProps {
    sidebar: React.ReactNode;
    toolbar: React.ReactNode;
    inspector?: React.ReactNode;
    inspectorOpen?: boolean;
    onInspectorClose?: () => void;
    viewMode: 'table' | 'grid';
    children: React.ReactNode;
}

const DataExplorerLayout: React.FC<DataExplorerLayoutProps> = ({
    sidebar,
    toolbar,
    inspector,
    inspectorOpen = false,
    onInspectorClose,
    viewMode,
    children,
}) => {
    return (
        <PageContainer variant="threecolumn" className="flex flex-col">
            <PageGrid columns={12} className="flex-1 min-h-0 overflow-hidden gap-0">

                {/* --- LEFT COLUMN: Sidebar (sempre 2) --- */}
                {sidebar}

                {/* --- CENTER + RIGHT COLUMNS: Conditional Layout Based on View Mode --- */}
                {viewMode === 'table' && inspectorOpen ? (
                    <>
                        {/* CENTER COLUMN: Content (7 colonne quando inspector è aperto) */}
                        <div
                            className="lg:col-span-7 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden"
                            onClick={() => onInspectorClose?.()}
                        >
                            {/* Toolbar */}
                            <div onClick={(e) => e.stopPropagation()}>
                                {toolbar}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-auto no-scrollbar">
                                {children}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Inspector (3 colonne) */}
                        <div
                            className="lg:col-span-3 flex flex-col bg-white dark:bg-gray-900 overflow-hidden"
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
                        {/* Toolbar */}
                        <div onClick={(e) => e.stopPropagation()}>
                            {toolbar}
                        </div>

                        {/* Content Area */}
                        <div className={cn(
                            "flex-1 overflow-auto no-scrollbar relative transition-all duration-300",
                            // In grid mode, inspector occupa 3 colonne su 12 totali = 25% del totale
                            // Ma il center column è 10/12 = 83.333% del totale
                            // Quindi l'inspector deve occupare (3/12) / (10/12) = 3/10 = 30% del center
                            viewMode === 'grid' && inspectorOpen && "lg:mr-[30%]"
                        )}>
                            {children}
                        </div>

                        {/* Inspector Overlay - only in grid mode (3 colonne) */}
                        {viewMode === 'grid' && inspectorOpen && (
                            <div
                                className="absolute inset-y-0 right-0 lg:w-[30%] w-full bg-white dark:bg-gray-900 shadow-2xl z-20 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
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