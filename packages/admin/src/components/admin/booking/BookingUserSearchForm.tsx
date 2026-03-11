import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import InputField from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';

interface BookingUserSearchFormProps {
  userMode: 'existing' | 'agency';
  searchTerm: string;
  onSearchTermChange: (s: string) => void;
  searchResults: any[];
  selectedUser: any | null;
  onSelectedUserChange: (u: any) => void;
}

const BookingUserSearchForm: React.FC<BookingUserSearchFormProps> = ({
  userMode,
  searchTerm,
  onSearchTermChange,
  searchResults,
  selectedUser,
  onSelectedUserChange,
}) => {
  return (
    <div className="space-y-4">
      <InputField
        id="search-user"
        name="search-user"
        label={userMode === 'existing' ? "Search Guest" : "Search Partner / Agency"}
        placeholder={userMode === 'existing' ? "Type name..." : "Search agency name..."}
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
                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                  {userMode === 'agency' && u.agency_company_name ? u.agency_company_name : u.full_name}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">{u.email}</p>
                  {userMode === 'agency' && u.agency_company_name && (
                    <p className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">
                      {u.full_name}
                    </p>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                Select
              </Button>
            </div>
          ))}
          {searchResults.length === 0 && (
            <p className="text-xs text-center text-gray-400 p-2">No users found.</p>
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
                  ? "text-green-800 dark:text-green-300"
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
                  ? "text-green-600 dark:text-green-400"
                  : "text-purple-600 dark:text-purple-400"
              )}
            >
              {selectedUser.email}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto text-red-500 border-red-200 hover:bg-red-50"
            onClick={() => onSelectedUserChange(null)}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingUserSearchForm;
