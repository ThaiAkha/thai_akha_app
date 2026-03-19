import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Users, Rocket } from 'lucide-react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { cn } from '@thaiakha/shared/lib/utils';
import { Button, Typography, Icon } from '../ui';
import type { UserProfile } from '@thaiakha/shared/types';
import StaffWelcomeCard from './StaffWelcomeCard';
import InviteGroupBlock from './InviteGroupBlock';

interface OverviewViewProps {
  userProfile: UserProfile | null;
  activeBooking: any | null;
  menuSelection: any | null;
  onChangeTab: (tab: string) => void;
  onNavigate: (page: string) => void;
  isStaff: boolean;
}

const STAFF_ROLES = new Set(['admin', 'manager', 'agency', 'kitchen', 'logistics', 'driver']);

const OverviewView: React.FC<OverviewViewProps> = ({
  userProfile,
  activeBooking,
  menuSelection,
  onChangeTab,
  onNavigate,
  isStaff,
}) => {
  const [companionCount, setCompanionCount] = useState<number>(0);

  useEffect(() => {
    if (!userProfile?.id || isStaff) return;
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('managed_by', userProfile.id)
      .then(({ count }) => setCompanionCount(count ?? 0));
  }, [userProfile?.id, isStaff]);

  const menuDone = !!menuSelection;
  const paxCount = activeBooking?.pax_count ?? 0;
  const companionSlots = Math.max(paxCount - 1, 0);
  const companionsDone = companionSlots === 0 || companionCount >= companionSlots;
  const firstName = userProfile?.full_name?.split(' ')[0] || 'Chef';

  /* ── STAFF VIEW ── */
  if (isStaff) {
    return <StaffWelcomeCard userProfile={userProfile} onChangeTab={onChangeTab} />;
  }

  return (
    <div className="space-y-5">

      {/* ── WELCOME HEADER ── */}
      <div className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 rounded-3xl p-6 md:p-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
          Welcome Chef
        </p>
        <Typography variant="h2" color="title" className="leading-tight">
          Welcome back,{' '}
          <span className="text-primary italic">{firstName}</span>
        </Typography>
        {activeBooking ? (
          <p className="text-muted text-sm mt-3">
            Your class is on{' '}
            <span className="text-desc font-bold">
              {new Date(activeBooking.booking_date).toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </p>
        ) : (
          <p className="text-muted text-sm mt-3">
            Ready to start your culinary journey?
          </p>
        )}
      </div>

      {/* ── ONBOARDING CHECKLIST (with booking) ── */}
      {activeBooking ? (
        <div className="bg-surface border border-border rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="checklist" className="text-action text-xl" />
            <Typography variant="h5" color="title">Getting Ready</Typography>
          </div>

          <div className="space-y-3">
            {/* Step 1: Menu */}
            <div className={cn(
              'flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300',
              menuDone
                ? 'bg-action/5 border-action/20'
                : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
            )}>
              <div className="flex items-center gap-4 min-w-0">
                <div className={cn('shrink-0 transition-colors', menuDone ? 'text-action' : 'text-muted')}>
                  {menuDone
                    ? <CheckCircle className="w-5 h-5" />
                    : <Circle className="w-5 h-5" />
                  }
                </div>
                <div className="min-w-0">
                  <p className={cn('font-bold text-sm', menuDone ? 'text-desc' : 'text-sub')}>
                    Choose your Menu
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {menuDone ? 'Dishes selected — bon appétit!' : 'Select your dishes before the class'}
                  </p>
                </div>
              </div>
              {menuDone
                ? <Icon name="verified" className="text-action/60 shrink-0" />
                : <Button variant="brand" size="sm" onClick={() => onChangeTab('menu')} className="shrink-0">
                    Choose Menu
                  </Button>
              }
            </div>

            {/* Step 2: Companions */}
            <div className={cn(
              'flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300',
              companionsDone
                ? 'bg-action/5 border-action/20'
                : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
            )}>
              <div className="flex items-center gap-4 min-w-0">
                <div className={cn('shrink-0 transition-colors', companionsDone ? 'text-action' : 'text-muted')}>
                  {companionsDone
                    ? <CheckCircle className="w-5 h-5" />
                    : <Users className="w-5 h-5" />
                  }
                </div>
                <div className="min-w-0">
                  <p className={cn('font-bold text-sm', companionsDone ? 'text-desc' : 'text-sub')}>
                    Invite Companions
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {companionSlots === 0
                      ? 'Solo booking — no companions needed'
                      : `${companionCount} of ${companionSlots} companion${companionSlots > 1 ? 's' : ''} registered`
                    }
                  </p>
                </div>
              </div>
              {companionsDone
                ? <Icon name="verified" className="text-action/60 shrink-0" />
                : <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-muted border border-border px-3 py-1.5 rounded-full">
                    Pending
                  </span>
              }
            </div>
          </div>
        </div>

      ) : (
        /* ── NO BOOKING STATE ── */
        <div className="bg-surface border border-border rounded-3xl p-8 md:p-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Rocket className="w-7 h-7 text-primary" />
          </div>
          <Typography variant="h4" color="title" className="mb-2">Start Your Journey</Typography>
          <p className="text-sub text-sm mb-6 max-w-xs leading-relaxed">
            Book a cooking class and unlock your personal dashboard, menu, and digital passport.
          </p>
          <Button variant="brand" size="lg" onClick={() => onNavigate('booking')}>
            <Icon name="calendar_add_on" />
            Book a Class
          </Button>
        </div>
      )}

      {/* ── INVITE GROUP BLOCK (only when booking exists) ── */}
      <InviteGroupBlock bookingInternalId={activeBooking?.internal_id ?? null} />

    </div>
  );
};

export default OverviewView;
