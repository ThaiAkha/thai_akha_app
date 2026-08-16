import React, { useState } from 'react';
import { CheckCircle, Circle, Copy } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Button, Icon } from '../ui';
import Typography from '../ui/Typography';
import type { UserProfile } from '@thaiakha/shared/types';

interface CardOverviewBookingProps {
  booking: any;
  menuSelection: any | null;
  userProfile: UserProfile | null;
  companionCount: number;
  onChangeTab: (tab: string) => void;
}

const CardOverviewBooking: React.FC<CardOverviewBookingProps> = ({
  booking,
  menuSelection,
  userProfile,
  companionCount,
  onChangeTab,
}) => {
  const [copied, setCopied] = useState(false);

  const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const classType = booking.class_sessions?.display_name
    || (booking.session_id?.includes('morning') ? 'Morning Class' : 'Evening Class');

  const menuDone     = menuSelection?.booking_id === booking.internal_id;
  const pickupDone   = booking.hotel_name && booking.hotel_name !== 'To be selected';
  const passportDone = userProfile?.dietary_profile && userProfile.dietary_profile !== 'diet_regular';

  const paxCount       = booking.pax_count ?? 1;
  const companionSlots = Math.max(paxCount - 1, 0);
  const companionsDone = companionSlots === 0 || companionCount >= companionSlots;

  const inviteLink = `${window.location.origin}/join-group?ref=${booking.internal_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const steps = [
    {
      key: 'menu',
      label: 'Choose your Menu',
      subtitle: menuDone ? 'Dishes selected — bon appétit!' : 'Select your dishes before the class',
      done: menuDone,
      cta: <Button variant="brand" size="sm" onClick={() => onChangeTab('menu')} className="shrink-0">Choose Menu</Button>,
    },
    {
      key: 'pickup',
      label: 'Choose your Pickup',
      subtitle: pickupDone ? `Hotel: ${booking.hotel_name}` : 'Set your hotel pickup point',
      done: pickupDone,
      cta: <Button variant="brand" size="sm" onClick={() => onChangeTab('reservation')} className="shrink-0">Set Pickup</Button>,
    },
    {
      key: 'passport',
      label: 'Choose your Diet Passport',
      subtitle: passportDone
        ? `Profile set: ${userProfile?.dietary_profile?.replace('diet_', '')}`
        : 'Set your dietary preferences',
      done: passportDone,
      cta: <Button variant="brand" size="sm" onClick={() => onChangeTab('passport')} className="shrink-0">Set Diet</Button>,
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-[2rem] overflow-hidden shadow-sm">

      {/* Header */}
      <div className="[padding:var(--space-fluid-m)] border-b border-border/50">
        <Typography variant="microLabel" color="primary" className="mb-1 block">
          Getting Ready
        </Typography>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon name="calendar_month" className="text-muted text-lg shrink-0" />
            <Typography variant="h5" color="title">{bookingDate}</Typography>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted border border-border rounded-full px-2.5 py-0.5 shrink-0 bg-surface-2">
            {classType}
          </span>
        </div>
      </div>

      {/* Checklist */}
      <div className="[padding:var(--space-fluid-m)] [gap:var(--space-fluid-s)] flex flex-col">

        {/* Steps 1–3 */}
        {steps.map(step => (
          <div
            key={step.key}
            className={cn(
              'flex items-center justify-between gap-4 [padding:var(--space-fluid-s)] rounded-2xl border transition-all duration-300',
              step.done
                ? 'bg-action/5 border-action/20'
                : 'bg-surface-2/50 border-border/50'
            )}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={cn('shrink-0 transition-colors', step.done ? 'text-action' : 'text-muted')}>
                {step.done ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <Typography variant="body" color={step.done ? "title" : "sub"} className="font-bold leading-tight">
                  {step.label}
                </Typography>
                <Typography variant="caption" color="muted" className="mt-0.5 block truncate italic">
                  {step.subtitle}
                </Typography>
              </div>
            </div>
            {step.done
              ? <Icon name="verified" className="text-action/60 shrink-0" />
              : step.cta
            }
          </div>
        ))}

        {/* Step 4: Invite Companions */}
        <div className={cn(
          'rounded-2xl border transition-all duration-300 [padding:var(--space-fluid-s)]',
          companionsDone
            ? 'bg-action/5 border-action/20'
            : 'bg-surface-2/50 border-border/50'
        )}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className={cn('shrink-0 transition-colors', companionsDone ? 'text-action' : 'text-muted')}>
                {companionsDone ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <Typography variant="body" color={companionsDone ? "title" : "sub"} className="font-bold leading-tight">
                  Invite Companions
                </Typography>
                <Typography variant="caption" color="muted" className="mt-0.5 block">
                  {companionSlots === 0
                    ? 'Solo booking — no companions needed'
                    : `${companionCount} of ${companionSlots} companion${companionSlots > 1 ? 's' : ''} registered`
                  }
                </Typography>
              </div>
            </div>
            {companionsDone && <Icon name="verified" className="text-action/60 shrink-0" />}
          </div>

          {/* Invite link — shown when there are companion slots pending */}
          {!companionsDone && companionSlots > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 lg:ml-9">
              <div className="flex-1 bg-surface-3 border border-border/50 rounded-xl px-4 py-2.5 font-mono text-[10px] text-muted truncate min-w-0 select-all">
                {inviteLink}
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  'shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300',
                  copied
                    ? 'text-action border-action bg-action/5'
                    : 'text-sub border-border hover:border-action/50 hover:bg-action/5'
                )}
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CardOverviewBooking;

