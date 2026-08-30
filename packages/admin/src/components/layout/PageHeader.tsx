import React from "react";
import { Paragraph } from '../typography';
import { cn } from "@thaiakha/shared/lib/utils";
import { Heading } from "../typography";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    children,
    className,
}) => {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8",
                className
            )}
        >
            <div className="flex-1 text-center sm:text-left">
                <Heading level="h2" className="font-black uppercase tracking-tighter">
                    {title}
                </Heading>
                {subtitle && (
                    <Paragraph size="sm" color="secondary" className="mt-1 hidden sm:block font-medium">
                        {subtitle}
                    </Paragraph>
                )}
            </div>
            <div className="flex items-center gap-3">
                {children}
            </div>
        </div>
    );
};

export default PageHeader;
