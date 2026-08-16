import { useState, useEffect } from 'react';
import { contentService } from '@thaiakha/shared/services';

export interface DietarySubstitution {
  original: string;
  substitute: string;
  alt_substitute?: string | null;
}

export interface DietaryProfile {
  id: string;
  name: string;
  icon: string;
  description: string;
  description_long?: string | null;
  experience?: string;
  substitutions: DietarySubstitution[];
  type?: string;
  image_url?: string;
  display_order?: number;
  [key: string]: unknown;
}

export function useDietaryKnowledge() {
  const [profiles, setProfiles] = useState<DietaryProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const p = await contentService.getDietaryProfiles();
        
        // Ensure type safety or mapping if needed
        const mappedProfiles: DietaryProfile[] = (p as any[]).map(profile => ({
          id: profile.id,
          name: profile.name,
          icon: profile.icon || 'restaurant',
          description: profile.description || '',
          description_long: profile.description_long ?? null,
          experience: profile.experience,
          type: profile.type,
          image_url: profile.image_url,
          display_order: profile.display_order,
          substitutions: profile.substitutions || []
        }));

        // Explicit sorting by display_order
        mappedProfiles.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        setProfiles(mappedProfiles);
      } catch (error) {
        console.error("Error fetching dietary knowledge:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getProfileData = (slug: string) => {
    return profiles.find(p => p.id === slug);
  };

  const getDietProfiles = () => {
    return profiles.filter(p => p.type !== 'allergy');
  };

  const getAllergyProfiles = () => {
    return profiles.filter(p => p.type === 'allergy');
  };

  return {
    profiles,
    loading,
    getProfileData,
    getDietProfiles,
    getAllergyProfiles
  };
}
