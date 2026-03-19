import React, { useState, useRef, useEffect, useCallback } from 'react';
import { COUNTRIES, getCountryFlag } from '@thaiakha/shared/data';
import { cn } from '@thaiakha/shared/lib/utils';

interface NationalitySelectProps {
  value: string; // ISO 3166-1 alpha-2 code, e.g. 'IT'
  onChange: (code: string) => void;
  className?: string;
}

export const NationalitySelect: React.FC<NationalitySelectProps> = ({ value, onChange, className }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = value ? COUNTRIES.find(c => c.code === value) ?? null : null;

  const filtered = query.trim() === ''
    ? COUNTRIES
    : COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().startsWith(query.toLowerCase())
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

  const handleSelect = (code: string) => {
    onChange(code);
    close();
  };

  // Handle browser autofill via hidden input
  const handleAutofill = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    const match = COUNTRIES.find(
      c => c.name.toLowerCase() === raw.toLowerCase() || c.code.toUpperCase() === raw.toUpperCase()
    );
    if (match) onChange(match.code);
    else if (raw === '') onChange('');
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Hidden hint for browser autofill */}
      <input
        type="text"
        name="country"
        autoComplete="country"
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        onChange={handleAutofill}
        className="sr-only"
      />

      {/* Trigger — matches Input mineral style */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          // min-h matches Input md (py-3 + text-base line-height + border = 50px)
          'flex items-center gap-2 w-full min-h-[50px] transition-all duration-300 ease-cinematic',
          'px-4 py-3 rounded-xl border text-base',
          'bg-white/5 border-white/10 text-title',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-action/50',
          isOpen
            ? 'bg-white/10 border-action/50 ring-2 ring-action/50 ring-offset-0'
            : 'hover:bg-white/8 hover:border-white/20',
        )}
      >
        <span className="text-base leading-none shrink-0">
          {selected ? getCountryFlag(selected.code) : '🌐'}
        </span>
        <span className="flex-1 text-sm font-medium text-left truncate">
          {selected
            ? selected.name
            : <span className="text-desc/40">Select nationality...</span>}
        </span>
        <span className="material-symbols-outlined text-[14px] text-desc/40 shrink-0">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border/50">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <span className="material-symbols-outlined text-[16px] text-desc/50">search</span>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Italy, Japan, US..."
                className="flex-1 bg-transparent text-xs font-medium text-title placeholder:text-desc/40 outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-desc/40 hover:text-desc cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-52 py-1">
            {/* Not specified */}
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={cn(
                'w-full text-left px-4 py-2 flex items-center gap-3 transition-colors cursor-pointer',
                !value ? 'bg-action/10 text-action' : 'hover:bg-white/5 text-desc/60'
              )}
            >
              <span className="text-base shrink-0 w-6 text-center">🌐</span>
              <span className="flex-1 text-xs font-medium">Not specified</span>
            </button>

            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-desc/50 text-center">No results for "{query}"</p>
            ) : (
              filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelect(c.code)}
                  className={cn(
                    'w-full text-left px-4 py-2 flex items-center gap-3 transition-colors cursor-pointer',
                    value === c.code
                      ? 'bg-action/10 text-action'
                      : 'hover:bg-white/5 text-title'
                  )}
                >
                  <span className="text-base shrink-0 w-6 text-center">{getCountryFlag(c.code)}</span>
                  <span className="flex-1 text-xs font-medium truncate">{c.name}</span>
                  <span className={cn(
                    'text-xs font-mono shrink-0',
                    value === c.code ? 'text-action font-bold' : 'text-desc/50'
                  )}>{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
