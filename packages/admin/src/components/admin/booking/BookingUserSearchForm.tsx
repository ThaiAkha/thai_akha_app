import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';
import type { UserProfile } from '@thaiakha/shared/types';
import InputField from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

interface BookingUserSearchFormProps {
  userMode: 'existing' | 'agency';
  searchTerm: string;
  onSearchTermChange: (s: string) => void;
  searchResults: UserProfile[];
  selectedUser: UserProfile | null;
  onSelectedUserChange: (u: UserProfile | null) => void;
}

const BookingUserSearchForm: React.FC<BookingUserSearchFormProps> = ({
  userMode,
  searchTerm,
  onSearchTermChange,
  searchResults,
  selectedUser,
  onSelectedUserChange,
}) => {
  const { t } = useTranslation('booking');
  return (
    <div className="space-y-4">
      <InputField
        id="search-user"
        name="search-user"
        label={userMode === 'existing' ? t('search.labelGuest') : t('search.labelAgency')}
        placeholder={userMode === 'existing' ? t('search.placeholderGuest') : t('search.placeholderAgency')}
        value={searchTerm}
        onChange={e => onSearchTermChange(e.target.value)}
      />
      {searchTerm.length > 2 && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700 max-h-[200px] overflow-y-auto">
          {searchResults.map(u => (
            <div
              key={u.id}
              onClick={() => {
                onSelectedUserChange(u);
                onSearchTermChange('');
              }}
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-md cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center group"
            >
              <div>
                <p className="font-bold text-sm text-body">
                  {userMode === 'agency' && u.agency_company_name ? u.agency_company_name : u.full_name}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-sub">{u.email}</p>
                  {userMode === 'agency' && u.agency_company_name && (
                    <p className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sub">
                      {u.full_name}
                    </p>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                {t('search.selectBtn')}
              </Button>
            </div>
          ))}
          {searchResults.length === 0 && (
            <p className="text-xs text-center text-sub p-2">{t('search.noUsersFound')}</p>
          )}
        </div>
      )}
      {selectedUser && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl flex items-center gap-4">
          <div
            className={cn(
              "size-10 rounded-full flex items-center justify-center font-black text-lg",
              userMode === 'existing'
                ? "bg-green-100 text-green-600"
                : "bg-purple-100 text-purple-600"
            )}
          >
            {selectedUser.full_name.charAt(0)}
          </div>
          <div>
            <p
              className={cn(
                "font-black",
                userMode === 'existing'
                  ? "text-success"
                  : "text-purple-800 dark:text-purple-300"
              )}
            >
              {userMode === 'agency' && selectedUser.agency_company_name
                ? selectedUser.agency_company_name
                : selectedUser.full_name}
            </p>
            <p
              className={cn(
                "text-xs",
                userMode === 'existing'
                  ? "text-success"
                  : "text-purple-600 dark:text-purple-400"
              )}
            >
              {selectedUser.email}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto text-error border-red-200 hover:bg-red-50"
            onClick={() => onSelectedUserChange(null)}
          >
            {t('search.removeBtn')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingUserSearchForm;
