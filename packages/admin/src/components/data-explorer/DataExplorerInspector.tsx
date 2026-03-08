import React from 'react';
import { X } from 'lucide-react';
import Button from '../ui/button/Button';
import Tooltip from '../ui/Tooltip';

import SectionHeader from '../ui/SectionHeader';

interface DataExplorerInspectorProps {
    title?: string;
    headerActions?: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    isEditing?: boolean;
}

const DataExplorerInspector: React.FC<DataExplorerInspectorProps> = ({
    title = 'Details',
    headerActions,
    onClose,
    children,
    className = '',
    isEditing = false,
}) => {
    return (
        <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
            {/* Header */}
            <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <SectionHeader title={title} variant="title" className="text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex items-center gap-2">
                    {headerActions}
                    <Tooltip content={isEditing ? "Close and Cancel" : "Close"} position="left">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            size="icon"
                            className={`h-9 w-9 p-0 shadow-sm transition-all active:scale-95 flex items-center justify-center ${isEditing
                                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40"
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                }`}
                        >
                            <X className={`w-5 h-5 ${isEditing ? "text-red-600" : "text-gray-500 dark:text-gray-400"}`} />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                {children}
            </div>
        </div>
    );
};

export default DataExplorerInspector;
