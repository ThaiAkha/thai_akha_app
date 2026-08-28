import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, UserRound } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import { useWorkers, useMyWorkerId } from '@thaiakha/shared/hooks/useWorkers';
import type { Worker, WorkerRole } from '@thaiakha/shared/types/workers.types';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/avatar/Avatar';

/**
 * "Who are you?" - picks the PERSON (authors) doing an action on a shared login.
 * The login (profiles) decides what can be done; the worker says who is doing it.
 * - `roles` = the FUNCTION of the screen (teacher flow → ['teacher'], logistics → ['logistics','setup']).
 * - Remembers the last choice per (device, roles) in localStorage.
 * - AUTO-BYPASS: when the logged profile is linked to a worker (authors.profile_id),
 *   the selector fills itself and collapses to a name chip (tap to change).
 */
interface WorkerSelectorProps {
  roles: readonly WorkerRole[];
  value: string | null;
  onChange: (workerId: string | null, worker: Worker | null) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const storageKey = (roles: readonly WorkerRole[]) => `takw_worker_${[...roles].sort().join('-')}`;
const readLast = (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } };
const writeLast = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };

export const WorkerSelector: React.FC<WorkerSelectorProps> = ({ roles, value, onChange, label, className, disabled }) => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { workers, loading } = useWorkers(roles);
  const { workerId: myWorkerId, resolved } = useMyWorkerId(user?.id);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false); // auto-bypass chip → tapped to change
  const rootRef = useRef<HTMLDivElement>(null);
  const key = useMemo(() => storageKey(roles), [roles]);

  const selected = useMemo(() => workers.find(w => w.id === value) ?? null, [workers, value]);
  const isMine = !!myWorkerId && workers.some(w => w.id === myWorkerId);

  // Preselect once the list is ready: linked worker (auto-bypass) → last choice on this device.
  useEffect(() => {
    if (value || loading || !resolved || workers.length === 0) return;
    const pick = (isMine ? myWorkerId : null) ?? readLast(key);
    const w = workers.find(x => x.id === pick);
    if (w) onChange(w.id, w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, resolved, workers, isMine, myWorkerId, key]);

  // Close on outside tap.
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const choose = (w: Worker) => {
    writeLast(key, w.id);
    onChange(w.id, w);
    setOpen(false);
    setExpanded(false);
  };

  const heading = label ?? t('worker.whoAreYou', { defaultValue: 'Who are you?' });

  // Auto-bypass chip: linked login, no question asked - just the name, tap to change.
  if (isMine && selected && !expanded) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Avatar src={selected.avatarUrl ?? undefined} alt={selected.name} size="small" />
        <span className="text-sm font-bold text-title truncate">{selected.name}</span>
        {!disabled && (
          <button type="button" onClick={() => { setExpanded(true); setOpen(true); }}
            className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 hover:underline">
            {t('worker.change', { defaultValue: 'Change' })}
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <span className="block mb-1.5 text-xs font-black uppercase tracking-widest text-sub">{heading}</span>
      <button
        type="button"
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full min-h-12 flex items-center gap-3 px-3 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-60',
          selected
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
        )}
      >
        {selected
          ? <Avatar src={selected.avatarUrl ?? undefined} alt={selected.name} size="small" />
          : <span className="size-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400"><UserRound className="w-4 h-4" /></span>}
        <span className={cn('flex-1 truncate text-sm font-bold', selected ? 'text-title' : 'text-sub')}>
          {loading ? t('worker.loading', { defaultValue: 'Loading…' }) : selected ? selected.name : t('worker.select', { defaultValue: 'Select your name' })}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <ul role="listbox" className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1">
          {workers.length === 0 && (
            <li className="px-3 py-3 text-xs font-bold uppercase text-sub">{t('worker.none', { defaultValue: 'No staff for this task' })}</li>
          )}
          {workers.map(w => {
            const active = w.id === value;
            return (
              <li key={w.id} role="option" aria-selected={active}>
                <button type="button" onClick={() => choose(w)}
                  className={cn('w-full min-h-12 flex items-center gap-3 px-3 rounded-lg text-left transition-colors',
                    active ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50')}>
                  <Avatar src={w.avatarUrl ?? undefined} alt={w.name} size="small" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-title truncate">{w.name}</span>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-sub truncate">
                      {w.roles.map(r => t(`worker.roles.${r}`, { defaultValue: r })).join(' · ')}
                    </span>
                  </span>
                  {active && <Check className="w-4 h-4 text-primary-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default WorkerSelector;
