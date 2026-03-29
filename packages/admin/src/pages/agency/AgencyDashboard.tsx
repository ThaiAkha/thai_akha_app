import { useTranslation } from "react-i18next";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentBookings from "../../components/booking/RecentBookings";
import AgencyRecentBookings from "../../components/booking/AgencyRecentBookings";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import PageContainer from "../../components/layout/PageContainer";

// QuickActions removed per design decision
// ✅ AppHeader handles metadata loading automatically

export default function AgencyDashboard() {
    const { t } = useTranslation('pages');

    return (
        <>
            <PageMeta
                title={t('agencyDashboard.metaTitle')}
                description={t('agencyDashboard.metaDesc')}
            />
            <PageContainer variant="wide">

                <div className="pb-20 space-y-8">
                    <div className="col-span-12 space-y-6">
                        <EcommerceMetrics />

                        <div className="col-span-12 xl:col-span-6">
                            <AgencyRecentBookings />
                        </div>

                        <div className="col-span-12 xl:col-span-6">
                            <RecentBookings />
                        </div>

                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 xl:col-span-7">
                                <MonthlySalesChart />
                            </div>

                            <div className="col-span-12 xl:col-span-5">
                                <MonthlyTarget />
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Demographic */}
                    <div className="col-span-12">
                        <DemographicCard />
                    </div>
                </div>
            </PageContainer>
        </>
    );
}
