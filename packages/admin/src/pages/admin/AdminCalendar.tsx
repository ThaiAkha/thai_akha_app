import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageGrid from '../../components/layout/PageGrid';
import PageMeta from '../../components/common/PageMeta';
import { useAdminCalendar } from '../../hooks/useAdminCalendar';

// Components
import CalendarSidebar from '../../components/admin/calendar/CalendarSidebar';
import CalendarContent from '../../components/admin/calendar/CalendarContent';
import CalendarInspector from '../../components/admin/calendar/CalendarInspector';

const AdminCalendar: React.FC = () => {
    // ✅ AppHeader handles setPageHeader automatically
    const {
        viewDate,
        availability,
        loading,
        dayBookings,
        selectedDate,
        isEditing, setIsEditing,
        isBulkMode, setIsBulkMode,
        selectedDates,
        bulkSessionType, setBulkSessionType,
        editState,
        handleDateClick,
        handleSaveBatch,
        calendarDays,
        handlePrev,
        handleNext,
        updateEditState,
        isPastDate,
        canNavigateToPreviousMonth
    } = useAdminCalendar();

    return (
        <PageContainer variant="full" className="h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-gray-950/50">
            <PageMeta title="Admin Dashboard | Thai Akha Kitchen" description="Gestione calendari." />
            <PageGrid columns={12} className="h-full gap-6">

                {/* LEFT COLUMN (2/12) */}
                <CalendarSidebar
                    selectedDate={selectedDate}
                    availability={availability}
                    dayBookings={dayBookings}
                    isBulkMode={isBulkMode}
                />

                {/* CENTER COLUMN (7/12) */}
                <CalendarContent
                    viewDate={viewDate}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    isBulkMode={isBulkMode}
                    onBulkModeChange={setIsBulkMode}
                    bulkSessionType={bulkSessionType}
                    onBulkSessionTypeChange={setBulkSessionType}
                    calendarDays={calendarDays}
                    availability={availability}
                    loading={loading}
                    selectedDate={selectedDate}
                    selectedDates={selectedDates}
                    handleDateClick={handleDateClick}
                    canNavigatePrev={canNavigateToPreviousMonth()}
                    isPastDate={isPastDate}
                />

                {/* RIGHT COLUMN (3/12) */}
                <CalendarInspector
                    isBulkMode={isBulkMode}
                    selectedDate={selectedDate}
                    selectedDates={selectedDates}
                    availability={availability}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    bulkSessionType={bulkSessionType}
                    editState={editState}
                    updateEditState={updateEditState}
                    onSave={handleSaveBatch}
                    onCancel={() => {
                        setIsEditing(false);
                        if (isBulkMode) setIsBulkMode(false);
                    }}
                />

            </PageGrid>
        </PageContainer>
    );
};

export default AdminCalendar;
