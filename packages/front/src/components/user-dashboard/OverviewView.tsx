import React from 'react';
import { Rocket } from 'lucide-react';
import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Button, Typography, Icon } from '../ui';
import type { UserProfile, UserDashboardBooking, DashboardMenuSelection } from '@thaiakha/shared/types';
import StaffWelcomeCard from './StaffWelcomeCard';
import CardOverviewBooking from './CardOverviewBooking';

interface OverviewViewProps {
  userProfile: UserProfile | null;
  bookings: UserDashboardBooking[];
  menuSelection: DashboardMenuSelection | null;
  onChangeTab: (tab: string) => void;
  onNavigate: (page: string) => void;
  isStaff: boolean;
}

/** Prefisso 'user': dato dell'utente loggato, rimosso al logout (App.handleLogout). */
const companionCountQueryKey = (userId: string) => ['user', 'companion_count', userId] as const;

const OverviewView: React.FC<OverviewViewProps> = ({
  userProfile,
  bookings,
  menuSelection,
  onChangeTab,
  onNavigate,
  isStaff,
}) => {
  const userId = userProfile?.id ?? '';
  // Compagni gestiti dall'host (profiles.managed_by). Era `useEffect + useState` (CLAUDE.md #17).
  const { data: companionCount = 0 } = useQuery({
    queryKey: companionCountQueryKey(userId),
    enabled: Boolean(userId) && !isStaff,
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('managed_by', userId);
      return count ?? 0;
    },
    // I compagni si aggiungono dal Passport: si riconta a ogni mount della tab, come prima.
    staleTime: 0,
  });

  /* ── STAFF VIEW ── */
  if (isStaff) {
    return <StaffWelcomeCard userProfile={userProfile} onChangeTab={onChangeTab} />;
  }

  /* ── NO BOOKING STATE ── */
  if (bookings.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-3xl p-8 md:p-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Rocket className="w-7 h-7 text-primary" />
        </div>
        <Typography variant="h4" color="title" className="mb-2">Start Your Journey</Typography>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-xs leading-relaxed">
          Book a cooking class and unlock your personal dashboard, menu, and digital passport.
        </p>
        <Button variant="brand" size="lg" onClick={() => onNavigate('booking')}>
          <Icon name="calendar_add_on" />
          Book a Class
        </Button>
      </div>
    );
  }

  return (
    <div className="[space-y:var(--space-fluid-l)]">
      {bookings.map(booking => (
        <CardOverviewBooking
          key={booking.internal_id}
          booking={booking}
          menuSelection={menuSelection}
          userProfile={userProfile}
          companionCount={companionCount}
          onChangeTab={onChangeTab}
        />
      ))}
    </div>
  );
};

export default OverviewView;
