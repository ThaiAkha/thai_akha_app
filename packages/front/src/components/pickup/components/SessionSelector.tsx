/**
 * SessionSelector
 * Morning / Evening chip toggle shown at the top of the pickup sidebar.
 */

import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface SessionSelectorProps {
  value: 'morning' | 'evening';
  onChange: (v: 'morning' | 'evening') => void;
}

const SessionSelector: React.FC<SessionSelectorProps> = ({ value, onChange }) => (
  <div className="flex justify-center">
    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
      <button
        onClick={() => onChange('morning')}
        className={cn(
          'px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all',
          value === 'morning' ? 'bg-white text-black' : 'text-white/40',
        )}
      >
        Morning
      </button>
      <button
        onClick={() => onChange('evening')}
        className={cn(
          'px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all',
          value === 'evening' ? 'bg-secondary text-white' : 'text-white/40',
        )}
      >
        Evening
      </button>
    </div>
  </div>
);

export default SessionSelector;
