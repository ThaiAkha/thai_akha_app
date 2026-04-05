import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BOOKING_PHONE_PREFIXES, getCountryFlag } from '@thaiakha/shared/data';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '..';

const EMPTY_OPTION = { dialCode: '', name: 'No prefix / Other', countryCode: '', label: '' };
type PrefixOption = typeof EMPTY_OPTION;

export interface PhonePrefixSelectProps {
  value: string;
  onChange: (dialCode: string) => void;
  className?: string;
  error?: boolean;
}

export const PhonePrefixSelect: React.FC<PhonePrefixSelectProps> = ({ value, onChange, className, error = false }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = value ? BOOKING_PHONE_PREFIXES.find(p => p.dialCode === value) ?? null : null;

  const allOptions: PrefixOption[] = [EMPTY_OPTION, ...BOOKING_PHONE_PREFIXES];
  const filtered = query.trim() === ''
    ? allOptions
    : allOptions.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.countryCode.toLowerCase().startsWith(query.toLowerCase()) ||
        p.dialCode.startsWith(query.startsWith('+') ? query : `+${query}`)
      );

  const close = useCallback(() => { setIsOpen(false); setQuery(''); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [close]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  const handleOpen = () => {
    setIsOpen(true);
    setQuery('');
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const handleSelect = (opt: PrefixOption) => {
    onChange(opt.dialCode);
    close();
  };

  const handleAutofill = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    const match = BOOKING_PHONE_PREFIXES.find(
      p => p.dialCode === raw || p.countryCode.toUpperCase() === raw.toUpperCase()
    );
    if (match) onChange(match.dialCode);
    else if (raw === '') onChange('');
  };

  return (
    <div ref={containerRef} className={cn('relative shrink-0', className)}>
      {/* Hidden hint for browser autofill */}
      <input
        type="text"
        name="tel-country-code"
        autoComplete="tel-country-code"
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        onChange={handleAutofill}
        className="sr-only"
      />

      {/* Trigger — matches Input mineral style content */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          'flex items-center gap-2 w-full min-h-[50px] transition-all duration-300 ease-cinematic',
          'px-4 py-3 rounded-xl text-base border',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error ? 'border-red-500/30 bg-red-500/5 text-title' 
                : 'border-border focus:border-action/50 focus:ring-action/50 bg-surface-2 text-title',
          !error && 'hover:bg-surface-2/80 hover:border-border-2',
          isOpen && !error
            ? 'bg-surface border-action/50 ring-2 ring-action/50'
            : '',
        )}
      >
        <span className="text-base leading-none shrink-0">
          {selected ? getCountryFlag(selected.countryCode) : '🌐'}
        </span>
        <span className="flex-1 text-[11px] font-bold text-left truncate">
          {selected ? `${selected.countryCode} ${selected.dialCode}` : <Typography variant="microLabel" as="span" className="opacity-40 lowercase">Prefix</Typography>}
        </span>
        <span className="material-symbols-outlined text-[14px] text-muted shrink-0">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-surface border border-border rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border/50">
            <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2">
              <span className="material-symbols-outlined text-[16px] text-muted">search</span>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Italy, US, +66..."
                className="flex-1 bg-transparent text-xs font-medium text-title placeholder:text-muted/40 outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-muted hover:text-title cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-52 py-1">
            {filtered.length === 0 ? (
              <Typography variant="microLabel" as="p" className="px-4 py-3 text-muted text-center italic">No results for "{query}"</Typography>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.dialCode || '__none__'}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'w-full text-left px-4 py-2 flex items-center gap-3 transition-colors cursor-pointer',
                    value === opt.dialCode
                      ? 'bg-action/10 text-action'
                      : 'hover:bg-surface-2 text-title'
                  )}
                >
                  <span className="text-base shrink-0 w-6 text-center">
                    {opt.countryCode ? getCountryFlag(opt.countryCode) : '🌐'}
                  </span>
                  <Typography variant="microLabel" as="span" className="flex-1 font-medium truncate">
                    {opt.name || 'No prefix / Other'}
                  </Typography>
                  {opt.dialCode && (
                    <Typography variant="numericRegular" as="span" className={cn(
                      'text-[10px] shrink-0',
                      value === opt.dialCode ? 'text-action font-bold' : 'text-muted/50'
                    )}>
                      {opt.dialCode}
                    </Typography>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
