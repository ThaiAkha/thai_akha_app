import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Camera, BadgeCheck, Mail, Loader2, Globe, CheckCircle2 } from "lucide-react";
import { ProfileCard, ProfileFooter, ProfileRow } from "./components/ProfileUI";
import InputField from "../form/input/InputField";
import { getSmartAvatarUrl, isSmartAvatar } from "../../lib/avatarSystem";
import { searchCountries, getCountryByCode } from "@thaiakha/shared/data";
import { useTranslation } from "react-i18next";

/**
 * UserMetaCard - Unified Personal Details Card.
 * Focused on Primary Identity and Nationality.
 */
export default function UserMetaCard() {
  const { t } = useTranslation("profile");
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    // Keep internal for smart avatars but hide from UI per request
    gender: "" as "male" | "female" | "other" | "",
    age: "" as number | "",
  });

  const [nationalitySearchQuery, setNationalitySearchQuery] = useState('');
  const [nationalitySearchResults, setNationalitySearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        phone: user.agency_phone || "",
        nationality: user.nationality || "",
        gender: user.gender || "",
        age: user.age || "",
      });
    }
  }, [user, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
    setFormData(prev => ({ ...prev, nationality: countryCode }));
    setNationalitySearchQuery('');
    setNationalitySearchResults([]);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      let finalAvatarUrl = user.avatar_url;

      // Smart Avatar logic still uses these but they are hidden from UI
      if ((!user.avatar_url || isSmartAvatar(user.avatar_url)) && formData.gender && formData.age) {
        finalAvatarUrl = getSmartAvatarUrl(formData.gender as any, Number(formData.age));
      }

      await updateProfile(user.id, {
        full_name: formData.fullName,
        agency_phone: formData.phone,
        nationality: formData.nationality,
        avatar_url: finalAvatarUrl
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUploading(true);
      try {
        await uploadAvatar(user.id, file);
      } catch (error: any) {
        console.error("Avatar upload failed:", error);
        alert(t("avatar.uploadFail", { message: error.message || "Unknown error" }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <ProfileCard className="flex-col gap-8">
      <div className="flex flex-col lg:flex-row items-center lg:items-start w-full gap-8 lg:gap-12">

        {/* Avatar Section */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 lg:w-40 lg:h-40 overflow-hidden border-4 border-white dark:border-gray-800 rounded-full transition-all duration-500 group-hover:scale-105 shadow-2xl shadow-brand-500/10">
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=random&size=128`}
              alt="Profile"
              className="object-cover w-full h-full"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="absolute bottom-2 right-2 flex items-center justify-center w-10 h-10 text-white transition-all duration-300 bg-brand-500 rounded-full hover:scale-110 hover:bg-brand-600 disabled:bg-gray-400 shadow-lg border-4 border-white dark:border-gray-900 group-hover:rotate-12"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        {/* Identity & Personal Info Section */}
        <div className="flex-1 w-full flex flex-col items-center lg:items-start">
          <div className="flex flex-col items-center lg:items-start gap-3 mb-10 w-full">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/5 transition-all hover:bg-brand-500/20 w-fit">
              <BadgeCheck size={18} className="text-brand-500" />
              <span className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                {user?.role ? user.role : t("personal.roleDefault")}
              </span>
            </div>

            <div className="flex flex-col items-center lg:items-start gap-1">
              <h1 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-tight">
                {user?.full_name || t("personal.title")}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail size={18} className="text-brand-500/50" />
                <span className="text-md font-medium">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Details Grid - Standardized Labels & Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 w-full">
            {/* Full Name */}
            <ProfileRow
              label={t("personal.fieldFullName")}
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              isEditing={isEditing}
            />

            {/* Phone */}
            <ProfileRow
              label={t("personal.fieldPhone")}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              isEditing={isEditing}
            />

            {/* Nationality with specialized search */}
            <div className="relative group/field">
              <InputField
                label={t("personal.fieldNationality")}
                placeholder={t("personal.searchCountry")}
                value={nationalitySearchQuery || (formData.nationality ? getCountryByCode(formData.nationality)?.name || formData.nationality : '')}
                onChange={e => {
                  const val = e.target.value;
                  handleNationalitySearch(val);
                  if (!val && formData.nationality) {
                    setFormData(prev => ({ ...prev, nationality: '' }));
                  }
                }}
                disabled={!isEditing}
                autoComplete="off"
              />
              {isEditing && nationalitySearchResults.length > 0 && (
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
                          <Globe className="w-5 h-5 text-gray-400 group-hover:text-brand-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{country.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{country.code}</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProfileFooter
        isEditing={isEditing}
        isLoading={isSaving}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        onEdit={() => setIsEditing(true)}
        editLabel={t("personal.editLabel")}
        saveLabel={t("personal.saveLabel")}
      />
    </ProfileCard>
  );
}
