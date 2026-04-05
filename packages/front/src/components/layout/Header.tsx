import React from 'react';
import { Typography, Badge } from '../ui/index';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';

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
}

const Header: React.FC<HeaderProps> = ({ data }) => {
  if (!data) return null;

  return (
    // ✅ Container centrato su tutti i breakpoint
    <header className="w-full max-w-[85rem] mx-auto flex flex-col items-center text-center [padding-top:var(--space-fluid-xl)] [padding-bottom:var(--space-fluid-s)]">

      {/* BADGE SECTION - centrato */}
      <div className="[margin-bottom:var(--space-fluid-m)]">
        <Badge
          variant="mineral"
          icon={data.icon || 'restaurant'}
          size="sm"
          pulse={true}
          className="pointer-events-none"
        >
          <Typography variant="badge" as="span">
            {data.badge}
          </Typography>
        </Badge>
      </div>

      {/* TITLE BLOCK - centrato */}
      <h1 className="drop-shadow-2xl">
        <Typography
          variant="display1"
          as="span"
          className="block"
        >
          {data.titleMain}
        </Typography>

        <Typography
          variant="display2"
          as="span"
          className="block mt-1 md:mt-0 pb-4 -mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-action"
        >
          {data.titleHighlight}
        </Typography>
      </h1>

      {/* DECORATIVE LINE */}
      <div className="[margin-top:var(--space-fluid-xs)] [margin-bottom:var(--space-fluid-s)]">
        <AkhaPixelPattern variant="line_simple" size={8} speed={30} />
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