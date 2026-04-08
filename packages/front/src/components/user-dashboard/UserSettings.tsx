import React, { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';

import { Button, Icon } from '../ui';
import { Typography } from '../ui/Typography';
import AkhaPixelLine from '../ui/AkhaPixelLine';
import Alert from '../ui/card/Alert';
import { AllergySelector, DietSelector, SpicySelector } from '../menu';

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

// Allergies list is derived from allergyMap keys (loaded from DB) — see below


const UserSettings: React.FC<UserSettingsProps> = ({
  userProfile,
  spicinessLevels,
  onUpdate,
  isStaff,
  onShowCertificate,
}) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dietOptions, setDietOptions] = useState<DietOption[]>([]);
  const [allergyMap, setAllergyMap] = useState<Record<string, string>>({});

  const [fullName, setFullName] = useState('');
  const [diet, setDiet] = useState<string>('diet_regular');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [spiceId, setSpiceId] = useState<number>(2);

  useEffect(() => {
    contentService.getDietaryProfiles().then(p => { if (p) setDietOptions(p); });
    contentService.getAllergyMap().then(map => { if (map) setAllergyMap(map); });
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


  // Derive allergy list from DB keys (same source as MegaMenu)
  const allergyList = Object.keys(allergyMap).map(
    key => key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  );

  const selectedDietInfo = dietOptions.find(d => d.id === diet);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── SETTINGS CARD (full width) ── */}
      <div className="bg-surface/90 backdrop-blur-3xl border border-border rounded-3xl overflow-hidden shadow-sm">

        <div className="p-6 md:p-8 space-y-8">

          {/* 1. ALLERGIES */}
          <section>
            <AllergySelector
              options={allergyList}
              selected={allergies}
              onChange={setAllergies}
              allergyMap={allergyMap}
              showInfoCards
            />
          </section>

          {/* Divider */}
          <AkhaPixelLine variant="line_divider" size={5} className="py-2" />

          {/* 2. SPICE LEVEL */}
          <section>
            <SpicySelector
              options={spicinessLevels}
              selected={spiceId}
              onChange={setSpiceId}
            />
          </section>

          {/* Divider */}
          <AkhaPixelLine variant="line_divider" size={5} className="py-2" />

          {/* 3. DIETARY STYLE */}
          <section>
            <DietSelector options={dietOptions} selected={diet} onChange={setDiet} />

            {selectedDietInfo && (
              <Alert
                variant="warning"
                title={selectedDietInfo.name}
                message={selectedDietInfo.description}
                icon="tips_and_updates"
              />
            )}
          </section>

        </div>

        {/* Save footer */}
        <div className="[padding:var(--space-fluid-m)] flex flex-col items-center gap-3 bg-surface-2/50 border-t border-border">
          {successMsg && (
            <Typography variant="paragraphS" color="action" className="font-bold flex items-center gap-2 animate-in fade-in">
              <Icon name="check_circle" size="sm" />
              {successMsg}
            </Typography>
          )}
          <Button
            variant="action"
            size="md"
            className="px-8"
            onClick={handleSave}
            isLoading={loading}
            icon="save"
          >
            Confirm Passport
          </Button>
          <Typography variant="paragraphS" color="muted" className="text-center max-w-sm leading-relaxed">
            Don't worry, you can change your data any time, and it would be fine for the teacher to keep following with your selection.
          </Typography>
        </div>
      </div>

      {/* ── CERTIFICATE SECTION (non-staff only) ── */}
      {!isStaff && (
        <div className="bg-surface/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-3xl [padding:var(--space-fluid-m)]">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="workspace_premium" className="text-quiz-p" />
            <Typography variant="h4" className="uppercase tracking-tight">Your Certificate</Typography>
          </div>
          <Typography variant="paragraphS" color="sub" className="mb-5 leading-relaxed">
            Once your class is complete and your menu is set, download your personalised Thai Akha certificate of participation.
          </Typography>
          <Button
            variant="outline"
            size="md"
            onClick={() => onShowCertificate?.()}
            className="border-quiz-p/40 text-quiz-p hover:bg-quiz-p/10 transition-all active:scale-95"
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
