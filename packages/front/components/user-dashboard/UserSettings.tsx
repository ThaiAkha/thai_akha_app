import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../services/authService';
import { contentService } from '../../services/contentService';
import { DIETARY_KNOWLEDGE_BASE } from '../../data/dietaryKnowledge'; 
import {
  Card, Typography, Button, Icon, Slider, Badge, Input, Alert, Divider, Avatar
} from '../ui';
import { cn } from '../../lib/utils';

interface UserSettingsProps {
  userProfile: UserProfile | null;
  spicinessLevels: any[];
  onBack: () => void; // Manteniamo per compatibilità con UserPage
  onUpdate: () => void;
}

interface DietOption {
  id: string;
  name: string;
  icon: string;
  type: 'lifestyle' | 'religious';
  description: string;
}

const ALLERGIES_LIST = [
  'Peanuts', 'Shellfish', 'Gluten', 'Soy', 'Eggs', 'Dairy', 'Sesame'
];

const UserSettings: React.FC<UserSettingsProps> = ({
  userProfile,
  spicinessLevels,
  onUpdate
}) => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data State
  const [dietOptions, setDietOptions] = useState<DietOption[]>([]);

  // Form State
  const [fullName, setFullName] = useState('');
  const [diet, setDiet] = useState<string>('diet_regular');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [spiceId, setSpiceId] = useState<number>(2);

  // --- INIT DATA ---
  useEffect(() => {
    const init = async () => {
      const profiles = await contentService.getDietaryProfiles();
      if (profiles) setDietOptions(profiles);
      setDataLoading(false);
    };
    init();
  }, []);

  // --- SYNC USER PROFILE ---
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setDiet(userProfile.dietary_profile || 'diet_regular');
      setAllergies(userProfile.allergies || []);
      // @ts-ignore
      setSpiceId(userProfile.preferred_spiciness_id || 2);
    }
  }, [userProfile]);

  // --- HANDLERS ---
  const handleSave = async () => {
    if (!userProfile) return;
    setLoading(true);
    setSuccessMsg(null);

    try {
      const cleanAllergies = allergies.filter(a => a && a.trim() !== '');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          dietary_profile: diet,
          allergies: cleanAllergies as any,
          preferred_spiciness_id: spiceId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      setSuccessMsg("Passport updated successfully kha!");
      setTimeout(() => setSuccessMsg(null), 3000);
      onUpdate(); 
    } catch (err) {
      console.error("Profile Save Error:", err);
      alert("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergy = (allergen: string) => {
    setAllergies(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen) 
        : [...prev, allergen]
    );
  };

  // --- MEMOIZED DATA ---
  const selectedDietInfo = dietOptions.find(d => d.id === diet);
  const currentSpiceLevel = spicinessLevels.find(l => l.id === spiceId);

  // Helper per recuperare il testo di sicurezza dell'allergia
  const getAllergyInfo = (allergen: string) => {
    const key = allergen.toLowerCase() as keyof typeof DIETARY_KNOWLEDGE_BASE.allergyWarnings;
    return DIETARY_KNOWLEDGE_BASE.allergyWarnings[key] || "We will exclude this ingredient safely.";
  };

  return (
    <div className="w-full pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* === COLONNA SINISTRA: PERSONAL DATA (30%) === */}
        <div className="lg:col-span-4 space-y-6">
          <Card variant="glass" className="p-6 md:p-8 bg-surface dark:bg-[#121212]/60 border-border dark:border-white/10 shadow-xl relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-action opacity-80" />

            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <Avatar 
                  src={userProfile?.avatar_url} 
                  initials={fullName} 
                  size="2xl" 
                  className="border-4 border-surface dark:border-[#121212] shadow-2xl" 
                />
                <div className="absolute bottom-0 right-0 bg-action text-white p-1.5 rounded-full border-4 border-surface dark:border-[#121212] shadow-sm">
                  <Icon name="verified_user" size="sm" />
                </div>
              </div>
              
              <Typography variant="caption" className="text-desc/40 font-mono tracking-widest mb-1">
                DIGITAL PASSPORT
              </Typography>
              <Typography variant="h5" className="text-title font-black uppercase">
                {userProfile?.role === 'agency' ? 'Agency Partner' : 'Guest Chef'}
              </Typography>
            </div>

            <div className="space-y-5">
              <Input 
                label="Full Name" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                leftIcon="badge"
                className="font-bold"
              />
              <Input 
                label="Registered Email" 
                value={userProfile?.email || ''} 
                disabled 
                className="opacity-60 bg-black/5 dark:bg-white/5 cursor-not-allowed" 
                leftIcon="mail" 
              />
            </div>

            <div className="mt-8 pt-6 border-t border-border dark:border-white/10 flex justify-between items-center opacity-50">
               <span className="text-[9px] font-black uppercase tracking-widest">ID: {userProfile?.id.slice(0,8).toUpperCase()}</span>
               <Icon name="fingerprint" />
            </div>
          </Card>
        </div>

        {/* === COLONNA DESTRA: SETTINGS (70%) === */}
        <div className="lg:col-span-8 space-y-8">
          
          <Card variant="glass" padding="none" className="bg-surface dark:bg-[#1a1a1a] border-border dark:border-white/10 overflow-hidden shadow-2xl">
            
            <div className="p-6 md:p-10 space-y-10">

              {/* 1. ALLERGIES (Glass Action Style) */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-action/10 flex items-center justify-center text-action">
                      <Icon name="health_and_safety" size="sm"/>
                    </div>
                    <span className="font-display font-black text-lg text-title uppercase tracking-tight">Safety & Allergies</span>
                  </div>
                  {allergies.length > 0 && <Badge variant="solid" className="bg-action">{allergies.length} Active</Badge>}
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {ALLERGIES_LIST.map((allergen) => {
                    const isActive = allergies.includes(allergen);
                    return (
                      <button
                        key={allergen}
                        onClick={() => toggleAllergy(allergen)}
                        className={cn(
                          "px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2 shadow-sm",
                          isActive
                            // ACTION STYLE (Green/Glass)
                            ? "bg-action/10 border-action text-action shadow-[0_0_20px_-5px_rgba(152,201,60,0.3)] scale-105"
                            : "bg-surface dark:bg-white/5 border-border dark:border-white/10 text-desc/60 hover:bg-black/5 dark:hover:bg-white/10"
                        )}
                      >
                        {isActive ? <Icon name="check_circle" size="sm"/> : <Icon name="add_circle" size="sm" className="opacity-30"/>}
                        {allergen}
                      </button>
                    )
                  })}
                </div>

                {/* INFO CARDS (Compaiono se attivi) */}
                {allergies.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                    {allergies.map(a => (
                      <div key={a} className="flex gap-3 p-4 rounded-2xl bg-action/5 border border-action/20">
                        <Icon name="info" className="text-action mt-0.5" size="sm"/>
                        <div>
                          <div className="text-[10px] font-black uppercase text-action tracking-widest mb-1">{a} Protocol</div>
                          <div className="text-xs text-desc/80 font-medium leading-relaxed">
                            "{getAllergyInfo(a)}"
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <Divider variant="mineral" />

              {/* 2. SPICE LEVEL */}
              <section>
                <div className="flex justify-between items-end mb-6">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Icon name="local_fire_department" size="sm"/>
                    </div>
                    <span className="font-display font-black text-lg text-title uppercase tracking-tight">Spice Tolerance</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-black uppercase text-desc/40 tracking-widest">Selected Level</span>
                    <span className="text-xl font-black text-primary" style={{ color: currentSpiceLevel?.color_code }}>
                      {currentSpiceLevel?.title || 'Medium'}
                    </span>
                  </div>
                </div>

                <div className="px-2">
                  <Slider 
                    value={spiceId} 
                    onChange={setSpiceId} 
                    min={1} 
                    max={5} 
                    step={1} 
                    className="mb-4"
                  />
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-desc/40">
                    <span>Mild</span>
                    <span>Medium</span>
                    <span>Spicy</span>
                    <span>Local</span>
                    <span>Warrior</span>
                  </div>
                </div>
              </section>

              <Divider variant="mineral" />

              {/* 3. DIET STYLE */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="size-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary-dark dark:text-secondary">
                    <Icon name="restaurant_menu" size="sm"/>
                  </div>
                  <span className="font-display font-black text-lg text-title uppercase tracking-tight">Dietary Style</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {dietOptions.map(opt => {
                    const isActive = diet === opt.id;
                    const isReligious = opt.type === 'religious';
                    
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setDiet(opt.id)}
                        className={cn(
                          "group p-4 rounded-2xl border text-left flex items-center gap-4 transition-all duration-300 relative overflow-hidden shadow-sm",
                          isActive
                            ? "bg-secondary/10 border-secondary text-title shadow-md ring-1 ring-secondary/50"
                            : "bg-surface dark:bg-white/5 border-border dark:border-white/10 text-desc/60 hover:bg-black/5 dark:hover:bg-white/10"
                        )}
                      >
                        <span className="text-2xl z-10">{opt.icon}</span>
                        <div className="z-10 min-w-0">
                          <div className={cn("text-xs font-black uppercase tracking-wide truncate", isActive ? "text-title" : "text-desc")}>{opt.name}</div>
                          <div className="text-[10px] opacity-60 mt-0.5 font-mono">{isReligious ? 'Strict Compliance' : 'Lifestyle'}</div>
                        </div>
                        {isActive && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary opacity-100 z-10 animate-in zoom-in"><Icon name="verified" size="sm"/></div>}
                      </button>
                    );
                  })}
                </div>

                {/* BANNER INFORMATIVO DIETA */}
                {selectedDietInfo && (
                  <div className="bg-surface dark:bg-black/40 border border-border dark:border-white/10 p-5 rounded-2xl animate-in fade-in flex gap-4 shadow-inner">
                    <Icon name="tips_and_updates" className="text-secondary mt-1 shrink-0" />
                    <div>
                      <Typography variant="caption" className="text-secondary font-black uppercase tracking-widest mb-1 block">
                        Our Kitchen Promise
                      </Typography>
                      <Typography variant="body" className="text-sm text-desc font-medium leading-relaxed">
                        {selectedDietInfo.description}
                      </Typography>
                    </div>
                  </div>
                )}
              </section>

            </div>

            {/* 4. FOOTER CONFERMA */}
            <div className="p-6 md:p-8 bg-black/5 dark:bg-white/5 border-t border-border dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-desc/60 text-xs">
                    {successMsg ? (
                        <span className="text-action font-bold flex items-center gap-2 animate-fade-in">
                            <Icon name="check_circle" size="sm"/> Settings Saved
                        </span>
                    ) : (
                        <span>Review your details before saving.</span>
                    )}
                </div>
                <Button 
                    variant="brand" 
                    size="xl" 
                    className="w-full md:w-auto px-12 shadow-brand-glow" 
                    onClick={handleSave} 
                    isLoading={loading}
                    icon="save"
                >
                    Confirm Passport
                </Button>
            </div>

          </Card>
        </div>

      </div>
    </div>
  );
};

export default UserSettings;