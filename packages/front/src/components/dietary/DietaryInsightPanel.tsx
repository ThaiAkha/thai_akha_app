import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Typography, Icon } from '../ui/index';
import { cn } from '../../lib/utils';

interface DietaryInsightPanelProps {
  profileId: string;
  activeAllergies: string[];
}

const DietaryInsightPanel: React.FC<DietaryInsightPanelProps> = ({
  profileId,
  activeAllergies
}) => {
  const [profileData, setProfileData] = useState<any>(null);

  // Recupero dati rapido senza skeleton visivi
  useEffect(() => {
    const fetchData = async () => {
      if (!profileId) return;
      const dbSlug = `diet_${profileId}`;
      
      const { data } = await supabase
        .from('dietary_profiles')
        .select('name, icon, introduction')
        .eq('slug', dbSlug)
        .maybeSingle();

      if (data) setProfileData(data);
      else {
        // Fallback immediato per evitare flash
        setProfileData({
          name: profileId.charAt(0).toUpperCase() + profileId.slice(1) + " Diet",
          icon: "🍽️",
          introduction: "This diet allows standard ingredients with no specific restrictions."
        });
      }
    };
    fetchData();
  }, [profileId]);

  if (!profileData) return null;

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* 
         💎 MINERAL CARD "SERIA"
         - Niente scroll
         - Niente gradienti arcobaleno
         - Bordo sottile e professionale 
      */}
      <div className={cn(
        "relative overflow-hidden rounded-[2.5rem]",
        "bg-[#121212] border border-white/10 shadow-2xl", // Base scura solida
        "p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8"
      )}>
        
        {/* 1. ICONA GRANDE (Action Color) */}
        <div className="shrink-0">
          <div className="size-24 rounded-[2rem] bg-action/10 border border-action/20 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(152,201,60,0.2)]">
            <span className="text-5xl filter drop-shadow-md">{profileData.icon}</span>
          </div>
        </div>

        {/* 2. CONTENUTO TESTUALE (H4 + Paragraph M) */}
        <div className="space-y-3 text-center md:text-left flex-1">
          
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Typography variant="h4" className="text-white uppercase tracking-tight">
              {profileData.name}
            </Typography>
            
            {/* Indicatore Allergie (Discreto) */}
            {activeAllergies.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                <Icon name="warning" size="xs" className="text-red-400" />
                <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">
                  {activeAllergies.length} Restrictions
                </span>
              </div>
            )}
          </div>

          <Typography variant="paragraphM" className="text-white/70 font-light leading-relaxed">
            {profileData.introduction}
          </Typography>

        </div>

      </div>
    </div>
  );
};

export default DietaryInsightPanel;