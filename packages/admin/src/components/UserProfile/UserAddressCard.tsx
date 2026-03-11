import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Globe, CheckCircle2 } from "lucide-react";
import { ProfileCard, ProfileRow, ProfileFooter } from "./components/ProfileUI";
import InputField from "../form/input/InputField";
import { searchCountries, getCountryByCode } from "@thaiakha/shared/data";

/**
 * UserAddressCard - Identity & Agency.
 * Focus: Company details, Billing address, and Agency identity.
 */
export default function UserAddressCard() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    country: "",
    city: "",
    province: "",
    postalCode: "",
    taxId: "",
    address: "",
  });

  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [countrySearchResults, setCountrySearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.agency_company_name || "",
        country: user.agency_country || "",
        city: user.agency_city || "",
        province: user.agency_province || "",
        postalCode: user.agency_postal_code || "",
        taxId: user.agency_tax_id || "",
        address: user.agency_address || "",
      });
    }
  }, [user, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountrySearch = (query: string) => {
    setCountrySearchQuery(query);
    if (query.length > 0) {
      const results = searchCountries(query);
      setCountrySearchResults(results);
    } else {
      setCountrySearchResults([]);
    }
  };

  const handleCountrySelect = (countryCode: string) => {
    setFormData(prev => ({ ...prev, country: countryCode }));
    setCountrySearchQuery('');
    setCountrySearchResults([]);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await updateProfile(user.id, {
        agency_company_name: formData.companyName,
        agency_country: formData.country,
        agency_city: formData.city,
        agency_province: formData.province,
        agency_postal_code: formData.postalCode,
        agency_tax_id: formData.taxId,
        agency_address: formData.address
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update identity details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileCard className="lg:col-span-2">
      <div className="flex-1 w-full">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          <div className="md:col-span-2">
            <ProfileRow
              label="Company / Agency Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              isEditing={isEditing}
              placeholder="Official Agency Name"
            />
          </div>

          <div className="md:col-span-2">
            <ProfileRow
              label="Billing Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              isEditing={isEditing}
              placeholder="Street name, Number"
            />
          </div>

          <div className="relative group/field">
            <InputField
              label="Country"
              placeholder="Search country..."
              value={countrySearchQuery || (formData.country ? getCountryByCode(formData.country)?.name || formData.country : '')}
              onChange={e => {
                const val = e.target.value;
                handleCountrySearch(val);
                if (!val && formData.country) {
                  setFormData(prev => ({ ...prev, country: '' }));
                }
              }}
              disabled={!isEditing}
              autoComplete="off"
            />
            {isEditing && countrySearchResults.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                {countrySearchResults.map(country => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country.code)}
                    className="w-full p-4 text-left hover:bg-brand-50 dark:hover:bg-brand-500/10 border-b border-gray-50 dark:border-gray-800 last:border-0 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 transition-colors">
                        <Globe className="w-5 h-5 text-gray-400 group-hover:text-brand-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{country.name}</p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">{country.code}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <ProfileRow
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            isEditing={isEditing}
            placeholder="Official City"
          />

          <ProfileRow
            label="Province / Region"
            name="province"
            value={formData.province}
            onChange={handleChange}
            isEditing={isEditing}
            placeholder="Province"
          />

          <ProfileRow
            label="Postal Code"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            isEditing={isEditing}
            placeholder="00000"
          />

          <ProfileRow
            label="Tax ID / VAT Number"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
            isEditing={isEditing}
            placeholder="VAT Registration Number"
          />

          <ProfileRow
            label="Commission Rate"
            value={user?.agency_commission_rate ? `${user.agency_commission_rate}%` : "Standard Tier"}
            isEditing={false}
          />
        </div>
      </div>

      <ProfileFooter
        isEditing={isEditing}
        isLoading={isLoading}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        onEdit={() => setIsEditing(true)}
        editLabel="Edit Agency Details"
        saveLabel="Update Identity"
      />
    </ProfileCard>
  );
}
