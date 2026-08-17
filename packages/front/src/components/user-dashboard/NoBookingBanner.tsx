import React from 'react';
import { t } from '../../i18n';

interface NoBookingBannerProps {
  onNavigate: (page: string) => void;
}

/**
 * Empty state shown when the user has no active booking. Mirrors the "My Reservation"
 * empty state so the Menu flow behaves identically: a customer cannot pick a menu
 * without a booking — they get a clear banner that routes them to booking instead.
 */
export const NoBookingBanner: React.FC<NoBookingBannerProps> = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-3xl text-center px-6">
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
      <span className="material-symbols-rounded text-primary text-3xl">event_busy</span>
    </div>
    <p className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">{t('user:noActiveBooking')}</p>
    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-xs">{t('user:noActiveBookingHint')}</p>
    <button
      onClick={() => onNavigate('booking')}
      className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-primary/90 transition-colors"
    >
      <span className="material-symbols-rounded text-xl">calendar_add_on</span>
      {t('user:bookClass')}
    </button>
  </div>
);

export default NoBookingBanner;
