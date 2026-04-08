import React from 'react';
import { User, Crown, Truck, ChefHat, BookOpen, Shield, GraduationCap } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import GlassCard from '../ui/GlassCard';
import Typography from '../ui/Typography';
import type { UserProfile } from '@thaiakha/shared/types';

interface UserProfileCardProps {
  userProfile: UserProfile | null;
  activeTab?: string;
}

const ROLE_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  admin:     { label: 'Admin',       className: 'bg-primary/10 text-primary border-primary/20',                         icon: <Crown className="w-4 h-4" /> },
  manager:   { label: 'Manager',     className: 'bg-primary/10 text-primary border-primary/20',                         icon: <Shield className="w-4 h-4" /> },
  agency:    { label: 'Agency',      className: 'bg-btn-p/10 text-btn-p border-btn-p/20',                              icon: <BookOpen className="w-4 h-4" /> },
  kitchen:   { label: 'Kitchen',     className: 'bg-action/10 text-action-700 dark:text-action border-action/20',       icon: <ChefHat className="w-4 h-4" /> },
  logistics: { label: 'Logistics',   className: 'bg-btn-s/10 text-btn-s border-btn-s/20',                              icon: <Truck className="w-4 h-4" /> },
  driver:    { label: 'Driver',      className: 'bg-btn-s/10 text-btn-s border-btn-s/20',                              icon: <Truck className="w-4 h-4" /> },
  alumni:    { label: 'Alumni Chef', className: 'bg-secondary/10 text-secondary border-secondary/20',                  icon: <GraduationCap className="w-4 h-4" /> },
  guest:     { label: 'Guest Chef',  className: 'bg-surface-2 text-sub border-border',                                  icon: <User className="w-4 h-4" /> },
};

const UserProfileCard: React.FC<UserProfileCardProps> = ({ userProfile, activeTab }) => {
  if (!userProfile) return null;

  const role = (userProfile.role as string) || 'guest';
  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.guest;

  const initials = userProfile.full_name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const dietLabel = userProfile.dietary_profile && userProfile.dietary_profile !== 'diet_regular'
    ? userProfile.dietary_profile.replace('diet_', '').replace('_', ' ')
    : null;

  return (
    <GlassCard variant="primary" innerClassName="[padding:var(--space-fluid-m)]">
      {/* Avatar + Info Row — horizontal on mobile, vertical on desktop */}
      <div className="flex flex-row lg:flex-col items-center lg:items-start [gap:var(--space-fluid-s)]">

        {/* Avatar */}
        <div className="relative shrink-0">
          {userProfile.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt={userProfile.full_name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-border shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-action/20 flex items-center justify-center ring-2 ring-border shadow-sm">
              <span className="text-xl font-black text-primary">{initials}</span>
            </div>
          )}
          {/* Online dot */}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-action rounded-full border-2 border-surface" />
        </div>

        {/* Name + email + badge */}
        <div className="min-w-0 flex-1 lg:mt-3 w-full">
          <Typography variant="body" className="font-bold leading-tight truncate" color="title">
            {userProfile.full_name}
          </Typography>
          <Typography variant="caption" color="muted" className="mt-0.5 truncate block">
            {userProfile.email}
          </Typography>
          
          {/* Role badge */}
          <div className={cn(
            'inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full',
            'text-[10px] font-bold uppercase tracking-wider border transition-colors',
            roleConfig.className
          )}>
            {roleConfig.icon}
            {roleConfig.label}
          </div>
        </div>
      </div>

      {/* Dietary profile */}
      {dietLabel && (
        <div className="[margin-top:var(--space-fluid-m)] [padding-top:var(--space-fluid-m)] border-t border-border/50">
          <Typography variant="microLabel" className="mb-1 block">Dietary</Typography>
          <Typography variant="caption" className="font-semibold capitalize" color="sub">
            {dietLabel}
          </Typography>
        </div>
      )}

      {/* Passport tab indicator */}
      {activeTab === 'passport' && (
        <div className="[margin-top:var(--space-fluid-m)] [padding-top:var(--space-fluid-m)] border-t border-border/50 flex items-center gap-2">
          <span className="material-symbols-rounded text-action text-base">verified_user</span>
          <Typography variant="microLabel" color="action">Digital Passport</Typography>
        </div>
      )}
    </GlassCard>
  );
};

export default UserProfileCard;

