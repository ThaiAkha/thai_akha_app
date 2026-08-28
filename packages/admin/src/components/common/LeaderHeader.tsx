import React from 'react';
import { Crown, Luggage } from 'lucide-react';
import Avatar from '../ui/avatar/Avatar';
import BadgePaxNumber from '../ui/badge/BadgePaxNumber';
import ContactLinks from './ContactLinks';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * LeaderHeader — header unificato della colonna destra (inspector) con le info del
 * leader di un gruppo/booking: avatar, nome, badge ruolo, booking ref e contatti.
 * Sostituisce le copie divergenti in ReservationInspector / KitchenBookings / ReservationContent.
 * L'avatar usa il fallback iniziali dell'Avatar canonico → niente più URL ui-avatars.
 * (Il driver in-cab — TransportStopCard — resta fuori: card a sé.)
 */
export interface LeaderInfo {
  name: string;
  avatarUrl?: string | null;
  /** 'agency' mostra il badge Agency accanto al nome. */
  role?: string | null;
  bookingRef?: string | null;
  phone?: string | null;
  agencyPhone?: string | null;
  email?: string | null;
  lineId?: string | null;
  /** Pax badge (BadgePaxNumber) nell'header. */
  pax?: number;
  /** Luggage badge se presente: true = solo icona · number = icona + conteggio. */
  luggage?: boolean | number;
}

export interface LeaderHeaderProps {
  leader: LeaderInfo;
  /** md = inspector pieno (default) · sm = compatto */
  density?: 'sm' | 'md';
  /** Etichetta eyebrow (default "Group leader"). */
  label?: string;
  /** Se fornito, abilita l'azione WhatsApp sul telefono. */
  onWhatsApp?: (phone: string) => void;
  /** Testo quando non ci sono contatti (default: blocco nascosto). */
  emptyContactsLabel?: string;
  className?: string;
}

const initialsOf = (name: string): string =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';

const LeaderHeader: React.FC<LeaderHeaderProps> = ({
  leader,
  density = 'md',
  label = 'Group leader',
  onWhatsApp,
  emptyContactsLabel,
  className,
}) => {
  const md = density === 'md';

  return (
    <div className={cn('flex items-start gap-3 pb-5 border-b border-gray-100 dark:border-gray-800', className)}>
      <Avatar
        src={leader.avatarUrl || undefined}
        alt={leader.name}
        size={md ? 'xlarge' : 'large'}
        fallback={<span className={cn('font-black text-sub', md ? 'text-base' : 'text-sm')}>{initialsOf(leader.name)}</span>}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-sub">
          <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {label}
          {leader.role === 'agency' && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded shrink-0">
              Agency
            </span>
          )}
        </div>
        <div className={cn('mt-0.5 font-black text-title truncate', md ? 'text-lg' : 'text-base')}>
          {leader.name}
        </div>
        {leader.bookingRef && <div className="text-sm font-mono text-sub truncate mt-1">{leader.bookingRef}</div>}
        <ContactLinks
          className="mt-2"
          phone={leader.phone}
          agencyPhone={leader.agencyPhone}
          email={leader.email}
          lineId={leader.lineId}
          onWhatsApp={onWhatsApp}
          emptyLabel={emptyContactsLabel}
        />
      </div>
      {/* Corner alto a destra: pax + luggage badge */}
      {(leader.pax != null || leader.luggage) && (
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {leader.pax != null && <BadgePaxNumber paxCount={leader.pax} size="md" />}
          {leader.luggage ? (
            <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-400 dark:border-amber-500 text-amber-600 dark:text-amber-400">
              <Luggage className="w-4 h-4" />
              {typeof leader.luggage === 'number' && <span className="text-sm font-black tabular-nums">{leader.luggage}</span>}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default LeaderHeader;
