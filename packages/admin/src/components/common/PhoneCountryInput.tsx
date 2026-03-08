import { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import ReactCountryFlag from 'react-country-flag';
import { cn } from '../../lib/utils';
import { Globe } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';

export interface CountryInfo {
  code?: string;
  dialCode?: string;
  name?: string;
}

type Props = {
  value?: string;
  onChange?: (val: string) => void;
  onCountryChange?: (c: CountryInfo) => void;
  label?: string;
  selectedCountry?: string; // External country code selection (e.g., from nationality field)
};

export default function PhoneCountryInput({ value, onChange, onCountryChange, label, selectedCountry }: Props) {
  const [country, setCountry] = useState<CountryInfo | null>(null);

  // Update country when selectedCountry prop changes (e.g., from nationality field)
  useEffect(() => {
    if (selectedCountry) {
      const info: CountryInfo = {
        code: selectedCountry.toUpperCase(),
        dialCode: '', // Will be populated by PhoneInput
        name: '',
      };
      setCountry(info);
    }
  }, [selectedCountry]);

  return (
    <div className="w-full space-y-2">
      {label && (
        <SectionHeader
          title={label}
        />
      )}

      <div className="relative group/phone h-14">
        <div className="absolute left-0 top-0 flex items-center justify-center text-gray-400 transition-colors duration-300 group-hover/phone:text-brand-500 z-10 h-14 w-12">
          {country && country.code ? (
            <ReactCountryFlag
              countryCode={country.code}
              svg
              className="!w-6 !h-6 rounded-sm shadow-sm"
            />
          ) : (
            <Globe size={20} />
          )}
        </div>

        <PhoneInput
          country={selectedCountry?.toLowerCase() || 'th'}
          value={value}
          onChange={(phone: string, data: any) => {
            onChange?.(phone);
            const info: CountryInfo = {
              code: (data?.countryCode || '').toUpperCase(),
              dialCode: `+${data?.dialCode || ''}`,
              name: data?.name || '',
            };
            setCountry(info);
            onCountryChange?.(info);
          }}
          inputProps={{
            name: 'phone',
            className: cn(
              "w-full h-full rounded-2xl border transition-all duration-300 outline-none ring-brand-500/20 shadow-theme-xs",
              "pl-12 pr-4 py-2.5 text-base font-bold bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 hover:border-brand-500/30 focus:border-brand-500 focus:ring-4"
            )
          }}
          containerClass="!w-full !h-full"
          buttonClass="!hidden"
          placeholder="e.g. +66 81 234 5678"
        />
      </div>
    </div>
  );
}
