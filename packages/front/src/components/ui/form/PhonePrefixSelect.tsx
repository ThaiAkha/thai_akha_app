import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BOOKING_PHONE_PREFIXES, getCountryFlag } from '@thaiakha/shared/data';
import { cn } from '@thaiakha/shared/lib/utils';

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

      {/* Trigger — matches Input mineral style exactly */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          // base matches Input md
          'flex items-center gap-2 w-full min-h-[50px] transition-all duration-300 ease-cinematic',
          'px-4 py-3 rounded-xl text-base',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error ? 'border-red-500/30 dark:border-red-500/40 focus:border-red-500 focus:ring-red-500/50 bg-red-500/5 dark:bg-red-500/10' 
                : 'border-black/10 dark:border-white/10 focus:border-action/50 focus:ring-action/50 bg-black/5 dark:bg-white/5',
          !error && 'hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/30 dark:hover:border-white/30 text-gray-900 dark:text-gray-100 border',
          isOpen && !error
            ? 'bg-black/10 dark:bg-white/10 border-action/50 ring-2 ring-action/50 ring-offset-0'
            : '',
          error && 'border text-gray-900 dark:text-gray-100',
        )}
      >
        <span className="text-base leading-none shrink-0">
          {selected ? getCountryFlag(selected.countryCode) : '🌐'}
        </span>
        <span className="flex-1 text-xs font-bold text-left truncate">
          {selected ? `${selected.countryCode} ${selected.dialCode}` : <span className="text-gray-700/40 dark:text-gray-300/40">Prefix</span>}
        </span>
        <span className="material-symbols-outlined text-[14px] text-gray-700/40 dark:text-gray-300/40 shrink-0">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2">
              <span className="material-symbols-outlined text-[16px] text-gray-700/50 dark:text-gray-300/50">search</span>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Italy, US, +66..."
                className="flex-1 bg-transparent text-xs font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-700/40 dark:text-gray-300/40 outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-gray-700/40 dark:text-gray-300/40 hover:text-gray-700 dark:text-gray-300 cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-52 py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-700/50 dark:text-gray-300/50 text-center">No results for "{query}"</p>
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
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100'
                  )}
                >
                  <span className="text-base shrink-0 w-6 text-center">
                    {opt.countryCode ? getCountryFlag(opt.countryCode) : '🌐'}
                  </span>
                  <span className="flex-1 text-xs font-medium truncate">
                    {opt.name || 'No prefix / Other'}
                  </span>
                  {opt.dialCode && (
                    <span className={cn(
                      'text-xs font-mono shrink-0',
                      value === opt.dialCode ? 'text-action font-bold' : 'text-gray-700/50 dark:text-gray-300/50'
                    )}>
                      {opt.dialCode}
                    </span>
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
