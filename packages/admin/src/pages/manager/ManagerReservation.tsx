import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import { DataExplorerLayout, DataExplorerInspector } from '../../components/data-explorer';
import ClassPicker from '../../components/common/ClassPicker';

// Modular Components
import ReservationSidebar from '../../components/manager/reservation/ReservationSidebar';
import ReservationContent from '../../components/manager/reservation/ReservationContent';
import ReservationInspector from '../../components/manager/reservation/ReservationInspector';
import ReservationInspectorActions from '../../components/manager/reservation/ReservationInspectorActions';

// Logic Hook
import { useManagerReservation } from '../../hooks/useManagerReservation';

const ManagerReservation: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate: _onNavigate }) => {
    const {
        bookings,
        selectedBooking,
        editData,
        loading,
        isSaving,
        isEditing,
        globalDate,
        globalSession,
        setGlobalDate,
        setGlobalSession,
        setEditData,
        handleSelectBooking,
        handleEditStart,
        handleSave,
        handleCancelBooking,
        handleRestoreBooking,
        handleDeleteBooking,
        closeInspector,
    } = useManagerReservation();

    return (
        <>
            <PageMeta
                title="Manager Reservation | Thai Akha Kitchen"
                description="Manage daily reservations and client details."
            />

            <DataExplorerLayout
                viewMode="table"
                inspectorOpen={true}
                onInspectorClose={closeInspector}
                sidebar={
                    <ReservationSidebar
                        bookings={bookings}
                        activeBookingId={selectedBooking?.internal_id || null}
                        onSelectBooking={handleSelectBooking}
                    />
                }
                toolbar={
                    <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 shadow-sm shrink-0">
                        <ClassPicker
                            date={globalDate}
                            onDateChange={setGlobalDate}
                            session={globalSession}
                            onSessionChange={setGlobalSession}
                        />
                    </div>
                }
                inspector={
                    <DataExplorerInspector
                        isEditing={isEditing}
                        onClose={closeInspector}
                        headerActions={
                            <ReservationInspectorActions
                                isEditing={isEditing}
                                handleEditStart={handleEditStart}
                                handleSave={handleSave}
                                isSaving={isSaving}
                                selectedBooking={selectedBooking}
                            />
                        }
                    >
                        <ReservationInspector
                            selectedBooking={selectedBooking}
                            isEditing={isEditing}
                            editData={editData}
                            onEditChange={setEditData}
                        />
                    </DataExplorerInspector>
                }
            >
                <ReservationContent
                    loading={loading}
                    bookings={bookings}
                    selectedBookingId={selectedBooking?.internal_id || null}
                    onCancelBooking={handleCancelBooking}
                    onRestoreBooking={handleRestoreBooking}
                    onDeleteBooking={handleDeleteBooking}
                />
            </DataExplorerLayout>
        </>
    );
};

export default ManagerReservation;
