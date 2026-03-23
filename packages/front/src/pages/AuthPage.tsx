import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Badge, StatCard
} from '../components/ui/index';
import { CinematicBackground } from '../components/layout/index';
import AuthForm from '../components/auth/AuthForm';
import { contentService, PageFeature } from '@thaiakha/shared';
import type { StatCardProps } from '../components/ui/card/StatCard';

interface AuthPageProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, onAuthSuccess }) => {
  const [meta, setMeta] = useState<{
    titleMain?: string | null;
    titleHighlight?: string | null;
    description?: string | null;
    imageUrl?: string;
    features?: PageFeature[] | null;
  } | null>(null);

  useEffect(() => {
    contentService.getPageMetadata('auth').then(setMeta);
  }, []);

  const features: PageFeature[] = meta?.features ?? [];

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden font-sans selection:bg-primary/30">
      <CinematicBackground
        isLoaded={!!meta?.imageUrl}
        imageUrl={meta?.imageUrl ?? ''}
      />

      {/* --- LEFT COLUMN: NARRATIVE SIDE (Desktop Only) --- */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-end p-12 lg:pr-16 relative overflow-hidden">

        <div className="absolute inset-0 z-0" />

        <div className="relative z-10 space-y-10 animate-in slide-in-from-left duration-1000 ease-cinematic max-w-lg text-right">

          <div className="space-y-4">
            <Typography variant="titleMain">
              {meta?.titleMain}{' '}
              <Typography variant="titleHighlight" color="action" as="span">
                {meta?.titleHighlight}
              </Typography>
            </Typography>
            {meta?.description && (
              <Typography variant="paragraphM">
                {meta.description}
              </Typography>
            )}
          </div>

          {features.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mt-4">
              {features.map((feature) => (
                <StatCard
                  key={feature.icon}
                  icon={feature.icon}
                  color={feature.color as StatCardProps['color']}
                  value={feature.title}
                  description={feature.body}
                  size="sm"
                  iconPosition="right"
                  align="right"
                  valuePosition="bottom"
                  bordered={false}
                  shadow={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT COLUMN: ACTION SIDE (AuthForm) --- */}
      <div className="flex-1 flex flex-col items-center md:items-start justify-center p-6 md:p-12 lg:pl-16 relative z-10">
        {/* Mobile Backdrop Overlay */}
        <div className="md:hidden absolute inset-0 bg-black/60 backdrop-blur-sm -z-10" />

        <div className="w-full max-w-[440px] animate-in slide-in-from-bottom-8 duration-1000 ease-cinematic">
          <Card variant="glass" padding="none" className="bg-surface-overlay/80 border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
            <AuthForm onSuccess={onAuthSuccess} onNavigate={onNavigate} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
