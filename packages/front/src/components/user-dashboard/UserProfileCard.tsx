import React, { useState, useRef, useEffect } from 'react';
import { User, Crown, Truck, ChefHat, BookOpen, Shield, GraduationCap } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import { GlassCard, Typography, Icon, Badge } from '../ui';
import type { UserProfile, SpicinessLevel } from '@thaiakha/shared/types';
import { authCoreService, recipeService } from '@thaiakha/shared/services';

interface UserProfileCardProps {
  userProfile: UserProfile | null;
  activeTab?: string;
}

const ROLE_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  admin:     { label: 'Admin',       className: 'bg-primary/10 text-primary border-primary/20',                         icon: <Crown className="w-4 h-4" /> },
  manager:   { label: 'Manager',     className: 'bg-primary/10 text-primary border-primary/20',                         icon: <Shield className="w-4 h-4" /> },
  agency:    { label: 'Agency',      className: 'bg-btn-p/10 text-btn-p border-btn-p/20',                              icon: <BookOpen className="w-4 h-4" /> },
  kitchen:   { label: 'Kitchen',     className: 'bg-action/10 text-action-700 dark:text-action border-action/20',       icon: <ChefHat className="w-4 h-4" /> },
  logistics: { label: 'Logistics',   className: 'bg-btn-s/10 text-btn-s border-btn-s/20',                              icon: <Truck className="w-4 h-4" /> },
  driver:    { label: 'Driver',      className: 'bg-btn-s/10 text-btn-s border-btn-s/20',                              icon: <Truck className="w-4 h-4" /> },
  alumni:    { label: 'Alumni Chef', className: 'bg-secondary/10 text-secondary border-secondary/20',                  icon: <GraduationCap className="w-4 h-4" /> },
  guest:     { label: 'Guest Chef',  className: 'bg-surface-2 text-sub border-border',                                  icon: <User className="w-4 h-4" /> },
};

const UserProfileCard: React.FC<UserProfileCardProps> = ({ userProfile: initialProfile, activeTab }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialProfile);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [spicinessLevels, setSpicinessLevels] = useState<SpicinessLevel[]>([]);
  const [dietaryProfiles, setDietaryProfiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    const loadMetadata = async () => {
      const [spicy, diets] = await Promise.all([
        recipeService.getSpicinessLevels(),
        recipeService.getDietaryProfiles()
      ]);
      setSpicinessLevels(spicy);
      setDietaryProfiles(diets);
    };
    loadMetadata();
  }, []);

  if (!userProfile) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const publicUrl = await authCoreService.uploadAvatar(userProfile.id, file);
      setImgError(false); // nuovo avatar → riprova a caricarlo
      setUserProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
    } catch (err) {
      console.error("Upload Error:", err);
    } finally {
      setUploading(false);
    }
  };

  const role = (userProfile.role as string) || 'guest';
  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.guest;

  // Guard: full_name può essere null (utente senza nome) → senza fallback .split()
  // lanciava un TypeError che faceva crashare l'intera card (avatar incluso).
  const displayName = userProfile.full_name || userProfile.email || 'Guest';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const currentDiet = dietaryProfiles.find(p => p.id === userProfile.dietary_profile);
  const currentSpicy = spicinessLevels.find(s => s.id === userProfile.preferred_spiciness_id);

  return (
    <GlassCard variant="primary" radius="2.5rem" padding="m">
      {/* Hidden input for upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {/* ── PROFILE HEADER (Centered) ── */}
      <div className="flex flex-col items-center text-center [gap:var(--space-fluid-s)]">

        {/* Avatar Container */}
        <div 
          className="relative cursor-pointer group"
          onClick={handleAvatarClick}
        >
          <div className="size-20 rounded-3xl overflow-hidden ring-4 ring-surface-2 shadow-xl transition-transform group-hover:scale-105 active:scale-95">
            {userProfile.avatar_url && !imgError ? (
              <img
                src={userProfile.avatar_url}
                alt={displayName}
                onError={() => setImgError(true)}
                className={cn("w-full h-full object-cover", uploading && "opacity-50 grayscale")}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-action/20 flex items-center justify-center">
                <span className="text-2xl font-black text-primary">{initials}</span>
              </div>
            )}
            
            {/* Upload Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Icon name="photo_camera" size="sm" className="text-white" />
            </div>
            
            {/* Loading Spinner */}
            {uploading && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
               </div>
            )}
          </div>
          
          {/* Online dot */}
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-action rounded-full border-4 border-surface shadow-md" />
        </div>

        {/* Name + email */}
        <div className="w-full">
          <Typography variant="h5" className="font-bold leading-tight" color="title">
            {displayName}
          </Typography>
          <Typography variant="caption" color="muted" className="mt-1 block">
            {userProfile.email}
          </Typography>
          
          {/* Role badge (Hidden for Guests) */}
          {role !== 'guest' && (
            <div className={cn(
              'inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full',
              'text-[9px] font-bold uppercase tracking-wider border transition-colors',
              roleConfig.className
            )}>
              {roleConfig.icon}
              {roleConfig.label}
            </div>
          )}
        </div>
      </div>

      {/* ── PROFILE DETAILS (Row-based) ── */}
      <div className="[margin-top:var(--space-fluid-s)] flex flex-col [gap:var(--space-fluid-s)] border-t border-border/50 [padding-top:var(--space-fluid-s)]">
        
        {/* ROW: DIETARY */}
        <div className="flex justify-between items-center">
          <Typography variant="microLabel" className="opacity-40 uppercase tracking-widest">Dietary</Typography>
          <Badge variant="mineral" color="action" size="xs">
            {currentDiet?.name || 'Regular'}
          </Badge>
        </div>

        {/* ROW: SPICINESS */}
        <div className="flex justify-between items-center">
          <Typography variant="microLabel" className="opacity-40 uppercase tracking-widest">Heat</Typography>
          <Badge variant="mineral" color="primary" size="xs">
            {currentSpicy?.title || 'Mild'}
          </Badge>
        </div>

        {/* ROW: ALLERGIES */}
        {userProfile.allergies && userProfile.allergies.length > 0 && (
          <div className="flex justify-between items-start gap-4">
            <Typography variant="microLabel" className="opacity-40 uppercase tracking-widest mt-1">Allergies</Typography>
            <div className="flex flex-wrap justify-end gap-3 max-w-[60%]">
              {userProfile.allergies.map(allergy => (
                <div key={allergy} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-allergy/5 border border-allergy/20">
                  <div className="size-1 rounded-full bg-allergy" />
                  <Typography variant="numericRegular" className="text-[9px] font-bold uppercase text-allergy">{allergy}</Typography>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Passport tab indicator */}
      {activeTab === 'passport' && (
        <div className="[margin-top:var(--space-fluid-m)] pt-4 border-t border-border/50 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-action">
            <Icon name="verified_user" size="sm" />
            <Typography variant="microLabel" className="font-black uppercase tracking-tighter">Verified</Typography>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default UserProfileCard;

