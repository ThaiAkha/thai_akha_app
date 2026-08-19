/**
 * 🛒 MARKET RUNNER - la logistica fa la spesa: sceglie una lista salvata, spunta gli acquisti
 * con il prezzo reale, salva o conferma (email all'ufficio + lock).
 * Shell (#16 split monstre): stato/azioni in ./marketRunner/useMarketRunner, viste
 * RunPickerView (scelta lista) e RunShoppingView (spesa in corso). Qui solo la composizione.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { useMarketRunner } from './marketRunner/useMarketRunner';
import { RunPickerView } from './marketRunner/RunPickerView';
import { RunShoppingView } from './marketRunner/RunShoppingView';

const MarketRunner: React.FC = () => {
    const { t } = useTranslation('market');
    // ✅ AppHeader handles setPageHeader automatically
    usePageMetadata('admin-market-run');
    const r = useMarketRunner();

    if (r.loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="loader">{t('messages.loading')}</div>
            </div>
        );
    }

    // Lista non ancora scelta → elenco delle liste logistiche salvate; altrimenti la spesa in corso.
    if (!r.activeRun) return <RunPickerView r={r} />;
    return <RunShoppingView r={r} />;
};

export default MarketRunner;
