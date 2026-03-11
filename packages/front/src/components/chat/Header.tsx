import React from 'react';
import { Typography, Button } from '../ui/index';
import { HeaderMetadata } from '../layout/Header';

interface HeaderProps {
  data?: HeaderMetadata;
}

/**
 * COMPONENTE HEADER UNIFICATO (Legacy fallback per Chat Folder)
 * Nota: Si raccomanda l'uso di components/layout/Header per nuovi sviluppi.
 */
const Header: React.FC<HeaderProps> = ({ data }) => {
  if (!data) return null;

  return (
    <header className="
      app-header-layout
      w-full
      transition-all
      duration-700
      motion-safe:animate-fade-slide-down
    ">      
      <Button 
        // Fix: Changed 'badge' to 'mineral' as 'badge' is not a valid variant kha
        variant="mineral" 
        size="xs" 
        className="mb-8"
      >
        <span className="material-symbols-outlined animate-icon-pulse text-[14px] md:text-[18px]">
          {data.icon}
        </span>
        <Typography variant="badge" as="span" className="text-current">
          {data.badge}
        </Typography>
      </Button>

      <div className="mb-0">
        {/* Fix: Changed 'headingL' to 'h1' as 'headingL' is not a valid variant kha */}
        <Typography variant="h1" as="h1">
          <Typography variant="titleMain">
            {data.titleMain}
          </Typography>
          <Typography variant="titleHighlight" color="action">
            {data.titleHighlight}
          </Typography>
        </Typography>
      </div>

      <div className="h-[2px] w-[120px] max-w-full bg-primary rounded-full opacity-90 mt-4 mb-6" />

      <div className="w-full">
        <Typography variant="paragraphL">
          {data.description}
        </Typography>
      </div>
    </header>
  );
};

export default Header;