import React from 'react';
import { Link } from 'react-router';
import type { IconName } from '../../lib/iconRegistry';
import Icon from '../ui/Icon';
import { Heading, Paragraph } from '../typography';
import { cn } from '@thaiakha/shared/lib/utils';
import Card from '../ui/Card';

export interface BasicCardProps {
    path?: string;
    iconName?: string | IconName;
    label: string;
    description?: string;
    className?: string;
}

const BasicCard: React.FC<BasicCardProps> = ({
    path = '#',
    iconName,
    label,
    description,
    className
}) => {
    return (
        <Link to={path} className="group">
            <Card className={cn(
                'flex items-start gap-4 transition-all duration-200',
                'hover:shadow-lg hover:translate-y-0.5',
                className
            )}>
                <Icon name={iconName as IconName} variant="compact" />

                <div className="flex-1 min-w-0">
                    <Heading level="h4" className="truncate">
                        {label}
                    </Heading>

                    {description && (
                        <Paragraph size="sm" color="secondary" className="mt-1 truncate">
                            {description}
                        </Paragraph>
                    )}
                </div>
            </Card>
        </Link>
    );
};

export default BasicCard;
