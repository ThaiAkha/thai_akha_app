import React, { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Button, Typography, Icon } from '../ui';
import type { UserProfile } from '@thaiakha/shared/types';
import StaffWelcomeCard from './StaffWelcomeCard';
import CardOverviewBooking from './CardOverviewBooking';

interface OverviewViewProps {
  userProfile: UserProfile | null;
  bookings: any[];
  menuSelection: any | null;
  onChangeTab: (tab: string) => void;
  onNavigate: (page: string) => void;
  isStaff: boolean;
}

const OverviewView: React.FC<OverviewViewProps> = ({
  userProfile,
  bookings,
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
    <div className="space-y-5">
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
