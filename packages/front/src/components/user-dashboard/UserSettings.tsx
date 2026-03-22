import React, { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';
import { DIETARY_KNOWLEDGE_BASE } from '@thaiakha/shared/data';
import { Button, Icon, Slider, Badge, Avatar } from '../ui';
import { Input } from '../ui/form';
import { cn } from '@thaiakha/shared/lib/utils';

interface UserSettingsProps {
  userProfile: UserProfile | null;
  spicinessLevels: any[];
  onBack: () => void;
  onUpdate: () => void;
  isStaff?: boolean;
  onShowCertificate?: () => void;
}

interface DietOption {
  id: string;
  name: string;
  icon: string;
  type: 'lifestyle' | 'religious';
  description: string;
}

const ALLERGIES_LIST = [
  'Peanuts', 'Shellfish', 'Gluten', 'Soy', 'Eggs', 'Dairy', 'Sesame',
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin', manager: 'Manager', agency: 'Agency Partner',
  kitchen: 'Kitchen Staff', logistics: 'Logistics', driver: 'Driver',
  alumni: 'Alumni Chef', guest: 'Guest Chef',
};

const UserSettings: React.FC<UserSettingsProps> = ({
  userProfile,
  spicinessLevels,
  onUpdate,
  isStaff,
  onShowCertificate,
}) => {
  const [loading, setLoading]         = useState(false);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);
  const [dietOptions, setDietOptions] = useState<DietOption[]>([]);

  const [fullName, setFullName]   = useState('');
  const [diet, setDiet]           = useState<string>('diet_regular');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [spiceId, setSpiceId]     = useState<number>(2);

  useEffect(() => {
    contentService.getDietaryProfiles().then(p => { if (p) setDietOptions(p); });
  }, []);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setDiet(userProfile.dietary_profile || 'diet_regular');
      setAllergies(userProfile.allergies || []);
      // @ts-ignore
      setSpiceId(userProfile.preferred_spiciness_id || 2);
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile) return;
    setLoading(true);
    setSuccessMsg(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          dietary_profile: diet,
          allergies: allergies.filter(a => a.trim() !== '') as any,
          preferred_spiciness_id: spiceId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userProfile.id);
      if (error) throw error;
      setSuccessMsg('Passport updated successfully kha!');
      setTimeout(() => setSuccessMsg(null), 3000);
      onUpdate();
    } catch (err) {
      console.error('Profile Save Error:', err);
      alert('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergy = (allergen: string) =>
    setAllergies(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );

  const getAllergyInfo = (allergen: string) => {
    const key = allergen.toLowerCase() as keyof typeof DIETARY_KNOWLEDGE_BASE.allergyWarnings;
    return DIETARY_KNOWLEDGE_BASE.allergyWarnings[key] || 'We will exclude this ingredient safely.';
  };

  const selectedDietInfo  = dietOptions.find(d => d.id === diet);
  const currentSpiceLevel = spicinessLevels.find(l => l.id === spiceId);
  const roleLabel         = ROLE_LABELS[(userProfile?.role as string) ?? ''] ?? 'Guest Chef';
  const initials          = userProfile?.full_name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '';

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── DIGITAL PASSPORT BANNER ── */}
      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
        {/* Gradient stripe */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-action to-primary/40" />

        <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">

          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar
              src={userProfile?.avatar_url}
              initials={fullName}
              size="2xl"
              className="border-4 border-surface shadow-xl ring-2 ring-border"
            />
            <div className="absolute -bottom-1 -right-1 bg-action text-white p-1.5 rounded-full border-4 border-surface">
              <Icon name="verified_user" size="sm" />
            </div>
          </div>

          {/* Identity info */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">Digital Passport</p>
            <p className="font-display font-black text-2xl text-gray-900 dark:text-gray-100 uppercase leading-tight truncate">
              {userProfile?.full_name || 'Your Name'}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-0.5 truncate">{userProfile?.email}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                isStaff
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-action/10 text-action-700 dark:text-action border-action/20'
              )}>
                <Icon name={isStaff ? 'account_box' : 'restaurant_menu'} size="sm" />
                {roleLabel}
              </span>
              {userProfile?.id && (
                <span className="font-mono text-[9px] text-gray-500 dark:text-gray-500 opacity-50">
                  ID: {userProfile.id.slice(0, 8).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Name input inline (desktop) */}
          <div className="hidden lg:block w-56 shrink-0">
            <Input
              label="Display Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              leftIcon="account_box"
              className="font-bold"
            />
          </div>
        </div>
      </div>

      {/* ── Name input (mobile/tablet) ── */}
      <div className="lg:hidden">
        <Input
          label="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          leftIcon="account_box"
          className="font-bold"
        />
      </div>

      {/* ── SETTINGS CARD (full width) ── */}
      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">

        <div className="p-6 md:p-8 space-y-8">

          {/* 1. ALLERGIES */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-action/10 flex items-center justify-center text-action">
                  <Icon name="health_and_safety" size="sm" />
                </div>
                <span className="font-display font-black text-lg text-gray-900 dark:text-gray-100 uppercase tracking-tight">Safety & Allergies</span>
              </div>
              {allergies.length > 0 && (
                <Badge variant="solid" className="bg-action text-white">{allergies.length} Active</Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5 mb-4">
              {ALLERGIES_LIST.map(allergen => {
                const isActive = allergies.includes(allergen);
                return (
                  <button
                    key={allergen}
                    onClick={() => toggleAllergy(allergen)}
                    className={cn(
                      'px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2',
                      isActive
                        ? 'bg-action/10 border-action text-action scale-105'
                        : 'bg-surface border-border text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    <Icon name={isActive ? 'check_circle' : 'add_circle'} size="sm" className={isActive ? '' : 'opacity-30'} />
                    {allergen}
                  </button>
                );
              })}
            </div>

            {allergies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                {allergies.map(a => (
                  <div key={a} className="flex gap-3 p-4 rounded-2xl bg-action/5 border border-action/20">
                    <Icon name="info" className="text-action mt-0.5 shrink-0" size="sm" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-action tracking-widest mb-1">{a} Protocol</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">"{getAllergyInfo(a)}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* 2. SPICE LEVEL */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon name="local_fire_department" size="sm" />
                </div>
                <span className="font-display font-black text-lg text-gray-900 dark:text-gray-100 uppercase tracking-tight">Spice Tolerance</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-500 tracking-widest">Selected</p>
                <p
                  className="text-xl font-black"
                  style={{ color: currentSpiceLevel?.color_code ?? 'var(--color-primary)' }}
                >
                  {currentSpiceLevel?.title || 'Medium'}
                </p>
              </div>
            </div>
            <div className="px-2">
              <Slider value={spiceId} onChange={setSpiceId} min={1} max={5} step={1} className="mb-4" />
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500">
                <span>Mild</span><span>Medium</span><span>Spicy</span><span>Local</span><span>Warrior</span>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* 3. DIETARY STYLE */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="size-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary-dark dark:text-secondary">
                <Icon name="restaurant_menu" size="sm" />
              </div>
              <span className="font-display font-black text-lg text-gray-900 dark:text-gray-100 uppercase tracking-tight">Dietary Style</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
              {dietOptions.map(opt => {
                const isActive = diet === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setDiet(opt.id)}
                    className={cn(
                      'p-4 rounded-2xl border text-left flex items-center gap-3 transition-all duration-300 relative overflow-hidden',
                      isActive
                        ? 'bg-secondary/10 border-secondary shadow-sm ring-1 ring-secondary/40'
                        : 'bg-surface border-border text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="min-w-0">
                      <p className={cn('text-xs font-black uppercase tracking-wide truncate', isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300')}>
                        {opt.name}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5 font-mono">
                        {opt.type === 'religious' ? 'Strict Compliance' : 'Lifestyle'}
                      </p>
                    </div>
                    {isActive && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary animate-in zoom-in">
                        <Icon name="verified" size="sm" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDietInfo && (
              <div className="bg-black/5 dark:bg-black/30 border border-border p-4 rounded-2xl flex gap-3">
                <Icon name="tips_and_updates" className="text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-1">Our Kitchen Promise</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{selectedDietInfo.description}</p>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Save footer */}
        <div className="p-5 md:p-6 bg-black/[0.03] dark:bg-white/[0.03] border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {successMsg ? (
              <span className="text-action font-bold flex items-center gap-2 animate-in fade-in">
                <Icon name="check_circle" size="sm" />
                {successMsg}
              </span>
            ) : (
              'Review your details before saving.'
            )}
          </div>
          <Button
            variant="brand"
            size="lg"
            className="w-full sm:w-auto px-10"
            onClick={handleSave}
            isLoading={loading}
            icon="save"
          >
            Confirm Passport
          </Button>
        </div>
      </div>

      {/* ── CERTIFICATE SECTION (non-staff only) ── */}
      {!isStaff && (
        <div className="bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="workspace_premium" className="text-quiz-p" />
            <p className="font-display font-black text-lg text-gray-900 dark:text-gray-100 uppercase tracking-tight">Your Certificate</p>
          </div>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-5 leading-relaxed">
            Once your class is complete and your menu is set, download your personalised Thai Akha certificate of participation.
          </p>
          <Button
            variant="outline"
            size="md"
            onClick={() => onShowCertificate?.()}
            className="border-quiz-p/40 text-quiz-p hover:bg-quiz-p/10"
          >
            <Icon name="download" size="sm" />
            Download Certificate
          </Button>
        </div>
      )}

    </div>
  );
};

export default UserSettings;
