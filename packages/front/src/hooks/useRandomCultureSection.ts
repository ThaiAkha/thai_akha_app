import { useState, useEffect } from 'react';
import { CultureSection } from '@thaiakha/shared/types';
import { contentService } from '@thaiakha/shared/services';

export function useRandomCultureSection() {
  const [section, setSection] = useState<CultureSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentService.getCultureSections()
      .then(sections => {
        const withImage = sections.filter(s => s.primary_image);
        if (withImage.length > 0) {
          const idx = Math.floor(Math.random() * withImage.length);
          setSection(withImage[idx]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { section, loading };
}
