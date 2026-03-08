import DataRowText from './DataRowText';
import { cn } from '../../lib/utils';

interface DataCardContentProps {
    title: string;
    subtitle?: string;
    badges?: React.ReactNode;
    footerLeft?: React.ReactNode;
    footerRight?: React.ReactNode;
    titleClassName?: string;
}

const DataCardContent: React.FC<DataCardContentProps> = ({
    title,
    subtitle,
    badges,
    footerLeft,
    footerRight,
    titleClassName
}) => {
    return (
        <div className="flex flex-col h-full gap-2">
            <DataRowText
                title={title}
                description={subtitle}
                titleClassName={cn("text-theme-base", titleClassName)}
                className="gap-1.5"
            />

            {badges && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {badges}
                </div>
            )}

            {(footerLeft || footerRight) && (
                <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50 dark:border-gray-800/10">
                    <div className="flex-1 truncate mr-2">
                        {footerLeft}
                    </div>
                    <div className="shrink-0">
                        {footerRight}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataCardContent;
