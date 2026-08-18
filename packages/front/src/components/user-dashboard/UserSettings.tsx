import React, { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { UserProfile } from '../../services/auth.service';
import { contentService } from '@thaiakha/shared/services';

import { Button, Icon } from '../ui';
import { Typography } from '../ui/Typography';
import AkhaPixelLine from '../divider/AkhaPixelLine';
import Alert from '../ui/card/Alert';
import { AllergySelector, DietSelector, SpicySelector } from '../menu';
import { useUserPassport } from '../../hooks/useUserPassport';
import { useActiveProfile } from '../../context/ActiveProfileContext';

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
}) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dietOptions, setDietOptions] = useState<DietOption[]>([]);
  const [allergyMap, setAllergyMap] = useState<Record<string, string>>({});

  // F2 — il passport segue il PROFILO ATTIVO (host o un suo gestito), non l'host fisso.
  const { managedProfiles, activeProfileId, isActingAsManaged } = useActiveProfile();
  const activeManaged = managedProfiles.find(p => p.id === activeProfileId) ?? null;
  const passportTarget = isActingAsManaged ? activeManaged : userProfile;
  const activeName = (isActingAsManaged ? activeManaged?.full_name : userProfile?.full_name) ?? '';

  const { passport, updatePassport } = useUserPassport(passportTarget, onUpdate);

  const [fullName, setFullName] = useState('');

  useEffect(() => {
    contentService.getDietaryProfiles().then(p => { if (p) setDietOptions(p as unknown as DietOption[]); });
    contentService.getAllergyMap().then(map => { if (map) setAllergyMap(map); });
  }, []);

  useEffect(() => {
    setFullName(activeName);
  }, [activeName]);

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      // Scrive il full_name sul PROFILO ATTIVO (host o gestito). RLS profiles.update
      // è estesa a managed_by → l'host può aggiornare i suoi gestiti.
      const targetId = activeProfileId ?? userProfile?.id ?? null;
      if (targetId && targetId !== 'guest') {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetId);
        if (error) throw error;
      }
      
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

  // Aggiornamento live del Passport 
  const handleDietChange = (dietId: string) => updatePassport({ dietary_profile: dietId });
  const handleAllergyChange = (allergies: string[]) => updatePassport({ allergies });
  const handleSpiceChange = (spiceId: number) => updatePassport({ preferred_spiciness_id: spiceId });


  // Derive allergy list from DB keys (same source as MegaMenu)
  const allergyList = Object.keys(allergyMap).map(
    key => key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  );

  const selectedDietInfo = dietOptions.find(d => d.id === passport.dietary_profile);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── SETTINGS CARD (full width) ── */}
      <div className="bg-surface/90 backdrop-blur-3xl border border-border rounded-3xl overflow-hidden shadow-sm">

        <div className="p-6 md:p-8 space-y-8">

          {/* 1. ALLERGIES */}
          <section>
            <AllergySelector
              options={allergyList}
              selected={passport.allergies}
              onChange={handleAllergyChange}
              allergyMap={allergyMap}
              showInfoCards
            />
          </section>

          {/* Divider */}
          <AkhaPixelLine size={5} className="py-2" />

          {/* 2. SPICE LEVEL */}
          <section>
            <SpicySelector
              options={spicinessLevels}
              selected={passport.preferred_spiciness_id}
              onChange={handleSpiceChange}
            />
          </section>

          {/* Divider */}
          <AkhaPixelLine size={5} className="py-2" />

          {/* 3. DIETARY STYLE */}
          <section>
            <DietSelector options={dietOptions} selected={passport.dietary_profile} onChange={handleDietChange} />

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


    </div>
  );
};

export default UserSettings;
