import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import GlassCard from '../ui/GlassCard';
import Typography from '../ui/Typography';

interface ClassHeroCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  className?: string;
}

const ClassHeroCard: React.FC<ClassHeroCardProps> = ({
  title,
  description,
  icon,
  badge,
  className
}) => {
  return (
    <GlassCard variant="secondary" className={cn('rounded-3xl overflow-hidden', className)}>
      <div className="relative p-6 md:p-10">
        {/* Badge */}
        {badge && (
          <div className="mb-4">
            <Typography variant="badge" color="primary" className="inline-block px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
              {badge}
            </Typography>
          </div>
        )}

        {/* Hero content */}
        <div className="flex items-start gap-4 mb-6">
          {icon && (
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-action/20 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <Typography variant="h3" className="mb-3">
              {title}
            </Typography>
            <Typography variant="paragraphM" color="sub">
              {description}
            </Typography>
          </div>
        </div>

        {/* Accent line */}
        <div className="h-1 w-12 bg-gradient-to-r from-secondary to-action rounded-full mt-6" />
      </div>
    </GlassCard>
  );
};

export default ClassHeroCard;
