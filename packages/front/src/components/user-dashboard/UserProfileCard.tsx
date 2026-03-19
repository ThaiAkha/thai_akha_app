import React from 'react';
import { User, Crown, Truck, ChefHat, BookOpen, Shield, GraduationCap } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import type { UserProfile } from '@thaiakha/shared/types';

interface UserProfileCardProps {
  userProfile: UserProfile | null;
}

const ROLE_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  admin:     { label: 'Admin',       className: 'bg-primary/10 text-primary border-primary/20',                         icon: <Crown className="w-3 h-3" /> },
  manager:   { label: 'Manager',     className: 'bg-primary/10 text-primary border-primary/20',                         icon: <Shield className="w-3 h-3" /> },
  agency:    { label: 'Agency',      className: 'bg-btn-p/10 text-btn-p border-btn-p/20',                              icon: <BookOpen className="w-3 h-3" /> },
  kitchen:   { label: 'Kitchen',     className: 'bg-action/10 text-action-700 dark:text-action border-action/20',       icon: <ChefHat className="w-3 h-3" /> },
  logistics: { label: 'Logistics',   className: 'bg-btn-s/10 text-btn-s border-btn-s/20',                              icon: <Truck className="w-3 h-3" /> },
  driver:    { label: 'Driver',      className: 'bg-btn-s/10 text-btn-s border-btn-s/20',                              icon: <Truck className="w-3 h-3" /> },
  alumni:    { label: 'Alumni Chef', className: 'bg-secondary/10 text-secondary border-secondary/20',                  icon: <GraduationCap className="w-3 h-3" /> },
  guest:     { label: 'Guest Chef',  className: 'bg-gray-100 dark:bg-white/10 text-sub border-border dark:border-white/10', icon: <User className="w-3 h-3" /> },
};

const UserProfileCard: React.FC<UserProfileCardProps> = ({ userProfile }) => {
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
    <div className="bg-surface border border-border rounded-3xl p-5 md:p-6 shadow-sm">
      {/* Avatar + Info Row — horizontal on mobile, vertical on desktop */}
      <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4">

        {/* Avatar */}
        <div className="relative shrink-0">
          {userProfile.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt={userProfile.full_name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-action/20 flex items-center justify-center ring-2 ring-border">
              <span className="text-xl font-black text-primary">{initials}</span>
            </div>
          )}
          {/* Online dot */}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-action rounded-full border-2 border-surface" />
        </div>

        {/* Name + email + badge */}
        <div className="min-w-0 flex-1 lg:mt-3 w-full">
          <p className="font-bold text-title text-base leading-tight truncate">
            {userProfile.full_name}
          </p>
          <p className="text-muted text-xs mt-0.5 truncate">
            {userProfile.email}
          </p>
          {/* Role badge */}
          <div className={cn(
            'inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full',
            'text-[10px] font-bold uppercase tracking-wider border',
            roleConfig.className
          )}>
            {roleConfig.icon}
            {roleConfig.label}
          </div>
        </div>
      </div>

      {/* Dietary profile */}
      {dietLabel && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Dietary</p>
          <p className="text-sub text-xs font-semibold capitalize">{dietLabel}</p>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;
