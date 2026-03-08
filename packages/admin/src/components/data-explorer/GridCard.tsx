import React from 'react';
import { cn } from '../../lib/utils';

interface GridCardProps {
    item: Record<string, any>;
    selected?: boolean;
    onClick?: () => void;
    imageUrl?: string;
    imageIcon?: React.ReactNode;
    imageOverlay?: React.ReactNode;
    renderFields: (item: Record<string, any>) => React.ReactNode;
    className?: string;
}

const GridCard: React.FC<GridCardProps> = ({
    item,
    selected = false,
    onClick,
    imageUrl,
    imageIcon,
    imageOverlay,
    renderFields,
    className,
}) => {
    return (
        <div
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            className={cn(
                "group relative flex flex-col rounded-xl border transition-all cursor-pointer bg-white dark:bg-gray-900 overflow-hidden",
                selected
                    ? "border-orange-500 ring-1 ring-orange-500/50 shadow-lg"
                    : "border-gray-200 dark:border-gray-800 hover:border-orange-300 shadow-sm",
                className
            )}
        >
            {/* Thumbnail - Fixed 1:1 Aspect Ratio */}
            <div className="aspect-square flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800/50 relative">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="text-gray-400 group-hover:text-orange-500 transition-colors">
                        {imageIcon}
                    </div>
                )}

                {/* Optional Overlay on Hover */}
                {imageOverlay && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                        <div onClick={(e) => e.stopPropagation()}>
                            {imageOverlay}
                        </div>
                    </div>
                )}
            </div>

            {/* Fields */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex-1">
                {renderFields(item)}
            </div>
        </div>
    );
};

export default GridCard;