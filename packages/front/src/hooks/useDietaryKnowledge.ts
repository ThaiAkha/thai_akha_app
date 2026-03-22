import { useState, useEffect } from 'react';
import { contentService } from '@thaiakha/shared/services';

export interface DietarySubstitution {
  original: string;
  substitute: string;
}

export interface DietaryProfile {
  id: string;
  name: string;
  icon: string;
  description: string;
  experience?: string;
  substitutions: DietarySubstitution[];
  type?: string;
  image_url?: string;
  display_order?: number;
}

export interface AllergyKnowledge {
  allergy_key: string;
  warning_text: string;
}

export function useDietaryKnowledge() {
  const [profiles, setProfiles] = useState<DietaryProfile[]>([]);
  const [allergies, setAllergies] = useState<AllergyKnowledge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, a] = await Promise.all([
          contentService.getDietaryProfiles(),
          contentService.getAllergyKnowledge()
        ]);
        
        // Ensure type safety or mapping if needed
        const mappedProfiles: DietaryProfile[] = (p as any[]).map(profile => ({
          id: profile.id,
          name: profile.name,
          icon: profile.icon || 'restaurant',
          description: profile.description || '',
          experience: profile.experience,
          type: profile.type,
          image_url: profile.image_url,
          display_order: profile.display_order,
          substitutions: profile.substitutions || []
        }));

        // Explicit sorting by display_order
        mappedProfiles.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        setProfiles(mappedProfiles);
        setAllergies(a);
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

  const getAllergyWarning = (key: string) => {
    return allergies.find(a => a.allergy_key.toLowerCase() === key.toLowerCase())?.warning_text;
  };

  return {
    profiles,
    allergies,
    loading,
    getProfileData,
    getAllergyWarning
  };
}
