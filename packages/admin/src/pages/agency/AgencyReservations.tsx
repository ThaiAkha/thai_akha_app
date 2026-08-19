/**
 * 📅 AGENCY RESERVATIONS - le prenotazioni dell'agenzia loggata: lista · anteprima · inspector.
 * Shell (#16 split monstre): stato/dati in ./agencyReservations/useAgencyReservations, i 3 pannelli
 * nei componenti della stessa cartella. Qui solo la composizione della griglia.
 */
import PageContainer from '../../components/layout/PageContainer';
import PageGrid from '../../components/layout/PageGrid';
import PageMeta from '../../components/common/PageMeta';
import { useAgencyReservations } from './agencyReservations/useAgencyReservations';
import { ReservationsListPane } from './agencyReservations/ReservationsListPane';
import { ReservationPreviewPane } from './agencyReservations/ReservationPreviewPane';
import { ReservationInspectorPane } from './agencyReservations/ReservationInspectorPane';

export default function AgencyReservations() {
    const s = useAgencyReservations();

    return (
        <PageContainer className="h-[calc(100vh-180px)] flex flex-col no-scrollbar">
            <PageMeta
                title="Admin Dashboard | Thai Akha Kitchen"
                description="To be set up later."
            />

            <PageGrid columns={12} className="flex-1 min-h-0">
                <ReservationsListPane s={s} />
                <ReservationPreviewPane s={s} />
                <ReservationInspectorPane s={s} />
            </PageGrid>
        </PageContainer>
    );
}
