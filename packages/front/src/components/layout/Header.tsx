import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography, Badge } from '../ui/index';
import AkhaPixelPattern, { AkhaTheme } from '../divider/AkhaPixelPattern';

// ✅ 1. EXPORT INTERFACCIA (Top Level)
// Deve stare qui per essere importata da PageLayout senza errori circolari.
export interface HeaderMetadata {
  titleMain?: string | null;
  titleHighlight?: string | null;
  description?: string | null;
  badge?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
}

interface HeaderProps {
  data?: HeaderMetadata;
  gradientFrom?: string;
  gradientTo?: string;
  patternTheme?: AkhaTheme;
}

const Header: React.FC<HeaderProps> = ({ 
  data, 
  gradientFrom = 'primary', 
  gradientTo = 'action',
  patternTheme
}) => {
  if (!data) return null;

  // Se non specificato, inferiamo il tema dal gradiente (es. quiz-p -> quiz)
  const activePatternTheme = patternTheme || (gradientFrom === 'quiz-p' ? 'quiz' : 'akha');

  return (
    // ✅ Container centrato su tutti i breakpoint
    // max-width + gutter li dà il wrapper in PageLayout (stesso nodo → bordo allineato al main)
    <header className="w-full flex flex-col items-center text-center [padding-top:var(--space-fluid-xl)] [padding-bottom:var(--space-fluid-s)]">

      {/* BADGE SECTION - centrato */}
      <div className="[margin-bottom:var(--space-fluid-m)]">
        <Badge
          variant="mineral"
          icon={data.icon || 'restaurant'}
          size="sm"
          pulse={true}
          color={gradientFrom}
          className="pointer-events-none"
        >
          <Typography variant="badge" as="span">
            {data.badge}
          </Typography>
        </Badge>
      </div>

      {/* TITLE BLOCK - centrato */}
      {/* titleHighlight è dentro h1 per semantica SEO corretta — entrambe le parti
          della headline contribuiscono al textContent dell'H1 */}
      <h1 className="drop-shadow-2xl">
        <Typography
          variant="display1"
          as="span"
          className="block"
        >
          {data.titleMain}
        </Typography>
        {/* Space-only span: keeps H1 textContent as "Thai Akha Kitchen Cooking Classes · Chiang Mai"
            instead of "Thai Akha KitchenCooking Classes…" which crawlers would concat. */}
        {data.titleHighlight && <span aria-hidden="true"> </span>}

        {data.titleHighlight && (
          <Typography
            variant="display2"
            as="span"
            className={cn(
              "block [margin-top:var(--space-fluid-xs)] pe-[0.25em] pb-4 -mb-3 text-transparent bg-clip-text bg-gradient-to-r",
              `from-${gradientFrom} to-${gradientTo}`
            )}
          >
            {data.titleHighlight}
          </Typography>
        )}
      </h1>

      {/* DECORATIVE LINE */}
      <div className="[margin-top:var(--space-fluid-xs)] [margin-bottom:var(--space-fluid-s)]">
        <AkhaPixelPattern variant="line_simple" size={8} speed={30} theme={activePatternTheme} />
      </div>

      {/* DESCRIPTION - centrata */}
      <div className="w-full max-w-3xl">
        <Typography variant="paragraphM">
          {data.description}
        </Typography>
      </div>

    </header>
  );
};

export default Header;