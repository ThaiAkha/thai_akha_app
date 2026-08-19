/**
 * 📊 MANAGER REPORTS — unified 3-column reports hub (like Store POS).
 * Left: report type · Center: report list (2 views) · Right: single report detail.
 * Wired: DRIVER — center shows ALL drivers (avatar + name).
 *   • "In corso": weeks not yet paid+billed.
 *   • "Archivio": pick a driver → weeks paid AND billed in Zoho.
 * Wired: MARKET · KITCHEN (teacher) + MARKET · LOGISTIC — identical flow, only
 * shopper_role differs. 1 market_run = 1 report (date · items · total).
 *   • "In corso": runs not yet expensed · "Archivio": expensed runs.
 *   • Print/PDF via render-report 'market_run'. Zoho expensing TBD (no edge yet).
 * Wired: AGENCY bookings · CLASSES (POS daily invoices) · SALARY roster.
 *
 * Shell (#16 split): questo file compone i 4 report; dati/azioni/UI di ciascuno
 * vivono in `./reports/<dominio>/` (hook `useXxx` + viste). Il tipo di report e
 * la vista In progress/Archive (condivisa da driver/market/agency) stanno qui.
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataExplorerLayout, DataExplorerSidebar } from '../../components/data-explorer';
import SalaryRoster from '../../components/manager/SalaryRoster';
import { InspectorShell } from '../../components/ui/inspector/InspectorShell';
import { SegmentedToggle } from '../../components/reports';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { Truck, GraduationCap, Package, Briefcase, History, Clock, Archive, Wallet } from 'lucide-react';
import { isMarketType, marketScope, type ReportType, type DriverView } from './reports/shared';
import { useDriverReports } from './reports/driver/useDriverReports';
import { DriverToolbarExtras, DriverCenter, DriverInspector } from './reports/driver/DriverReports';
import { useMarketReports } from './reports/market/useMarketReports';
import { MarketToolbarExtras, MarketCenter, MarketInspector } from './reports/market/MarketReports';
import { useAgencyReports } from './reports/agency/useAgencyReports';
import { AgencyToolbarExtras, AgencySearch, AgencyCenter, AgencyInspector } from './reports/agency/AgencyReports';
import { usePosClasses } from './reports/pos/usePosClasses';
import { PosToolbar, PosCenter } from './reports/pos/PosClasses';

const ManagerReports: React.FC = () => {
    const { t } = useTranslation('manager');
    usePageMetadata('manager-reports');
    const [reportType, setReportType] = useState<ReportType>('driver');
    // In progress / Archive: asse condiviso da driver, market e agency.
    const [view, setView] = useState<DriverView>('active');

    const isMarket = isMarketType(reportType);
    const isTeacher = reportType === 'market_teacher';
    // I 4 hook sono sempre montati (query accese solo per il tab attivo). `busy`/`reportBusy`
    // sono per-dominio: prima erano flag unici, per cui un'azione in volo (es. pay&bill driver)
    // bloccava anche i pulsanti di un altro tab. Lock accidentale, non preservato di proposito.
    // Slot UI: ogni dominio espone ToolbarExtras/Center/Inspector che ricevono il proprio
    // oggetto hook (`d`/`m`/`a`/`p`) + cio' che possiede la shell (`view`, `isTeacher`).
    const driver = useDriverReports(reportType === 'driver');
    const market = useMarketReports(isMarket ? marketScope(reportType) : null);
    const agency = useAgencyReports(reportType === 'agency');
    const pos = usePosClasses(reportType === 'classes');

    // --- Sidebar: report types ---
    const TYPES: { id: ReportType; label: string; icon: React.ReactNode; enabled: boolean }[] = [
        { id: 'driver', label: t('reports.typeDriver', { defaultValue: 'Driver' }), icon: <Truck className="w-5 h-5" />, enabled: true },
        { id: 'market_teacher', label: t('reports.typeTeacher', { defaultValue: 'Market · Kitchen' }), icon: <GraduationCap className="w-5 h-5" />, enabled: true },
        { id: 'market_logistic', label: t('reports.typeLogistic', { defaultValue: 'Market · Logistic' }), icon: <Package className="w-5 h-5" />, enabled: true },
        { id: 'agency', label: t('reports.typeAgency', { defaultValue: 'Agency bookings' }), icon: <Briefcase className="w-5 h-5" />, enabled: true },
        { id: 'classes', label: t('reports.typeClasses', { defaultValue: 'Classes' }), icon: <GraduationCap className="w-5 h-5" />, enabled: true },
        { id: 'salary', label: t('reports.typeSalary', { defaultValue: 'Salary' }), icon: <Wallet className="w-5 h-5" />, enabled: true },
    ];
    const sidebarItems = TYPES.map(ty => ({
        id: ty.id, label: ty.label, icon: ty.icon,
        ...(ty.enabled ? {} : { badgeType: 'outline' as const, badgeValue: t('reports.soon', { defaultValue: 'soon' }) }),
    }));

    // Cambio tipo: ogni report azzera la propria selezione, la shell riparte da In progress.
    const selectType = (id: string) => {
        const ty = TYPES.find(x => x.id === id);
        if (!ty?.enabled) return;
        setReportType(id as ReportType);
        driver.reset(); market.reset(); agency.reset();
        setView('active');
    };
    // Cambio vista In progress/Archive: chiude le selezioni aperte (di tutti i domini:
    // solo quello visibile ne ha una, quindi equivale al vecchio reset per-ramo).
    const selectView = (v: DriverView) => {
        setView(v);
        driver.clearSelection(); market.clearSelection(); agency.clearAgencySel();
    };

    const viewToggle = (
        <SegmentedToggle<DriverView>
            value={view}
            onChange={selectView}
            options={[
                { id: 'active', label: t('reports.viewActive', { defaultValue: 'In progress' }), icon: <Clock className="w-4 h-4" /> },
                { id: 'archive', label: t('reports.viewArchive', { defaultValue: 'Archive' }), icon: <Archive className="w-4 h-4" /> },
            ]}
        />
    );

    return (
        <DataExplorerLayout
            viewMode="table"
            inspectorOpen={reportType === 'driver' || isMarket || reportType === 'agency'}
            onInspectorClose={() => { driver.clearSelection(); market.setSelectedRunId(null); agency.clearAgencySel(); }}
            sidebar={
                <DataExplorerSidebar
                    title={t('reports.title', { defaultValue: 'Reports' })}
                    titleIcon={<History className="w-5 h-5" />}
                    items={sidebarItems}
                    selectedId={reportType}
                    onSelect={selectType}
                />
            }
            toolbar={
                <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                    {reportType === 'driver' && (<>{viewToggle}<DriverToolbarExtras d={driver} view={view} /></>)}
                    {isMarket && (<><MarketToolbarExtras m={market} isTeacher={isTeacher} />{viewToggle}</>)}
                    {reportType === 'agency' && (<><AgencyToolbarExtras a={agency} />{viewToggle}<AgencySearch a={agency} /></>)}
                    {reportType === 'classes' && <PosToolbar p={pos} />}
                    <div className="flex-1" />
                </div>
            }
            inspector={
                <InspectorShell>
                    {isMarket ? <MarketInspector m={market} view={view} isTeacher={isTeacher} />
                        : reportType === 'agency' ? <AgencyInspector a={agency} />
                        : <DriverInspector d={driver} />}
                </InspectorShell>
            }
        >
            {/* CENTER */}
            {reportType === 'salary' ? (
                <SalaryRoster onOpenDriverPayouts={() => setReportType('driver')} />
            ) : reportType === 'classes' ? (
                <PosCenter p={pos} />
            ) : isMarket ? (
                <MarketCenter m={market} view={view} isTeacher={isTeacher} />
            ) : reportType === 'agency' ? (
                <AgencyCenter a={agency} view={view} />
            ) : (
                <DriverCenter d={driver} view={view} />
            )}
        </DataExplorerLayout>
    );
};

export default ManagerReports;
