import { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import ReactCountryFlag from 'react-country-flag';
import { cn } from '@thaiakha/shared/lib/utils';
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

      <div className="relative group/phone">
        <div className="absolute left-0 top-0 flex items-center justify-center text-gray-400 transition-colors duration-300 group-hover/phone:text-primary-500 z-10 h-12 w-12 pointer-events-none">
          {country && country.code ? (
            <ReactCountryFlag
              countryCode={country.code}
              svg
              className="w-5 h-5 rounded-sm shadow-sm"
            />
          ) : (
            <Globe size={18} />
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
            id: 'phone',
            name: 'phone',
            autoComplete: 'tel',
            className: cn(
              "w-full rounded-xl border appearance-none transition-all duration-300 outline-none ring-green-500/20 shadow-theme-xs",
              "h-12 px-4 text-base font-bold bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:border-green-500/30 focus:border-green-500 focus:ring-4",
              "pl-12"
            )
          }}
          containerClass="w-full"
          buttonClass="!hidden"
          placeholder="e.g. +66 81 234 5678"
        />
      </div>
    </div>
  );
}
