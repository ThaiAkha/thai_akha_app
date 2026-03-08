import React from 'react';
import { LayoutGrid, List, RefreshCw, Share2, Plus, Upload } from 'lucide-react';
import SearchInput from '../form/input/SearchInput';
import Tooltip from '../ui/Tooltip';
import { cn } from '../../lib/utils';

type ViewMode = 'table' | 'grid';

/** Shared style for all toolbar icon buttons - premium theme */
const ICON_BTN = "h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-brand-500 hover:border-brand-200 dark:hover:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 cherry-btn-animation";

/** Shared style for primary action button - premium theme */
const PRIMARY_BTN = "h-9 px-4 inline-flex items-center gap-2 rounded-lg border border-brand-500 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest cherry-shadow-brand cherry-btn-animation disabled:opacity-50 disabled:cursor-not-allowed";

interface DataExplorerToolbarProps {
    // View mode toggle
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    showViewMode?: boolean;
    // Refresh
    onRefresh?: () => void;
    isRefreshing?: boolean;
    // Logistics controls (drivers, mode toggle, etc)
    logisticsControls?: React.ReactNode;
    // Export / Share
    onExportClick?: () => void;
    exportDropdown?: React.ReactNode;
    // Primary action (New Row / Upload)
    primaryAction?: React.ReactNode;
    primaryActionType?: 'new' | 'upload';
    onPrimaryAction?: () => void;
    // Search
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    showSearch?: boolean;
}

const DataExplorerToolbar: React.FC<DataExplorerToolbarProps> = ({
    viewMode,
    onViewModeChange,
    onRefresh,
    isRefreshing = false,
    logisticsControls,
    onExportClick,
    exportDropdown,
    primaryAction,
    primaryActionType = 'new',
    onPrimaryAction,
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Search...',
    showViewMode = true,
    showSearch = true,
}) => {
    // Primary action button default se non fornito primaryAction
    const defaultPrimaryAction = onPrimaryAction && (
        <button
            type="button"
            onClick={onPrimaryAction}
            className={PRIMARY_BTN}
            aria-label={primaryActionType === 'new' ? 'Create new item' : 'Upload files'}
        >
            {primaryActionType === 'new' ? (
                <>
                    <Plus className="w-4 h-4" />
                    <span>NUOVO</span>
                </>
            ) : (
                <>
                    <Upload className="w-4 h-4" />
                    <span>CARICA</span>
                </>
            )}
        </button>
    );

    return (
        <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-white dark:bg-gray-950/20 shrink-0">
            {/* 1. View Mode Toggle */}
            {showViewMode && (
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800">
                    <Tooltip content="Switch to table view" position="bottom">
                        <button
                            type="button"
                            onClick={() => onViewModeChange('table')}
                            aria-label="Switch to table view"
                            aria-pressed={viewMode === 'table'}
                            className={cn(
                                "h-9 w-9 flex items-center justify-center transition-colors",
                                viewMode === 'table'
                                    ? "bg-orange-500 text-white hover:bg-orange-600"
                                    : "text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </Tooltip>
                    <Tooltip content="Switch to grid view" position="bottom">
                        <button
                            type="button"
                            onClick={() => onViewModeChange('grid')}
                            aria-label="Switch to grid view"
                            aria-pressed={viewMode === 'grid'}
                            className={cn(
                                "h-9 w-9 flex items-center justify-center transition-colors",
                                viewMode === 'grid'
                                    ? "bg-orange-500 text-white hover:bg-orange-600"
                                    : "text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
            )}

            {/* Divider */}
            {(onRefresh || logisticsControls || onExportClick || exportDropdown) && (
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            )}

            {/* 2. Refresh */}
            {onRefresh && (
                <Tooltip
                    content={isRefreshing ? "Refreshing..." : "Refresh data"}
                    position="bottom"
                >
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh data"
                        aria-busy={isRefreshing}
                        className={cn(ICON_BTN, isRefreshing && "opacity-50 cursor-not-allowed")}
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                    </button>
                </Tooltip>
            )}

            {/* Logistics Controls (Driver Pills, Mode Toggle) */}
            {logisticsControls}

            {/* 3. Export / Share */}
            {(onExportClick || exportDropdown) && (
                <div className="relative">
                    <Tooltip content="Export options" position="bottom">
                        <button
                            type="button"
                            onClick={onExportClick}
                            aria-label="Open export options"
                            className={ICON_BTN}
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </Tooltip>
                    {exportDropdown}
                </div>
            )}

            {/* 4. Primary Action */}
            {primaryAction || defaultPrimaryAction}

            {/* 5. Search */}
            {showSearch && (
                <div className="w-72 md:w-80 lg:w-96">
                    <Tooltip content="Filter items by text" position="bottom">
                        <div>
                            <SearchInput
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onClear={() => onSearchChange('')}
                                containerClassName="w-full"
                                aria-label="Search"
                            />
                        </div>
                    </Tooltip>
                </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />
        </div>
    );
};

export default DataExplorerToolbar;
export { ICON_BTN, PRIMARY_BTN };