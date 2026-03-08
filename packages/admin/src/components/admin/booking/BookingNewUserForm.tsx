import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import InputField from '../../../components/form/input/InputField';
import SelectField from '../../../components/form/input/SelectField';
import PhoneCountryInput from '../../common/PhoneCountryInput';
import { searchCountries, getCountryByCode } from '../../../data/countries';
import { NewUser } from '../../../hooks/useAdminBooking';
import SectionHeader from '../../ui/SectionHeader';

interface BookingNewUserFormProps {
  newUser: NewUser;
  onNewUserChange: (u: NewUser) => void;
}

const BookingNewUserForm: React.FC<BookingNewUserFormProps> = ({
  newUser,
  onNewUserChange,
}) => {
  const [nationalitySearchQuery, setNationalitySearchQuery] = useState('');
  const [nationalitySearchResults, setNationalitySearchResults] = useState<any[]>([]);

  const handleNationalitySearch = (query: string) => {
    setNationalitySearchQuery(query);
    if (query.length > 0) {
      const results = searchCountries(query);
      setNationalitySearchResults(results);
    } else {
      setNationalitySearchResults([]);
    }
  };

  const handleNationalitySelect = (countryCode: string) => {
    onNewUserChange({ ...newUser, nationality: countryCode });
    setNationalitySearchQuery('');
    setNationalitySearchResults([]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Row 1: Full Name, Age, Gender */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6">
          <InputField
            label="Full Name"
            placeholder="e.g. John Doe"
            value={newUser.fullName}
            onChange={e => onNewUserChange({ ...newUser, fullName: e.target.value })}
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <InputField
            label="Age"
            type="number"
            placeholder="Age"
            value={newUser.age}
            onChange={e => {
              const value = e.target.value ? Number(e.target.value) : '';
              const age = value === '' || value >= 0 ? value : '';
              onNewUserChange({ ...newUser, age });
            }}
            min="0"
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <SelectField
            label="Gender"
            value={newUser.gender || ''}
            onChange={e => onNewUserChange({ ...newUser, gender: e.target.value as any })}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </SelectField>
        </div>
      </div>

      {/* Row 2: Email, Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Email Address"
          placeholder="john@doe.com"
          value={newUser.email}
          onChange={e => onNewUserChange({ ...newUser, email: e.target.value })}
        />
        <InputField
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          value={newUser.password}
          onChange={e => onNewUserChange({ ...newUser, password: e.target.value })}
        />
      </div>

      {/* Row 3: Nationality, Phone, WhatsApp */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 relative">
          <InputField
            label="Nationality"
            placeholder="Search country..."
            value={nationalitySearchQuery || (newUser.nationality ? getCountryByCode(newUser.nationality)?.name || newUser.nationality : '')}
            onChange={e => {
              const val = e.target.value;
              handleNationalitySearch(val);
              if (!val && newUser.nationality) {
                onNewUserChange({ ...newUser, nationality: '' });
              }
            }}
            autoComplete="off"
          />
          {nationalitySearchResults.length > 0 && !newUser.nationality && (
            <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
              {nationalitySearchResults.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleNationalitySelect(country.code)}
                  className="w-full p-4 text-left hover:bg-brand-50 dark:hover:bg-brand-500/10 border-b border-gray-50 dark:border-gray-800 last:border-0 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 transition-colors">
                      <span className="text-sm font-bold text-gray-400 group-hover:text-brand-500">
                        {country.code.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{country.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{country.code}</p>
                    </div>
                  </div>
                  <span className="text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">✓</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 md:col-span-8 lg:col-span-5">
          <PhoneCountryInput
            label="Phone Number"
            value={newUser.phone}
            onChange={val => onNewUserChange({ ...newUser, phone: val })}
            selectedCountry={newUser.nationality}
            onCountryChange={c => {
              if (c.code && !newUser.nationality) {
                onNewUserChange({ ...newUser, nationality: c.code });
              }
            }}
          />
        </div>

        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <SectionHeader title="WhatsApp" className="mb-2" />
          <div className="grid grid-cols-2 gap-3 h-14">
            <button
              type="button"
              onClick={() => onNewUserChange({ ...newUser, isWhatsapp: true })}
              className={cn(
                "h-full rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                newUser.isWhatsapp === true
                  ? "border-brand-500/50 bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-lg shadow-brand-500/10 scale-[1.02]"
                  : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/10 text-gray-400 hover:border-gray-200"
              )}
            >
              <span className="text-sm">✓</span>
              Yes
            </button>
            <button
              type="button"
              onClick={() => onNewUserChange({ ...newUser, isWhatsapp: false })}
              className={cn(
                "h-full rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                newUser.isWhatsapp === false
                  ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 shadow-lg shadow-red-500/10 scale-[1.02]"
                  : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/10 text-gray-400 hover:border-gray-200"
              )}
            >
              <span className="text-sm">✗</span>
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingNewUserForm;