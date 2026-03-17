import React from 'react';
import { useTranslation } from 'react-i18next';
import PageContainer from '../../components/layout/PageContainer';
import PageMeta from '../../components/common/PageMeta';
import { useAdminBooking } from '../../hooks/useAdminBooking';

// Components
import BookingSidebar from '../../components/admin/booking/BookingSidebar';
import BookingContent from '../../components/admin/booking/BookingContent';
import BookingInspector from '../../components/admin/booking/BookingInspector';

const ManagerBooking: React.FC = () => {
    const { t } = useTranslation('booking');
    const {
        date, setDate,
        session, setSession,
        userMode, setUserMode,
        pax, setPax,
        maxPax,
        loading,
        availability,
        newUser, setNewUser,
        selectedUser, setSelectedUser,
        searchTerm, setSearchTerm,
        searchResults,
        hotelSearchQuery, setHotelSearchQuery,
        hotelSearchResults,
        handleHotelSelect,
        pickupZone,
        hasLuggage, setHasLuggage,
        notes, setNotes,
        amount,
        paymentStatus, setPaymentStatus,
        handleCreate,
        currentSessionData,
        meetingPoints,
        meetingPoint, setMeetingPoint,
        hotel, setHotel
    } = useAdminBooking();

    return (
        <PageContainer variant="full">
            <PageMeta title={t('meta.manualTitle')} description={t('meta.manualDesc')} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">

                {/* --- LEFT COLUMN: DATE, SESSION, CARD (3/12) --- */}
                <BookingSidebar
                    date={date}
                    onDateChange={setDate}
                    session={session}
                    onSessionChange={setSession}
                    pax={pax}
                    onPaxChange={setPax}
                    maxPax={maxPax}
                    currentSessionData={currentSessionData}
                    availability={availability}
                />

                {/* --- CENTER COLUMN: DYNAMIC FORM (6/12) --- */}
                <BookingContent
                    userMode={userMode}
                    onUserModeChange={setUserMode}
                    newUser={newUser}
                    onNewUserChange={setNewUser}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    searchResults={searchResults}
                    selectedUser={selectedUser}
                    onSelectedUserChange={setSelectedUser}
                    hotelSearchQuery={hotelSearchQuery}
                    onHotelSearchQueryChange={setHotelSearchQuery}
                    hotelSearchResults={hotelSearchResults}
                    onHotelSelect={handleHotelSelect}
                    pickupZone={pickupZone}
                    notes={notes}
                    onNotesChange={setNotes}
                    hasLuggage={hasLuggage}
                    onHasLuggageChange={setHasLuggage}
                    meetingPoints={meetingPoints}
                    meetingPoint={meetingPoint}
                    onMeetingPointChange={setMeetingPoint}
                    onSetHotel={setHotel}
                    session={session}
                />

                {/* --- RIGHT COLUMN: SUMMARY (3/12) --- */}
                <BookingInspector
                    session={session}
                    pax={pax}
                    userMode={userMode}
                    newUser={newUser}
                    selectedUser={selectedUser}
                    hotel={hotel?.name}
                    meetingPoint={meetingPoint}
                    hasLuggage={hasLuggage}
                    notes={notes}
                    amount={amount}
                    paymentStatus={paymentStatus}
                    onPaymentStatusChange={setPaymentStatus}
                    onConfirm={handleCreate}
                    loading={loading}
                />

            </div>
        </PageContainer>
    );
};

export default ManagerBooking;
