/**
 * 🛒 MARKET SHOP - planner spese mercato (Logistics Mon/Thu · Teacher/Kitchen giornaliero).
 * Shell (#16 split monstre): stato e azioni in ./marketShop/useMarketShop, colonna centrale,
 * pannello bozza e modali nei componenti della stessa cartella. Qui solo la composizione.
 */
import React from 'react';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import PageContainer from '../../components/layout/PageContainer';
import { useMarketShop } from './marketShop/useMarketShop';
import { MarketShopCenter } from './marketShop/MarketShopCenter';
import { MarketShopDraftPane } from './marketShop/MarketShopDraftPane';
import { MarketShopModals } from './marketShop/MarketShopModals';

const MarketShop: React.FC = () => {
  // ✅ AppHeader handles setPageHeader automatically
  usePageMetadata('admin-market-plan'); // sets the page header via AppHeader (no banner here)
  // Nota ordine: gli effetti di useMarketShop (fetch, launch da sessionStorage) partono prima
  // della query metadata; non condividono nulla, nessuna differenza osservabile.
  const shop = useMarketShop();

  return (
    <PageContainer className="h-[calc(100vh-64px)]">
      <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">

        {/* CENTER PANE — takes the remaining width */}
        <div className="flex-1 min-w-0 flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <MarketShopCenter s={shop} />
        </div>

        {/* RIGHT PANE — tablet (lg) −10%, desktop (xl) −20% vs the old 1/3 */}
        <div className="lg:shrink-0 lg:basis-[30%] xl:basis-[26.5%] flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <MarketShopDraftPane s={shop} />
        </div>
      </div>

      <MarketShopModals s={shop} />
    </PageContainer>
  );
};

export default MarketShop;
