/**
 * TransportModeSelector
 * "Need Pickup" / "Go Myself" 2-column button grid.
 */

import React from 'react';
import { Icon } from '../../ui';
import { cn } from '@thaiakha/shared/lib/utils';
import type { TransportMode } from '../hooks/useLocationState';

interface TransportModeSelectorProps {
  value: TransportMode;
  onChange: (mode: TransportMode) => void;
}

const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({ value, onChange }) => (
  <div className="grid grid-cols-2 gap-2">
    <button
      onClick={() => onChange('pickup')}
      className={cn(
        'flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all',
        value === 'pickup'
          ? 'bg-action/10 border-action text-white'
          : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20',
      )}
    >
      <Icon
        name="local_taxi"
        size="sm"
        className={cn('shrink-0', value === 'pickup' ? 'text-action' : '')}
      />
      <span className="text-[11px] font-black uppercase tracking-wide leading-tight">
        Need Pickup
      </span>
      {value === 'pickup' && (
        <Icon name="check_circle" size="xs" className="text-action ml-auto shrink-0" />
      )}
    </button>

    <button
      onClick={() => onChange('self')}
      className={cn(
        'flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all',
        value === 'self'
          ? 'bg-blue-500/10 border-blue-500 text-white'
          : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20',
      )}
    >
      <Icon
        name="directions_walk"
        size="sm"
        className={cn('shrink-0', value === 'self' ? 'text-blue-400' : '')}
      />
      <span className="text-[11px] font-black uppercase tracking-wide leading-tight">
        Go Myself
      </span>
      {value === 'self' && (
        <Icon name="check_circle" size="xs" className="text-blue-400 ml-auto shrink-0" />
      )}
    </button>
  </div>
);

export default TransportModeSelector;
